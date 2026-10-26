import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createPngCache } from './cache';
import { rendererDependencyFiles } from '../../build/rendererDependencies';
import { ogFontSources, loadOgFonts } from './fonts';
import { OG_PNG_SCALE, type OgRenderInput } from './targets';
import templateSource from './template.tsx?raw';
import textSource from './text.ts?raw';
import resvgSource from './resvg.ts?raw';
import fontsSource from './fonts.ts?raw';

// Vite tracks these as module dependencies. During HMR the fingerprint follows
// the loaded code, rather than reading a newer template before its module reloads.
const renderSources = [templateSource, textSource, resvgSource, fontsSource];
const rendererPackages = ['satori', '@resvg/resvg-js', 'sharp'];
let current: { signature: string; service: ReturnType<typeof createPngCache> } | undefined;
let dependencyGraph: { signature: string; files: string[] } | undefined;
let initialization: Promise<ReturnType<typeof createPngCache>> | undefined;

async function initialize() {
  const root = process.cwd();
  const lock = await stat(path.join(root, 'bun.lock'));
  const graphSignature = JSON.stringify([root, lock.mtimeMs, lock.ctimeMs, lock.size]);
  if (dependencyGraph?.signature !== graphSignature) {
    dependencyGraph = { signature: graphSignature, files: await rendererDependencyFiles(root, rendererPackages) };
  }
  const files = [
    ...dependencyGraph.files,
    ...ogFontSources(root).map(font => font.path),
  ];
  const signature = JSON.stringify(await Promise.all(files.map(async file => {
    const info = await stat(file);
    return [file, info.mtimeMs, info.ctimeMs, info.size];
  })));
  if (current?.signature === signature) return current.service;
  const hash = createHash('sha256').update(JSON.stringify([2, OG_PNG_SCALE, process.platform, process.arch, process.versions.node, renderSources]));
  for (const file of files) {
    const data = await readFile(file);
    hash.update(String(data.length)).update(':').update(data);
  }
  let resources: Promise<{
    fonts: Awaited<ReturnType<typeof loadOgFonts>>;
    renderOgSvg: typeof import('./template').renderOgSvg;
    createOgPngRenderer: typeof import('./resvg').createOgPngRenderer;
  }> | undefined;
  let pngRenderer: ReturnType<typeof import('./resvg').createOgPngRenderer> | undefined;
  const service = createPngCache({
    directory: path.join(root, '.cache/og'),
    version: hash.digest('hex'),
    async render(input) {
      // Cache hits do not load Satori/resvg or parse fonts.
      resources ??= Promise.all([loadOgFonts(root), import('./template'), import('./resvg')])
        .then(([fonts, template, resvg]) => ({ fonts, ...template, ...resvg }));
      const { fonts, renderOgSvg, createOgPngRenderer } = await resources;
      const svg = await renderOgSvg({ ...input, fonts });
      pngRenderer ??= createOgPngRenderer(svg, { scale: OG_PNG_SCALE });
      return (await pngRenderer)(svg);
    },
  });
  current = { signature, service };
  return service;
}

export async function getOgRenderer() {
  // A production build uses one immutable dependency snapshot. Dev still checks
  // fonts/package metadata so local edits invalidate without a process restart.
  if (import.meta.env.PROD && current) return current.service;
  if (initialization) return initialization;
  initialization = initialize();
  try { return await initialization; }
  finally { initialization = undefined; }
}

// Batch only this endpoint's work. Do not change Astro's concurrency for HTML routes.
export async function prepareOgImages(inputs: OgRenderInput[]) {
  const start = performance.now();
  const service = await getOgRenderer();
  const before = { ...service.stats };
  const configured = Number.parseInt(process.env.OG_RENDER_CONCURRENCY ?? '', 10);
  const concurrency = Number.isFinite(configured) ? Math.max(1, configured) : Math.min(8, Math.max(2, availableParallelism()));
  let cursor = 0;
  const results = await Promise.allSettled(Array.from({ length: Math.min(concurrency, inputs.length) }, async () => {
    while (cursor < inputs.length) await service.get(inputs[cursor++]);
  }));
  const failure = results.find(result => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
  console.log(`[og] ${inputs.length} images: ${service.stats.hits - before.hits} cached, ${service.stats.renders - before.renders} rendered in ${(performance.now() - start).toFixed(0)}ms`);
}
