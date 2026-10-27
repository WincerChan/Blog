// Run with Bun for the project's extensionless TypeScript imports.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { ogImageFilename } from '../../tools/content/og/paths.ts';

const directory = 'experiments/astro-og-takumi';
const before = JSON.parse(await readFile(`${directory}/output/production-before.json`, 'utf8'));
const manifest = JSON.parse(await readFile(`${directory}/output/takumi/manifest.json`, 'utf8'));
const filenames = (await readdir('dist/astro/og')).filter(name => name.endsWith('.png')).sort();
assert.deepEqual(filenames, before.files, 'Published OG URLs changed');
assert.equal(filenames.length, manifest.length);
let bytes = 0;
for (const target of manifest) {
  const filename = ogImageFilename(target.slug);
  const actual = await readFile(`dist/astro/og/${filename}`);
  const expected = await readFile(`${directory}/output/takumi/${target.index}.png`);
  assert(actual.equals(expected), `Production image differs from evaluated Takumi image: ${filename}`);
  const metadata = await sharp(actual).metadata();
  assert.equal(metadata.width, 1800);
  assert.equal(metadata.height, 945);
  bytes += actual.length;
}
for (const [filename, expectedHash] of Object.entries(before.faviconHashes)) {
  const hash = createHash('sha256').update(await readFile(`dist/astro/${filename}`)).digest('hex');
  assert.equal(hash, expectedHash, `Favicon changed: ${filename}`);
}
const result = { images: filenames.length, dimensions: [1800, 945], bytes,
  urlsUnchanged: true, identicalToEvaluatedTakumiImages: true, faviconsUnchanged: true };
await writeFile(`${directory}/production-output.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
