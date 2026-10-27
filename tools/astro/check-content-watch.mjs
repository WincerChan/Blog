import fs from 'node:fs/promises';
const file='_blogs/content/posts/codex-content-watch-fixture.md';
const base=process.env.ASTRO_TEST_URL || 'http://localhost:3001';
const text = (draft=false, slug='codex-content-watch-fixture', body='First fixture body') => `---\ntitle: Content watcher fixture\nslug: ${slug}\ndate: '2026-10-13'\nupdated: '2026-10-13'\ncategory: Content watcher fixture\ndraft: ${draft}\n---\n${body}\n`;
async function waitFor(label, fn) {
 const start=Date.now();
 while(Date.now()-start<60000) {
  if(await fn()) {console.log('PASS',label);return;}
  await new Promise(r=>setTimeout(r,700));
 }
 throw Error('Timed out: '+label);
}
const hasIndex=async slug => (await (await fetch(base+'/search-index.json')).json()).some(p=>p.url===`/posts/${slug}/`);
const hasAtom=async (slug, body='') => {
 const response=await fetch(base+'/atom.xml');
 if(response.status!==200 || !response.headers.get('content-type')?.includes('application/atom+xml')) throw Error('Invalid Atom response');
 const xml=await response.text();
 return xml.includes(`/posts/${slug}/"`) && xml.includes(body);
};
// Refuse to overwrite an existing source file.
await fs.writeFile(file,text(),{flag:'wx'});
try {
 await waitFor('new article route, search and Atom entry',async()=>{
  const r=await fetch(base+'/posts/codex-content-watch-fixture/');
  return r.status===200 && (await r.text()).includes('First fixture body') && await hasIndex('codex-content-watch-fixture') && await hasAtom('codex-content-watch-fixture','First fixture body');
 });
 await fs.writeFile(file,text(false,'codex-content-watch-renamed','Edited fixture body'));
 await waitFor('edit and slug rename refresh route and Atom',async()=>{
  const r=await fetch(base+'/posts/codex-content-watch-renamed/');
  return r.status===200 && (await r.text()).includes('Edited fixture body') && (await fetch(base+'/posts/codex-content-watch-fixture/')).status===404 && await hasAtom('codex-content-watch-renamed','Edited fixture body') && !await hasAtom('codex-content-watch-fixture');
 });
 await fs.writeFile(file,text(true,'codex-content-watch-renamed'));
 await waitFor('draft removes route, search, taxonomy and Atom entry',async()=> (await fetch(base+'/posts/codex-content-watch-renamed/')).status===404 && !await hasIndex('codex-content-watch-renamed') && (await fetch(base+'/category/Content%20watcher%20fixture/')).status===404 && !await hasAtom('codex-content-watch-renamed'));
 await fs.writeFile(file,text());
 await waitFor('republish restores route and Atom entry',async()=> (await fetch(base+'/posts/codex-content-watch-fixture/')).status===200 && await hasAtom('codex-content-watch-fixture'));
 await fs.unlink(file);
 await waitFor('delete removes route, search and Atom entry',async()=> (await fetch(base+'/posts/codex-content-watch-fixture/')).status===404 && !await hasIndex('codex-content-watch-fixture') && !await hasAtom('codex-content-watch-fixture'));
} finally {await fs.rm(file,{force:true});}
