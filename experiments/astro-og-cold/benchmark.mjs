// Run with Node (the same runtime as Astro), after a production content sync.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { transformWithOxc } from 'vite';
import { loadOgFonts } from '../../tools/content/og/fonts.ts';
import { readSiteConf } from '../../tools/content/site.ts';
const requireAstro = createRequire(import.meta.resolve('astro/package.json'));
const { parse } = requireAstro('devalue');
const root = process.cwd();
const temp = resolve('.cache/og-benchmark');
await mkdir(temp, { recursive: true });
const timings = { rasterWait: 0, encode: 0, calls: 0 };
globalThis.__ogTimings = timings;
async function compile(sourceFile, name, transform = x => x) {
  let source = transform(await readFile(sourceFile, 'utf8'));
  source = source.replaceAll('"satori"', JSON.stringify(import.meta.resolve('satori')))
    .replaceAll('"sharp"', JSON.stringify(requireAstro.resolve('sharp')))
    .replaceAll("'./text'", JSON.stringify(pathToFileURL(resolve('tools/content/og/text.ts')).href));
  const { code } = await transformWithOxc(source, sourceFile, { jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'Fragment' } });
  const file = resolve(temp, name + '.mjs');
  await writeFile(file, code);
  return import(pathToFileURL(file).href);
}
try {
  const { collectOgTargets, ogRenderInput } = await compile('tools/content/og/targets.ts', 'targets', s => s.replaceAll("'../time'", JSON.stringify(pathToFileURL(resolve('tools/content/time.ts')).href)));
  const { renderOgSvg } = await compile('tools/content/og/template.tsx', 'template');
  const resvgSource = 'tools/content/og/resvg.ts';
  const { createOgPngRenderer } = await compile(resvgSource, 'resvg', s => {
    if (process.env.OG_BENCH_ENCODER === 'resvg') {
      s = s.replace(/return sharp\(rendered\.pixels,[\s\S]*?\.toBuffer\(\);/, 'return rendered.asPng();');
    } else {
      s = s.replace('compressionLevel: 6', `compressionLevel: ${Number(process.env.OG_BENCH_COMPRESSION ?? 6)}`);
    }
    return s.replace('import { renderAsync }', 'import { renderAsync as originalRenderAsync }')
    .replace('type RenderPngOptions', `async function renderAsync(...args) {
      const start = performance.now();
      const image = await originalRenderAsync(...args);
      globalThis.__ogTimings.rasterWait += performance.now() - start;
      return { asPng() {
        const start = performance.now();
        const png = image.asPng();
        globalThis.__ogTimings.encode += performance.now() - start;
        globalThis.__ogTimings.calls++;
        return png;
      }, get pixels() { return image.pixels; }, width: image.width, height: image.height };
    }
    type RenderPngOptions`);
  });
  const data = parse(await readFile('.astro/data-store.json', 'utf8'));
  const entries = [...data.get('blog').values()];
  const posts = entries.filter(e => e.data.kind === 'post').map(e => e.data.value);
  const pages = entries.filter(e => e.data.kind === 'page').map(e => e.data.value);
  const site = await readSiteConf(root);
  const inputs = collectOgTargets({ site, posts, pages, publishedPosts: posts.filter(p => !p.isTranslation) }).map(t => ogRenderInput(t, site));
  const fonts = await loadOgFonts(root);
  const concurrency = Number(process.env.OG_RENDER_CONCURRENCY ?? 8);
  let next = 0, renderer, svgWait = 0, bytes = 0;
  if (process.env.OG_BENCH_OUTPUT) await mkdir(process.env.OG_BENCH_OUTPUT, { recursive: true });
  const hashes = new Array(inputs.length);
  const start = performance.now();
  await Promise.all(Array.from({length: concurrency}, async () => {
    while (next < inputs.length) {
      const index = next++;
      const svgStart = performance.now();
      const svg = await renderOgSvg({ ...inputs[index], fonts });
      svgWait += performance.now() - svgStart;
      renderer ??= createOgPngRenderer(svg, { scale: 1.5 });
      const png = await (await renderer)(svg);
      bytes += png.length;
      if (process.env.OG_BENCH_OUTPUT) await writeFile(resolve(process.env.OG_BENCH_OUTPUT, `${index}.png`), png);
      hashes[index] = createHash('sha256').update(png).digest('hex');
    }
  }));
  console.log(JSON.stringify({ concurrency, uv: process.env.UV_THREADPOOL_SIZE ?? 'default', count: inputs.length,
    wallMs: performance.now() - start, bytes, ...timings, svgWait, hashes }));
} finally {
  await rm(temp, { recursive: true, force: true });
}
