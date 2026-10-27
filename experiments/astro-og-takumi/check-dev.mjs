// Run from the repository root. Preserve the existing OG cache around the check.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, open, rename } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

const output = resolve('experiments/astro-og-takumi/output');
await mkdir(output, { recursive: true });
const probe = createServer();
probe.listen(3017, '127.0.0.1');
await once(probe, 'listening');
await new Promise((done, reject) => probe.close(error => error ? reject(error) : done()));
const saved = await mkdtemp(`${output}/dev-cache-`);
const cache = resolve('.cache/og');
let hadCache = false;
try { await rename(cache, `${saved}/original`); hadCache = true; }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const log = await open(`${output}/dev-migration.log`, 'w');
let server;
let serverExit;
try {
  await mkdir(cache, { recursive: true });
  // Astro otherwise detects agent sessions and detaches a background server.
  server = spawn(process.execPath, ['node_modules/.bin/astro', 'dev', '--ignore-lock', '--port', '3017', '--host', '127.0.0.1'], {
    stdio: ['ignore', log.fd, log.fd],
  });
  serverExit = once(server, 'exit');
  const check = spawn(process.execPath, ['tools/astro/check-og-dev.mjs'], {
    env: { ...process.env, ASTRO_TEST_URL: 'http://127.0.0.1:3017' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [check.stdout, check.stderr]) {
    stream.on('data', chunk => { process.stdout.write(chunk); });
  }
  const [code] = await once(check, 'exit');
  if (code !== 0) throw new Error(`Development OG check exited with ${code}`);
} finally {
  if (server && server.exitCode === null && server.signalCode === null) {
    server.kill('SIGTERM');
    await serverExit;
  }
  await log.close();
  await rename(cache, `${saved}/test-cache`);
  if (hadCache) await rename(`${saved}/original`, cache);
}
