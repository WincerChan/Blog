import { expect, spyOn, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { createArticleCache } from '../tools/content/renderCache';
import { markdownOptions } from '../tools/content/markdown';
import { blogLoader } from '../tools/content/loader';
import { blogSchema } from '../tools/content/collections';
import { fetchCommentsMapping } from '../tools/content/commentsMapping';
import computeSwHash from '../tools/build/swHash';
import { rendererDependencyFiles } from '../tools/build/rendererDependencies';
import { stableWind } from '../src/styles/unocss/stableWind';
import { SITEMAP_METADATA_FILE } from '../tools/content/sitemap';
import { createGenerator } from 'unocss';

const temporary = () => mkdtemp(path.join(os.tmpdir(), 'blog-pipeline-'));
const rendered = { html: '<p>public</p>', toc: '', summary: 'public', words: 1, searchText: 'public' };

test('public render cache handles restart, content/config changes, corruption and removal', async () => {
  const root = await temporary();
  try {
    const first = createArticleCache(root, 'v1');
    await first.write('posts/a.md', 'source', rendered);
    const restarted = createArticleCache(root, 'v1');
    expect(await restarted.read('posts/a.md', 'source')).toEqual(rendered);
    expect(await restarted.read('posts/a.md', 'edited')).toBeUndefined();
    expect(await createArticleCache(root, 'v2').read('posts/a.md', 'source')).toBeUndefined();
    await writeFile(path.join(root, (await readdir(root))[0]), '{broken');
    expect(await restarted.read('posts/a.md', 'source')).toBeUndefined();
    await restarted.write('posts/a.md', 'source', rendered);
    await restarted.write('posts/b.md', 'source', rendered);
    await restarted.prune(new Set(['posts/a.md']));
    expect((await readdir(root)).length).toBe(1);
    await restarted.discard('posts/a.md');
    expect(await readdir(root)).toEqual([]);
    await expect(restarted.write('posts/a.md', 'source', { ...rendered, encrypt_pwd: 'secret' } as any)).rejects.toThrow();
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('loader starts API early, skips drafts, reuses public renders and evicts private/deleted data', async () => {
  const root = await temporary();
  const originalFetch = globalThis.fetch;
  const savedSecret = process.env.INKSTONE_PUBLIC_TOKEN_SECRET;
  const savedEnv = process.env.NODE_ENV;
  const savedDebug = process.env.CONTENT_DEBUG;
  delete process.env.CONTENT_DEBUG;
  const log = spyOn(console, 'log').mockImplementation(() => {});
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  process.env.NODE_ENV = 'production';
  process.env.INKSTONE_PUBLIC_TOKEN_SECRET = 'pipeline-fixture-secret';
  let requested = false;
  globalThis.fetch = (async () => { requested = true; return Response.json({ items: [] }); }) as typeof fetch;
  const entries = new Map<string, any>();
  const renders: string[] = [];
  const article = (slug: string, extra = '', body = 'Public fixture') => `---\ntitle: Fixture\nslug: ${slug}\ndate: '2025-01-01'\nupdated: '2025-01-01'\n${extra}---\n${body}`;
  try {
    for (const dir of ['_blogs/content/posts', '_blogs/content/pages', 'public/favicon', 'tools/content']) await mkdir(path.join(root, dir), { recursive: true });
    // The fingerprint reads the same renderer/config inputs as a real build.
    for (const file of ['astro.config.mjs', 'bun.lock', 'tools/content/loader.ts', 'tools/content/renderCache.ts', 'tools/content/metadata.ts', 'tools/content/markdown.ts', 'tools/content/codeBlocks.ts', 'tools/content/shikiThemes.ts', 'tools/content/frontmatter.ts', 'tools/content/collections.ts', 'site.config.json', 'public/favicon/light.svg']) {
      await copyFile(file, path.join(root, file));
    }
    await writeFile(path.join(root, '_blogs/content/friends.json'), '[]');
    const publicFile = path.join(root, '_blogs/content/posts/public.md');
    await writeFile(publicFile, article('public'));
    await writeFile(path.join(root, '_blogs/content/posts/private.md'), article('private', 'encrypt_pwd: PRIVATE_PASSWORD_SENTINEL\n', 'Public introduction\n\n<!-- more -->\n\nPRIVATE_BODY_SENTINEL'));
    await writeFile(path.join(root, '_blogs/content/posts/draft.md'), article('draft', 'draft: true\n', 'DRAFT_BODY_SENTINEL'));
    const renderer = await markdownOptions.processor.createRenderer(markdownOptions);
    const context: any = {
      config: { root: pathToFileURL(root + '/'), publicDir: pathToFileURL(root + '/public/'),
        cacheDir: pathToFileURL(root + '/node_modules/.astro/') },
      store: { keys: () => entries.keys(), delete: (id: string) => entries.delete(id), set: (entry: any) => entries.set(entry.id, entry) },
      parseData: async (entry: any) => blogSchema.parse(entry.data),
      generateDigest: (value: any) => createHash('sha256').update(JSON.stringify(value)).digest('hex'),
      renderMarkdown: async (body: string) => {
        expect(requested).toBe(true);
        renders.push(body);
        const result = await renderer.render(body);
        return { html: result.code, metadata: result.metadata };
      },
      logger: { info() {} },
    };
    const load = async () => { requested = false; await blogLoader().load(context); };
    await load();
    expect(log.mock.calls).toHaveLength(0);
    // A successful API response can contain fewer mappings than published posts.
    expect(warn.mock.calls).toEqual([]);
    expect(renders).toHaveLength(2);
    expect(renders).not.toContain('DRAFT_BODY_SENTINEL');
    expect(entries.has('posts/draft')).toBe(false);
    const sitemapMetadata = () => readFile(new URL(SITEMAP_METADATA_FILE, context.config.cacheDir), 'utf8');
    expect(await sitemapMetadata()).not.toContain('PRIVATE_');
    expect(await sitemapMetadata()).not.toContain('/posts/draft/');
    log.mockClear();
    process.env.CONTENT_DEBUG = '1';
    await load();
    const debugLogs = log.mock.calls.map(([message]) => String(message));
    expect(debugLogs.some(message => message.startsWith('content:normalize:'))).toBe(true);
    expect(debugLogs.some(message => message.startsWith('content:emit:public-data:posts:'))).toBe(true);
    expect(debugLogs.some(message => message.startsWith('content:markdown:'))).toBe(true);
    const summaries = debugLogs.filter(message => message.startsWith('content:prepare:'));
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatch(/^content:prepare: \d+\.\dms \(comments HTTP wait: \d+\.\dms\)$/);
    delete process.env.CONTENT_DEBUG;
    log.mockClear();
    expect(renders).toHaveLength(3); // Only the private article renders again.
    const cacheDir = path.join(root, '.cache/content');
    const persisted = (await Promise.all((await readdir(cacheDir)).map(file => readFile(path.join(cacheDir, file), 'utf8')))).join('');
    expect(persisted).not.toContain('PRIVATE_');
    expect(persisted).not.toContain('DRAFT_');
    expect(JSON.stringify([...entries])).not.toContain('PRIVATE_PASSWORD_SENTINEL');
    expect(JSON.stringify([...entries])).not.toContain('PRIVATE_BODY_SENTINEL');
    await writeFile(publicFile, article('renamed', '', 'Edited fixture'));
    await load();
    expect(log.mock.calls).toHaveLength(0);
    expect(entries.has('posts/public')).toBe(false);
    expect(await sitemapMetadata()).not.toContain('/posts/public/');
    expect(await sitemapMetadata()).toContain('/posts/renamed/');
    expect(entries.get('posts/renamed').data.value.html).toContain('Edited fixture');
    await writeFile(publicFile, article('renamed', 'encrypt_pwd: NOW_PRIVATE\n'));
    await load();
    expect(await readdir(cacheDir)).toEqual([]);
    await writeFile(publicFile, article('renamed', 'draft: true\n'));
    await load();
    expect(entries.has('posts/renamed')).toBe(false);
    expect(await sitemapMetadata()).not.toContain('/posts/renamed/');
    await writeFile(publicFile, article('renamed'));
    await load();
    expect(entries.has('posts/renamed')).toBe(true);
    await rm(publicFile);
    await load();
    expect(entries.has('posts/renamed')).toBe(false);
    expect(await readdir(cacheDir)).toEqual([]);
    const search = await readFile(path.join(root, 'public/search-index.json'), 'utf8');
    expect(search).not.toContain('PRIVATE_BODY_SENTINEL');
    expect(search).not.toContain('/posts/renamed/');
  } finally {
    log.mockRestore();
    warn.mockRestore();
    globalThis.fetch = originalFetch;
    if (savedSecret === undefined) delete process.env.INKSTONE_PUBLIC_TOKEN_SECRET; else process.env.INKSTONE_PUBLIC_TOKEN_SECRET = savedSecret;
    if (savedEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = savedEnv;
    if (savedDebug === undefined) delete process.env.CONTENT_DEBUG; else process.env.CONTENT_DEBUG = savedDebug;
    await rm(root, { recursive: true, force: true });
  }
});

test('mapping deadline covers a stalled response body after successful headers', async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write('{"items":'); // Successful headers, but body never finishes.
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing server port');
    await expect(fetchCommentsMapping({ tokenSecret: 'test', baseUrl: `http://127.0.0.1:${address.port}`, timeoutMs: 50 })).rejects.toThrow('timed out after 50ms');
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});

test('service worker version is stable and follows content/code, excluding environment secrets', async () => {
  const root = await temporary();
  try {
    await mkdir(path.join(root, 'src'));
    await writeFile(path.join(root, 'src/app.ts'), 'first');
    const first = computeSwHash(root);
    expect(computeSwHash(root)).toBe(first);
    await writeFile(path.join(root, '.env'), 'SECRET=changed');
    expect(computeSwHash(root)).toBe(first);
    await writeFile(path.join(root, 'src/app.ts'), 'second');
    expect(computeSwHash(root)).not.toBe(first);
    await mkdir(path.join(root, '_blogs/content'), { recursive: true });
    const second = computeSwHash(root);
    await writeFile(path.join(root, '_blogs/content/article.md'), 'new article');
    expect(computeSwHash(root)).not.toBe(second);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('Wind4 theme output is independent of module discovery order', async () => {
  const tokens = ['max-w-2xl', 'max-w-7xl', 'font-semibold', 'leading-relaxed', 'rounded-md'];
  const first = await createGenerator({ presets: [stableWind()] });
  const a = (await first.generate(new Set(tokens))).css;
  const second = await createGenerator({ presets: [stableWind()] });
  const b = (await second.generate(new Set([...tokens].reverse()))).css;
  expect(a).toBe(b);
});

test('renderer fingerprint follows installed transitives and optional native packages only', async () => {
  const root = await temporary();
  try {
    await writeFile(path.join(root, 'package.json'), '{}');
    for (const [name, data] of Object.entries({
      renderer: { name: 'renderer', version: '1', dependencies: { nested: '1' }, optionalDependencies: { native: '1', missing: '1' } },
      nested: { name: 'nested', version: '1' },
      native: { name: 'native', version: '1', exports: { './binary': './native.node' } },
      unrelated: { name: 'unrelated', version: '1' },
    })) {
      await mkdir(path.join(root, 'node_modules', name), { recursive: true });
      await writeFile(path.join(root, 'node_modules', name, 'package.json'), JSON.stringify(data));
    }
    const files = await rendererDependencyFiles(root, ['renderer']);
    expect(files.map(file => path.basename(path.dirname(file))).sort()).toEqual(['native', 'nested', 'renderer']);
    await writeFile(path.join(root, 'bun.lock'), 'unrelated update');
    expect(await rendererDependencyFiles(root, ['renderer'])).toEqual(files);
    await rm(path.join(root, 'node_modules/nested'), { recursive: true });
    await expect(rendererDependencyFiles(root, ['renderer'])).rejects.toThrow('nested');
  } finally { await rm(root, { recursive: true, force: true }); }
});
