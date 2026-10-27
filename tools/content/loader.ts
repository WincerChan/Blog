import { readdir, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Loader, LoaderContext } from 'astro/loaders';
import { parseMarkdown } from './frontmatter';
import { postInput, pageInput, friendInput } from './collections';
import { renderedMetadata } from './metadata';
import { beginContentPreparation, prepareContent } from './prepare';
import { contentRenderVersion, createArticleCache } from './renderCache';
import { buildSitemapMetadata, SITEMAP_METADATA_FILE } from './sitemap';
import { readSiteConf } from './site';
import { writeFile } from './io';

export function blogLoader(): Loader {
  let detachWatcher: (() => void) | undefined;
  return {
    name: 'blog-content',
    async load(context: LoaderContext) {
      detachWatcher?.();
      const { config, store, parseData, renderMarkdown, generateDigest, watcher, logger } = context;
      const root = fileURLToPath(config.root);
      const contentDir = path.join(root, '_blogs/content');
      const outputDir = fileURLToPath(config.publicDir);
      // Private source, passwords and decrypted HTML stay in process memory only.
      const cache = new Map<string, { digest: string; data: Record<string, any> }>();
      const filesIn = async (dir: string): Promise<string[]> => {
        const entries = await readdir(dir, { withFileTypes: true });
        const paths = await Promise.all(entries.filter(entry => !entry.name.startsWith('.')).map(async entry => {
          const full = path.join(dir, entry.name);
          return entry.isDirectory() ? filesIn(full) : entry.name.endsWith('.md') ? [full] : [];
        }));
        return paths.flat().sort();
      };
      const persistent = createArticleCache(path.join(root, '.cache/content'),
        watcher ? 'dev-memory-only' : await contentRenderVersion(root));
      const sync = async () => {
        const preparation = beginContentPreparation();
        const stats = { cached: 0, rendered: 0, drafts: 0 };
        const publicFiles = new Set<string>();
        const seenFiles = new Set<string>();
        const readArticles = async (kind: 'posts' | 'pages') => {
          const results: any[] = [];
          const slugs = new Set<string>();
          for (const file of await filesIn(path.join(contentDir, kind))) {
            seenFiles.add(file);
            const source = await readFile(file, 'utf8');
            const relative = path.relative(contentDir, file);
            const { data, content } = parseMarkdown(source);
            const fields = (kind === 'posts' ? postInput : pageInput).parse(data);
            if (slugs.has(fields.slug)) throw new Error(`Duplicate ${kind} slug: ${fields.slug}`);
            slugs.add(fields.slug);
            const privateArticle = Boolean('encrypt_pwd' in fields && fields.encrypt_pwd);
            if (fields.draft || privateArticle) await persistent.discard(relative);
            if (fields.draft) {
              stats.drafts++;
              cache.delete(file);
              continue;
            }
            if (!privateArticle) publicFiles.add(relative);
            const digest = generateDigest(source);
            let entry = cache.get(file);
            if (!entry || entry.digest !== digest) {
              let rendered = !watcher && !privateArticle ? await persistent.read(relative, source) : undefined;
              if (rendered) stats.cached++;
              else {
                const result = await renderMarkdown(content, { fileURL: pathToFileURL(file) });
                rendered = { html: result.html, ...renderedMetadata(result.metadata, kind === 'posts' && !privateArticle) };
                if (!watcher && !privateArticle) await persistent.write(relative, source, rendered);
                stats.rendered++;
              }
              const { words, ...metadata } = rendered;
              entry = { digest, data: { ...fields, ...metadata,
                ...(kind === 'posts' ? { words } : {}) } };
              cache.set(file, entry);
            } else stats.cached++;
            results.push({ ...entry.data });
          }
          return results;
        };
        const posts = await readArticles('posts');
        const pages = await readArticles('pages');
        const friends = friendInput.array().parse(JSON.parse(await readFile(path.join(contentDir, 'friends.json'), 'utf8')));
        await mkdir(outputDir, { recursive: true });
        const { posts: publicPosts, pages: publicPages, ...site } = await prepareContent({ posts, pages, friends }, root, outputDir, preparation);
        const entries = [
          ...publicPosts.map(value => ({ id: `posts/${value.slug}`, data: { kind: 'post', value } })),
          ...publicPages.map(value => ({ id: `pages/${value.slug}`, data: { kind: 'page', value } })),
          { id: 'site', data: { kind: 'site', value: site } },
        ];
        // Validate the complete revision before changing the collection.
        const next = await Promise.all(entries.map(async entry => ({ ...entry,
          data: await parseData(entry), digest: generateDigest(entry.data),
        })));
        await writeFile(fileURLToPath(new URL(SITEMAP_METADATA_FILE, config.cacheDir)),
          JSON.stringify(buildSitemapMetadata({
            site: await readSiteConf(root), posts: publicPosts, pages: publicPages,
          })));
        const ids = new Set(next.map(entry => entry.id));
        for (const id of store.keys()) if (!ids.has(id)) store.delete(id);
        for (const entry of next) store.set(entry);
        for (const file of cache.keys()) if (!seenFiles.has(file)) cache.delete(file);
        await persistent.prune(publicFiles);
        logger.info(`Markdown: ${stats.cached} cached, ${stats.rendered} rendered, ${stats.drafts} drafts skipped`);
        logger.info(`Loaded ${publicPosts.length} posts and ${publicPages.length} pages`);
      };
      await sync();
      if (!watcher) return;
      watcher.add(contentDir);
      // Serialize edits that arrive while content/API data are being generated.
      let queue = Promise.resolve();
      let timer: ReturnType<typeof setTimeout>;
      const onChange = (_event: string, file: string) => {
        const relative = path.relative(contentDir, file);
        if (relative.startsWith('..') || path.isAbsolute(relative) || !/\.(md|json)$/.test(relative)) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          queue = queue.then(sync).catch(error => logger.error(String(error)));
        }, 100);
      };
      watcher.on('all', onChange);
      detachWatcher = () => { clearTimeout(timer); watcher.off('all', onChange); };
    },
  };
}
