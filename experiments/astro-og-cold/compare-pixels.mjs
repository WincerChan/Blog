import { createRequire } from 'node:module';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const sharp = createRequire(import.meta.resolve('astro/package.json'))('sharp');
const [before, after] = process.argv.slice(2);
const names = (await readdir(before)).filter(name => name.endsWith('.png')).sort();
const afterNames = (await readdir(after)).filter(name => name.endsWith('.png')).sort();
if (JSON.stringify(names) !== JSON.stringify(afterNames)) throw new Error('PNG filenames differ');
let changed = 0, beforeBytes = 0, afterBytes = 0;
for (const name of names) {
  const a = await readFile(resolve(before, name)), b = await readFile(resolve(after, name));
  const left = await sharp(a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const right = await sharp(b).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (JSON.stringify(left.info) !== JSON.stringify(right.info) || !left.data.equals(right.data)) throw new Error(`Pixels differ: ${name}`);
  if (!a.equals(b)) changed++;
  beforeBytes += a.length; afterBytes += b.length;
}
console.log(JSON.stringify({ count: names.length, pixelIdentical: true, filesWithDifferentEncoding: changed, beforeBytes, afterBytes }));
