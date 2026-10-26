import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// A deployment ID or wall clock changes even for identical inputs. Hash the
// source inputs instead, so unchanged assets retain their browser cache keys.
const computeSwHash = (root = process.cwd()) => {
  const hash = createHash('sha256');
  const visit = (relative: string) => {
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) return;
    const entries = readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const entry of entries) {
      if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) continue;
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) add(file);
    }
  };
  const add = (relative: string) => {
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) return;
    const bytes = readFileSync(absolute);
    hash.update(JSON.stringify([relative.split(path.sep).join('/'), bytes.length])).update(bytes);
  };
  ['src', 'tools', 'packages', 'public', '_blogs/content', 'patches'].forEach(visit);
  ['astro.config.mjs', 'uno.config.ts', 'site.config.json', 'tsconfig.json', 'package.json', 'bun.lock'].forEach(add);
  return hash.digest('hex').slice(0, 16);
};

export default computeSwHash;
