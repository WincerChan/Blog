import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'astro/zod';

const renderedArticle = z.object({
  html: z.string(), toc: z.string(), summary: z.string(), words: z.number(),
  searchText: z.string().optional(),
}).strict();
export type RenderedArticle = z.infer<typeof renderedArticle>;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export async function contentRenderVersion(root: string) {
  const sources = [
    'astro.config.mjs', 'bun.lock', 'tools/content/loader.ts',
    'tools/content/renderCache.ts', 'tools/content/metadata.ts', 'tools/content/markdown.ts',
    'tools/content/codeBlocks.ts', 'tools/content/shikiThemes.ts',
    'tools/content/loaders/matterLoader.ts', 'tools/content/collections.ts',
  ];
  const contents = await Promise.all(sources.map(file => readFile(path.join(root, file), 'utf8')));
  return hash(JSON.stringify([1, process.versions.node, sources, contents]));
}

// One entry per source path: edits overwrite old data, and private/draft/deleted
// articles can remove their former public render without retaining old revisions.
export function createArticleCache(directory: string, version: string) {
  const filename = (file: string) => `${hash(file)}.json`;
  const key = (source: string) => hash(JSON.stringify([version, source]));
  return {
    async read(file: string, source: string): Promise<RenderedArticle | undefined> {
      let text: string;
      try { text = await readFile(path.join(directory, filename(file)), 'utf8'); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
        throw error;
      }
      try {
        const record = JSON.parse(text);
        if (record.key !== key(source) || typeof record.payload !== 'string' || record.checksum !== hash(record.payload)) return;
        return renderedArticle.parse(JSON.parse(record.payload));
      } catch { return; } // An interrupted/corrupt cache is regenerated from source.
    },
    async write(file: string, source: string, value: RenderedArticle) {
      const payload = JSON.stringify(renderedArticle.parse(value));
      const record = JSON.stringify({ key: key(source), checksum: hash(payload), payload });
      await mkdir(directory, { recursive: true });
      const target = path.join(directory, filename(file));
      const temporary = `${target}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, record, { mode: 0o600 });
        await rename(temporary, target);
      } finally { await rm(temporary, { force: true }); }
    },
    async discard(file: string) { await rm(path.join(directory, filename(file)), { force: true }); },
    async prune(files: Set<string>) {
      const keep = new Set([...files].map(filename));
      let names: string[];
      try { names = await readdir(directory); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
        throw error;
      }
      await Promise.all(names.filter(name => /^[a-f0-9]{64}\.json$/.test(name) && !keep.has(name))
        .map(name => rm(path.join(directory, name), { force: true })));
    },
  };
}
