// Run after bun run clean:og, with a dev server already running.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.ASTRO_TEST_URL || 'http://localhost:3001';
const cache=async()=> (await fs.readdir('.cache/og').catch(e=>{if(e.code==='ENOENT')return [];throw e;})).filter(name=>name.endsWith('.png')).sort();
async function waitFor(label,fn){const start=Date.now();while(Date.now()-start<60000){if(await fn()){console.log('PASS',label);return;}await new Promise(r=>setTimeout(r,500));}throw Error('Timed out: '+label);}
await waitFor('dev server ready',async()=>{try{return (await fetch(base+'/')).status===200;}catch{return false;}});
assert.equal((await cache()).length,0);console.log('PASS homepage/content sync generates no OG images');
const url=base+'/og/solana-vanity-prefix-vs-suffix-probability.png';
const initial=await fetch(url);assert.equal(initial.status,200);assert.match(initial.headers.get('content-type'),/image\/png/);
const bytes=Buffer.from(await initial.arrayBuffer());
assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
const files=await cache();assert.equal(files.length,1);const info=await fs.stat('.cache/og/'+files[0]);
assert.deepEqual(Buffer.from(await (await fetch(url)).arrayBuffer()),bytes);assert.equal((await fs.stat('.cache/og/'+files[0])).mtimeMs,info.mtimeMs);
assert.equal((await fetch(base+'/og/not-a-real-image.png')).status,404);
console.log('PASS first OG request generates one PNG; second reuses it; unknown route is 404');
const template='tools/content/og/template.tsx';
const original=await fs.readFile(template,'utf8');const changed=original.replace('const ACCENT = "#1f6f6a";', 'const ACCENT = "#ff0000";');assert.notEqual(changed,original);
let expected=original;
async function write(value){assert.equal(await fs.readFile(template,'utf8'),expected,'Template changed externally');await fs.writeFile(template,value);expected=value;}
try{
 await write(changed);
 await waitFor('template edit invalidates cached PNG',async()=>{const response=await fetch(url);if(response.status!==200)return false;return !Buffer.from(await response.arrayBuffer()).equals(bytes);});
 assert.equal((await cache()).length,2);
}finally{await write(original);}
await waitFor('restored template reuses original image',async()=>{const response=await fetch(url);return response.status===200 && Buffer.from(await response.arrayBuffer()).equals(bytes);});
const file='_blogs/content/posts/codex-og-endpoint-fixture.md';
const source="---\ntitle: OG endpoint fixture\nslug: codex-og-endpoint-fixture\ndate: '2026-10-13'\nupdated: '2026-10-13'\n---\nFixture body.\n";
await fs.writeFile(file,source,{flag:'wx'});
try{
 await waitFor('new content becomes an OG route',async()=> (await fetch(base+'/og/codex-og-endpoint-fixture.png')).status===200);
 await fs.writeFile(file,source.replace('---\nFixture body.', 'draft: true\n---\nFixture body.'));
 await waitFor('draft OG route returns 404',async()=> (await fetch(base+'/og/codex-og-endpoint-fixture.png')).status===404);
}finally{await fs.rm(file,{force:true});}
console.log('PASS dev on-demand generation and invalidation');
