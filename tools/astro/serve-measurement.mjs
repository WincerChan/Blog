// Identical local Brotli transport for all three production outputs.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { brotliCompressSync } from 'node:zlib';
const root = resolve(process.argv[2] || 'dist/astro');
const port = Number(process.argv[3] || 4176);
const cache = new Map();
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
createServer((req, res) => {
  try {
    let file = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + sep)) throw Error('path');
    if (statSync(file).isDirectory()) file = resolve(file, 'index.html');
    const key = file + statSync(file).mtimeMs;
    let body = cache.get(key);
    if (!body) { body = brotliCompressSync(readFileSync(file)); cache.set(key, body); }
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Encoding': 'br', 'Content-Length': body.length, 'Cache-Control': 'public, max-age=3600' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://127.0.0.1:${port}`));
