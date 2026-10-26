import { createRequire } from 'node:module';
import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

// Follow the installed renderer graph, including native optional packages.
// Unrelated entries in the root lockfile cannot change this fingerprint.
export async function rendererDependencyFiles(root: string, names: string[]) {
  const files = new Set<string>();
  const locate = async (name: string, from: string): Promise<string> => {
    // Resolve package directories independently of exports: native packages may
    // export only their .node binary and deliberately hide package.json.
    const require = createRequire(from);
    for (const directory of require.resolve.paths(name) ?? []) {
      try { return await realpath(path.join(directory, name, 'package.json')); }
      catch (error) {
        if (!['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
      }
    }
    throw Object.assign(new Error(`Cannot locate renderer dependency: ${name}`), { code: 'MODULE_NOT_FOUND' });
  };
  const visit = async (file: string) => {
    if (files.has(file)) return;
    files.add(file);
    const pkg = JSON.parse(await readFile(file, 'utf8'));
    const required = new Set(Object.keys(pkg.dependencies ?? {}));
    const optional = new Set(Object.keys(pkg.optionalDependencies ?? {}));
    for (const name of [...new Set([...required, ...optional])].sort()) {
      let dependency: string;
      try { dependency = await locate(name, file); }
      catch (error) {
        if (optional.has(name) && (error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') continue;
        throw error;
      }
      await visit(dependency);
    }
  };
  for (const name of names) await visit(await locate(name, path.join(root, 'package.json')));
  // Local patches may alter code without changing a package version.
  const patches = async (directory: string) => {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await patches(file);
      else if (entry.isFile()) files.add(file);
    }
  };
  await patches(path.join(root, 'patches'));
  return [...files].sort();
}
