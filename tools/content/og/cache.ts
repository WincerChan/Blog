import { createHash, randomUUID } from 'node:crypto';
import { readFile, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import type { OgRenderInput } from './targets';

const sha256 = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
export const ogCacheKey = (input: OgRenderInput, version: string) => sha256(JSON.stringify([version, input]));

// Only complete PNGs are cached. A checksum rejects interrupted/corrupt cache restores.
export function createPngCache({ directory, version, render }: {
  directory: string; version: string; render: (input: OgRenderInput) => Promise<Buffer>;
}) {
  const pending = new Map<string, Promise<Buffer>>();
  const stats = { hits: 0, renders: 0 };
  async function load(key: string, input: OgRenderInput) {
    const pngPath = path.join(directory, `${key}.png`);
    const hashPath = path.join(directory, `${key}.sha256`);
    try {
      const [png, expectedHash] = await Promise.all([readFile(pngPath), readFile(hashPath, 'utf8')]);
      if (sha256(png) === expectedHash) {
        stats.hits++;
        return png;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    const png = await render(input);
    await mkdir(directory, { recursive: true });
    const suffix = `.${randomUUID()}.tmp`;
    try {
      await Promise.all([writeFile(pngPath + suffix, png), writeFile(hashPath + suffix, sha256(png))]);
      await rename(pngPath + suffix, pngPath);
      await rename(hashPath + suffix, hashPath);
    } finally {
      await Promise.all([rm(pngPath + suffix, { force: true }), rm(hashPath + suffix, { force: true })]);
    }
    stats.renders++;
    return png;
  }
  return {
    stats,
    get(input: OgRenderInput): Promise<Buffer> {
      const key = ogCacheKey(input, version);
      const existing = pending.get(key);
      if (existing) return existing;
      const task = load(key, input).finally(() => pending.delete(key));
      pending.set(key, task);
      return task;
    },
  };
}
