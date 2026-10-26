import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '@astrojs/markdown-remark';
const root=path.resolve(process.argv[2]||'dist/astro');
const paths=fs.readFileSync(path.join(root,'valid_paths.txt'),'utf8').trim().split('\n');
for(const route of paths) {
 const file=path.join(root,decodeURIComponent(route),'index.html');
 assert(fs.existsSync(file),`Missing route ${route}`);
 const html=fs.readFileSync(file,'utf8');
 assert(!html.includes('http-equiv="refresh"'),`Unexpected redirect ${route}`);
 assert(!html.includes('encrypt_pwd'),`Raw password field in ${route}`);
}
for(const name of ['404.html','404/index.html','sw.js','search-index.json','atom.xml','sitemap.xml','manifest.webmanifest','og','favicon/light.svg'])assert(fs.existsSync(path.join(root,name)),`Missing ${name}`);
assert(!fs.existsSync(path.join(root,'_data')));
const sourceRoot=path.resolve('_blogs/content/posts');
const encrypted=fs.readdirSync(sourceRoot,{recursive:true}).filter(file=>file.endsWith('.md')).map(file=>{const {frontmatter:data,content}=parseFrontmatter(fs.readFileSync(path.join(sourceRoot,file),'utf8'));return {data,content};}).filter(p=>p.data.encrypt_pwd && !p.data.draft);
for(const post of encrypted) {
 const html=fs.readFileSync(path.join(root,'posts',post.data.slug,'index.html'),'utf8');
 assert(html.includes('v1:'),'Missing encrypted payload');
 assert(!html.includes(post.data.encrypt_pwd),'Raw password in output');
 assert(!html.includes(post.content.trim()),'Raw Markdown in output');
}
console.log(`PASS ${paths.length} content routes + 404, static assets, SW, no SPA payloads, ${encrypted.length} encrypted posts`);
