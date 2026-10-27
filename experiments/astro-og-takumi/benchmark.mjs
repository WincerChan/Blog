// Run from the repository root with Node, matching Astro's production runtime.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir, cpus } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformWithOxc } from 'vite';
import { loadOgFonts } from '../../tools/content/og/fonts.ts';
import { readSiteConf } from '../../tools/content/site.ts';

const engine = process.argv[2] ?? 'baseline';
assert(['baseline', 'takumi', 'takumi-sharp', 'takumi-original'].includes(engine), 'Unknown renderer');
const concurrency = Number(process.env.OG_RENDER_CONCURRENCY ?? 8);
assert(Number.isSafeInteger(concurrency) && concurrency > 0, 'Invalid concurrency');
const root = process.cwd();
const temp = await mkdtemp(join(tmpdir(), 'blog-og-takumi-'));
const requireAstro = createRequire(import.meta.resolve('astro/package.json'));
const { parse } = requireAstro('devalue');
const hash = value => createHash('sha256').update(value).digest('hex');
const baselineRef = '0d3b92b';
const baselineFiles = new Set(['tools/content/og/template.tsx', 'tools/content/og/resvg.ts']);

async function compile(file, name, transform = source => source) {
  // Keep the original comparison reproducible after production migrates.
  let source = transform(baselineFiles.has(file)
    ? execFileSync('git', ['show', `${baselineRef}:${file}`], { cwd: root, encoding: 'utf8' })
    : await readFile(resolve(root, file), 'utf8'));
  for (const dependency of ['satori', 'sharp', '@resvg/resvg-js']) {
    source = source.replaceAll(JSON.stringify(dependency), JSON.stringify(import.meta.resolve(dependency)));
  }
  source = source.replaceAll("'./text'", JSON.stringify(pathToFileURL(resolve(root, 'tools/content/og/text.ts')).href))
    .replaceAll("'../time'", JSON.stringify(pathToFileURL(resolve(root, 'tools/content/time.ts')).href));
  const { code } = await transformWithOxc(source, file, {
    jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'Fragment' },
  });
  const target = join(temp, `${name}.mjs`);
  await writeFile(target, code);
  return import(pathToFileURL(target).href);
}

// Extract the baseline JSX tree without copying or modifying its design.
function extractTree(source) {
  const call = /return await satori\(root as any, \{\s*width: OG_WIDTH,\s*height: OG_HEIGHT,\s*fonts,\s*\}\);/g;
  assert.equal([...source.matchAll(call)].length, 1, 'Baseline template changed; inspect extraction');
  return source.replace('import satori from "satori";', '').replace(call, 'return root;');
}

function normalizeSvgDimensions(element) {
  if (!element || typeof element !== 'object') return;
  if (Array.isArray(element)) {
    element.forEach(normalizeSvgDimensions);
    return;
  }
  // fromJsx converts SVG width/height attributes with Number(); "100%" becomes
  // NaN. These two full-canvas decorations have known 1200 x 630 dimensions.
  if (element.type === 'svg') {
    if (element.props.width === '100%') element.props.width = 1200;
    if (element.props.height === '100%') element.props.height = 630;
  }
  normalizeSvgDimensions(element.props?.children);
}

