import { readdir, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Loader, LoaderContext } from 'astro/loaders';
import { parseMarkdown } from './loaders/matterLoader';
import { postInput, pageInput, friendInput } from './collections';
import { markdownMetadata } from './metadata';
import { prepareContent } from './prepare';

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
      // Raw source, passwords and rendered plaintext stay in process memory only.
      const cache = new Map<string, { digest: string; data: Record<string, any> }>();
      const filesIn = async (dir: string): Promise<string[]> => {
        const entries = await readdir(dir, { withFileTypes: true });
        const paths = await Promise.all(entries.filter(entry => !entry.name.startsWith('.')).map(async entry => {
          const full = path.join(dir, entry.name);
          return entry.isDirectory() ? filesIn(full) : entry.name.endsWith('.md') ? [full] : [];
        }));
        return paths.flat().sort();
      };
      const sync = async () => {
        const seenFiles = new Set<string>();
        const readArticles = async (kind: 'posts' | 'pages') => {
          const results: any[] = [];
          const slugs = new Set<string>();
          for (const file of await filesIn(path.join(contentDir, kind))) {
            seenFiles.add(file);
            const source = await readFile(file, 'utf8');
            const digest = generateDigest(source);
            let entry = cache.get(file);
            if (!entry || entry.digest !== digest) {
              const { data, content } = parseMarkdown(source);
              const fields = (kind === 'posts' ? postInput : pageInput).parse(data);
              const rendered = await renderMarkdown(content, { fileURL: pathToFileURL(file) });
              const { words, ...metadata } = markdownMetadata(content);
              entry = { digest, data: { ...fields, ...metadata, html: rendered.html,
                ...(kind === 'posts' ? { words, rawContent: content } : {}) } };
              cache.set(file, entry);
            }
            if (slugs.has(entry.data.slug)) throw new Error(`Duplicate ${kind} slug: ${entry.data.slug}`);
            slugs.add(entry.data.slug);
            results.push({ ...entry.data });
          }
          return results;
        };
        const posts = await readArticles('posts');
        const pages = await readArticles('pages');
        const friends = friendInput.array().parse(JSON.parse(await readFile(path.join(contentDir, 'friends.json'), 'utf8')));
        await mkdir(outputDir, { recursive: true });
        const { posts: publicPosts, pages: publicPages, ...site } = await prepareContent({ posts, pages, friends }, root, outputDir);
        const entries = [
          ...publicPosts.map(value => ({ id: `posts/${value.slug}`, data: { kind: 'post', value } })),
          ...publicPages.map(value => ({ id: `pages/${value.slug}`, data: { kind: 'page', value } })),
          { id: 'site', data: { kind: 'site', value: site } },
        ];
        // Validate the complete revision before changing the collection.
        const next = await Promise.all(entries.map(async entry => ({ ...entry,
          data: await parseData(entry), digest: generateDigest(entry.data),
        })));
        const ids = new Set(next.map(entry => entry.id));
        for (const id of store.keys()) if (!ids.has(id)) store.delete(id);
        for (const entry of next) store.set(entry);
        for (const file of cache.keys()) if (!seenFiles.has(file)) cache.delete(file);
        logger.info(`Loaded ${publicPosts.length} posts and ${publicPages.length} pages`);
      };
      await sync();
      if (!watcher) return;
      watcher.add(contentDir);
      // Serialize edits that arrive while OG images/API data are being generated.
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
