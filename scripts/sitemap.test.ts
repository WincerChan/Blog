import { expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AstroConfig, AstroIntegrationLogger } from 'astro';
import { buildSitemapMetadata, SITEMAP_METADATA_FILE } from '../tools/content/sitemap';
import { blogSitemap } from '../tools/astro/sitemap';

const site = { baseURL: 'https://example.com', title: 'Site', author: 'Author', description: '',
  sitemap: { changeFreq: 'weekly', priority: 0.6, termPriority: 0.3 } };
const post = { title: 'Article', slug: 'article', category: '分类',
  date: '2020-01-01', updated: '2021-02-03', lang: 'zh-CN',
  cover: '/cover.png?width=600&height=300',
  html: '<p>Hello</p><img src="/cover.png?width=600&height=300"><img src="/body.png" alt="A & B">' };
const translation = { ...post, slug: 'article-en', lang: 'en', isTranslation: true, updated: '2025-01-01' };

test('sitemap metadata preserves content dates, image metadata and existing translations', () => {
  const metadata = buildSitemapMetadata({ site, posts: [post, translation], pages: [] });
  const original = metadata['https://example.com/posts/article/'];
  expect(original.lastmod).toBe('2021-02-02T16:00:00.000Z');
  expect(original.img).toEqual([
    { url: 'https://example.com/cover.png?width=600&height=300', caption: 'cover' },
    { url: 'https://example.com/body.png', caption: 'A & B' },
  ]);
  expect(original.links).toEqual([
    { lang: 'zh-CN', url: 'https://example.com/posts/article/' },
    { lang: 'en', url: 'https://example.com/posts/article-en/' },
  ]);
  expect(metadata['https://example.com/posts/article-en/'].links).toEqual([
    { lang: 'en', url: 'https://example.com/posts/article-en/' },
    { lang: 'zh-CN', url: 'https://example.com/posts/article/' },
  ]);
  // Category dates follow original articles, not translated copies or the build clock.
  expect(metadata['https://example.com/category/%E5%88%86%E7%B1%BB/'].lastmod).toBe(original.lastmod);
  expect(metadata['https://example.com/category/%E5%88%86%E7%B1%BB/'].priority).toBe(0.3);
});

test('draft/deleted translations disappear; encrypted bodies cannot leak image URLs', () => {
  for (const posts of [[post], [post, { ...translation, draft: true }]]) {
    const metadata = buildSitemapMetadata({ site, posts, pages: [] });
    expect(metadata['https://example.com/posts/article/'].links).toBeUndefined();
    expect(metadata['https://example.com/posts/article-en/']).toBeUndefined();
  }
  const metadata = buildSitemapMetadata({ site,
    posts: [{ ...post, encrypted: true, html: '<img src="/private-image.png">' }],
    pages: [{ ...post, slug: 'about', cover: undefined }, { ...post, slug: 'draft-page', draft: true }],
  });
  expect(JSON.stringify(metadata)).not.toContain('private-image');
  expect(metadata['https://example.com/about/'].lastmod).toBe('2021-02-02T16:00:00.000Z');
  expect(metadata['https://example.com/draft-page/']).toBeUndefined();
  expect(metadata['https://example.com/']).toEqual({ url: 'https://example.com/', changefreq: 'daily', priority: 1 });
});

test('image entries are deduplicated, bounded and use web URLs', () => {
  const metadata = buildSitemapMetadata({ site, pages: [], posts: [{ ...post, cover: undefined,
    html: '<img src="data:image/png;base64,AAAA"><img src="javascript:alert(1)">' +
      Array.from({ length: 8 }, (_, n) => `<img src="/photo-${n}.png">`).join(''),
  }] });
  expect(metadata['https://example.com/posts/article/'].img?.map(image => image.url)).toEqual([
    'https://example.com/photo-0.png', 'https://example.com/photo-1.png', 'https://example.com/photo-2.png',
  ]);
});

test('official integration emits escaped image extensions, actual pages, XSL and stable dates', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-sitemap-'));
  const cacheDir = pathToFileURL(path.join(root, 'cache') + '/');
  const dir = pathToFileURL(path.join(root, 'dist') + '/');
  const diagnostics: string[] = [];
  const logger = { info() {}, warn(message: string) { diagnostics.push(message); },
    error(message: string) { diagnostics.push(message); } } as unknown as AstroIntegrationLogger;
  const integration = blogSitemap();
  const run = () => integration.hooks['astro:build:done']!({
    dir, pages: [{ pathname: '' }, { pathname: 'posts/article/' }, { pathname: '404/' },
      { pathname: 'new-static-page/' }], assets: new Map(), logger,
  });
  try {
    await mkdir(cacheDir);
    const metadata = buildSitemapMetadata({ site, posts: [post], pages: [] });
    // Metadata alone must never manufacture a route that Astro did not build.
    await writeFile(new URL(SITEMAP_METADATA_FILE, cacheDir), JSON.stringify(metadata));
    await integration.hooks['astro:config:done']!({ config: {
      cacheDir, site: site.baseURL, base: '/', trailingSlash: 'always', build: { format: 'directory' },
    } as AstroConfig, logger, buildOutput: 'static', setAdapter() {}, injectTypes() { return new URL('unused.d.ts', cacheDir); } });
    await integration.hooks['astro:routes:resolved']!({ routes: [], logger });
    await run();
    const xml = await readFile(new URL('sitemap-0.xml', dir), 'utf8');
    const index = await readFile(new URL('sitemap-index.xml', dir), 'utf8');
    expect(xml).toContain('<loc>https://example.com/new-static-page/</loc>');
    expect(xml).not.toContain('/404/');
    expect(xml).not.toContain('/category/');
    expect(xml).toContain('<image:loc>https://example.com/cover.png?width=600&amp;height=300</image:loc>');
    expect(xml).toContain('<image:caption>A &amp; B</image:caption>');
    expect(xml).toContain('href="https://example.com/sitemap.xsl"');
    expect(xml).toContain('<lastmod>2021-02-02T16:00:00.000Z</lastmod>');
    expect(index).toContain('<loc>https://example.com/sitemap-0.xml</loc>');
    expect(index).toContain('<lastmod>2021-02-02T16:00:00.000Z</lastmod>');
    await run();
    expect(await readFile(new URL('sitemap-0.xml', dir), 'utf8')).toBe(xml);
    expect(await readFile(new URL('sitemap-index.xml', dir), 'utf8')).toBe(index);
    expect(diagnostics).toEqual([]);
  } finally { await rm(root, { recursive: true, force: true }); }
});