try {
  const { collectOgTargets, ogRenderInput, OG_PNG_SCALE: defaultScale } = await compile('tools/content/og/targets.ts', 'targets');
  const OG_PNG_SCALE = Number(process.env.OG_BENCH_SCALE ?? defaultScale);
  assert(Number.isFinite(OG_PNG_SCALE) && OG_PNG_SCALE > 0
    && Number.isInteger(1200 * OG_PNG_SCALE) && Number.isInteger(630 * OG_PNG_SCALE), 'Invalid output scale');
  const storeBytes = await readFile('.astro/data-store.json');
  const entries = [...parse(storeBytes.toString()).get('blog').values()];
  const posts = entries.filter(entry => entry.data.kind === 'post').map(entry => entry.data.value);
  const pages = entries.filter(entry => entry.data.kind === 'page').map(entry => entry.data.value);
  const site = await readSiteConf(root);
  let targets = collectOgTargets({ site, posts, pages, publishedPosts: posts.filter(post => !post.isTranslation) });
  if (process.env.OG_BENCH_LIMIT) {
    const limit = Number(process.env.OG_BENCH_LIMIT);
    assert(Number.isSafeInteger(limit) && limit > 0, 'Invalid target limit');
    targets = targets.slice(0, limit);
  }
  const inputs = targets.map(target => ogRenderInput(target, site));
  const fonts = await loadOgFonts(root);
  const initStart = performance.now();
  let render;
  if (engine === 'baseline') {
    const { renderOgSvg } = await compile('tools/content/og/template.tsx', 'template');
    const { createOgPngRenderer } = await compile('tools/content/og/resvg.ts', 'resvg');
    let renderer;
    render = async input => {
      const svg = await renderOgSvg({ ...input, fonts });
      renderer ??= createOgPngRenderer(svg, { scale: OG_PNG_SCALE });
      return (await renderer)(svg);
    };
  } else {
    const { Renderer } = await import('takumi-js/node');
    const nativeFiles = Object.keys(createRequire(import.meta.url).cache)
      .filter(file => file.includes('@takumi-rs/core-') && file.endsWith('.node'));
    assert.equal(nativeFiles.length, 1, 'Benchmark requires one native Takumi backend');
    const { fromJsx } = await import('takumi-js/helpers/jsx');
    const { renderOgSvg: buildTree } = await compile('tools/content/og/template.tsx', 'tree', extractTree);
    const renderer = new Renderer();
    for (const font of fonts) await renderer.registerFont(font);
    const sharp = engine === 'takumi-sharp' ? (await import('sharp')).default : undefined;
    render = async input => {
      const tree = await buildTree({ ...input, fonts });
      if (engine !== 'takumi-original') normalizeSvgDimensions(tree);
      // The installed native renderer scales the drawing with DPR while width
      // and height remain output pixels. Keep the logical template at 1200x630.
      tree.props.style.width = 1200;
      tree.props.style.height = 630;
      const { node, css } = await fromJsx(tree);
      const bytes = await renderer.render(node, {
        width: 1200 * OG_PNG_SCALE, height: 630 * OG_PNG_SCALE, devicePixelRatio: OG_PNG_SCALE,
        format: sharp ? 'raw' : 'png', css,
        fontFamilies: [...new Set(fonts.map(font => font.name))],
      });
      return sharp ? sharp(bytes, {
        raw: { width: 1200 * OG_PNG_SCALE, height: 630 * OG_PNG_SCALE, channels: 4 },
      }).png({ compressionLevel: 6 }).toBuffer() : bytes;
    };
  }
  const initializationMs = performance.now() - initStart;
  let cursor = 0;
  const images = new Array(inputs.length);
  const cpuStart = process.cpuUsage();
  const start = performance.now();
  await Promise.all(Array.from({ length: Math.min(concurrency, inputs.length) }, async () => {
    while (cursor < inputs.length) {
      const index = cursor++;
      images[index] = await render(inputs[index]);
    }
  }));
  const wallMs = performance.now() - start;
  const cpu = process.cpuUsage(cpuStart);
  for (const png of images) {
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1200 * OG_PNG_SCALE);
    assert.equal(png.readUInt32BE(20), 630 * OG_PNG_SCALE);
  }
  const report = {
    engine, baselineRef, count: inputs.length, concurrency, scale: OG_PNG_SCALE, node: process.version,
    platform: process.platform, arch: process.arch, cpu: cpus()[0].model,
    uvThreadpoolSize: process.env.UV_THREADPOOL_SIZE ?? 'default',
    storeHash: hash(storeBytes), inputHash: hash(JSON.stringify(inputs)),
    fontHash: hash(Buffer.concat(fonts.map(font => font.data))),
    initializationMs, wallMs, cpuMs: (cpu.user + cpu.system) / 1000,
    maxRssKiB: process.resourceUsage().maxRSS,
    bytes: images.reduce((total, png) => total + png.length, 0),
    hashes: images.map(hash),
  };
  if (process.env.OG_BENCH_OUTPUT) {
    const output = resolve(process.env.OG_BENCH_OUTPUT);
    await mkdir(output, { recursive: true });
    for (let index = 0; index < images.length; index++) {
      await writeFile(join(output, `${index}.png`), images[index]);
    }
    await writeFile(join(output, 'manifest.json'), JSON.stringify(targets.map((target, index) => ({
      index, slug: target.slug, input: inputs[index],
    })), null, 2) + '\n');
  }
  if (process.env.OG_BENCH_REPORT) {
    await writeFile(process.env.OG_BENCH_REPORT, JSON.stringify(report, null, 2) + '\n');
  }
  const { hashes, ...summary } = report;
  console.log(JSON.stringify(summary));
} finally {
  await rm(temp, { recursive: true, force: true });
}
