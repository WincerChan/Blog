import { expect, test } from 'bun:test';
import { mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createPngCache, ogCacheKey } from '../tools/content/og/cache';
import { ogRenderInput } from '../tools/content/og/targets';
import { readSiteConf } from '../tools/content/site';

const site = await readSiteConf(process.cwd());
const input = ogRenderInput({ slug: 'fixture', label: 'fixture', title: 'Fixture', subtitle: 'Summary', date: '2026-01-01' }, site);
const png = Buffer.from('fixture PNG bytes');

test('PNG cache persists across instances and coalesces simultaneous renders', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'og-cache-'));
  let count = 0;
  const render = async () => { count++; await new Promise(resolve => setTimeout(resolve, 10)); return png; };
  try {
    const cache = createPngCache({ directory, version: 'v1', render });
    const result = await Promise.all([cache.get(input), cache.get(input)]);
    expect(result).toEqual([png, png]);
    expect(count).toBe(1);
    const nextProcess = createPngCache({ directory, version: 'v1', render });
    expect(await nextProcess.get(input)).toEqual(png);
    expect(nextProcess.stats).toEqual({ hits: 1, renders: 0 });
    expect(count).toBe(1);
    const nextVersion = createPngCache({ directory, version: 'v2', render });
    await nextVersion.get(input);
    expect(count).toBe(2);
    await nextVersion.get({ ...input, title: 'Edited title' });
    expect(count).toBe(3);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('corrupt or incomplete cache entries regenerate, failed renders can retry', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'og-cache-'));
  let fail = true;
  const cache = createPngCache({ directory, version: 'v1', render: async () => {
    if (fail) throw new Error('render failed');
    return png;
  } });
  try {
    await expect(cache.get(input)).rejects.toThrow('render failed');
    expect(await readdir(directory)).toEqual([]);
    fail = false;
    await cache.get(input);
    const key = ogCacheKey(input, 'v1');
    await writeFile(path.join(directory, `${key}.png`), 'corrupt');
    expect(await cache.get(input)).toEqual(png);
    await rm(path.join(directory, `${key}.sha256`));
    expect(await cache.get(input)).toEqual(png);
    expect(cache.stats.renders).toBe(3);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('cache keys depend on displayed fields, not hidden dates or truncated suffixes', () => {
  const target = { slug: 'fixture', label: 'fixture', title: 'x'.repeat(100), subtitle: 'Summary', showDate: false, date: '2025-01-01' };
  const first = ogRenderInput(target, site);
  const changed = ogRenderInput({ ...target, title: 'x'.repeat(100) + 'suffix', date: '2026-01-01' }, site);
  expect(ogCacheKey(first, 'v1')).toBe(ogCacheKey(changed, 'v1'));
  expect(ogCacheKey(first, 'v2')).not.toBe(ogCacheKey(first, 'v1'));
  expect(ogCacheKey({ ...first, siteName: 'Changed' }, 'v1')).not.toBe(ogCacheKey(first, 'v1'));
});
