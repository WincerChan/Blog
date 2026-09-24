const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
import fs from 'node:fs/promises';
const base = process.env.BASELINE_URL || 'http://127.0.0.1:4173';
const output = process.env.BASELINE_OUTPUT || new URL('./rerun.json', import.meta.url);
const targets = [
 ['首页','/'],['归档','/archives/'],['分类','/category/实验室/'],
 ['搜索','/search/'],['生活','/life/'],['友链','/friends/'],['关于','/about/'],
 ['最新文章','/posts/yunnan-family-trip-dali-lijiang/'],
 ['技术文章','/posts/refactoring-blog-architecture-with-vibe-coding/'],
 ['公式文章','/posts/solana-vanity-prefix-vs-suffix-probability/'],
 ['加密文章','/posts/d67271d8/'],['404','/404/'],
 ['英文归档','/archives-en/'],['英文搜索','/search-en/'],
 ['英文生活','/life-en/'],['英文友链','/friends-en/'],['英文关于','/about-en/'],
 ['英文文章','/posts/solana-vanity-prefix-vs-suffix-probability-en/'],
];
const browser = await chromium.launch({channel:'chrome',headless:true});
const results = {recordedAt:new Date().toISOString(),browser:browser.version(),base,viewport:{width:1440,height:900},method:'Fresh context per page; HTTP cache disabled; service workers blocked; no scrolling or interactions; at least 5s after load, then 1s network quiet, maximum 20s; page CDP Network events only; transfer = loadingFinished.encodedDataLength; resource = dataReceived.dataLength',pages:[]};
function safeUrl(raw) {const url = new URL(raw); for (const key of [...url.searchParams.keys()]) if (/token|secret|key|signature/i.test(key)) url.searchParams.set(key,'[REDACTED]'); return url.toString();}
try {
 for (const [label,path] of targets) {
  const context = await browser.newContext({viewport:results.viewport,serviceWorkers:'block',locale:'zh-CN',deviceScaleFactor:1});
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  const requests = new Map(); let lastEvent=Date.now();
  cdp.on('Network.requestWillBeSent',e=>{lastEvent=Date.now(); requests.set(e.requestId,{url:safeUrl(e.request.url),method:e.request.method,type:e.type,status:null,transferBytes:0,resourceBytes:0,finished:false,failed:false});});
  cdp.on('Network.responseReceived',e=>{lastEvent=Date.now(); const r=requests.get(e.requestId); if(r) Object.assign(r,{status:e.response.status,mimeType:e.response.mimeType,fromDiskCache:e.response.fromDiskCache||false,fromServiceWorker:e.response.fromServiceWorker||false,contentEncoding:e.response.headers['content-encoding']||e.response.headers['Content-Encoding']||'identity'});});
  cdp.on('Network.dataReceived',e=>{lastEvent=Date.now();const r=requests.get(e.requestId);if(r)r.resourceBytes+=e.dataLength;});
  cdp.on('Network.loadingFinished',e=>{lastEvent=Date.now();const r=requests.get(e.requestId);if(r)Object.assign(r,{transferBytes:e.encodedDataLength,finished:true});});
  cdp.on('Network.loadingFailed',e=>{lastEvent=Date.now();const r=requests.get(e.requestId);if(r)Object.assign(r,{failed:true,error:e.errorText,canceled:e.canceled||false});});
  let navigationError;
  try {await page.goto(base+path,{waitUntil:'load',timeout:30000});}catch(e){navigationError=e.message.split('\n')[0];}
  const start=Date.now();
  while(Date.now()-start<20000) {await page.waitForTimeout(250);if(Date.now()-start>=5000 && Date.now()-lastEvent>=1000 && [...requests.values()].every(r=>r.finished||r.failed))break;}
  const list=[...requests.values()];
  const summary={label,path,title:await page.title(),requestCount:list.length,transferBytes:list.reduce((n,r)=>n+r.transferBytes,0),resourceBytes:list.reduce((n,r)=>n+r.resourceBytes,0),failed:list.filter(r=>r.failed).length,httpErrors:list.filter(r=>r.status>=400).length,pending:list.filter(r=>!r.finished&&!r.failed).length,navigationError,requests:list};
  results.pages.push(summary);
  await fs.writeFile(output,JSON.stringify(results,null,2));
  console.log(JSON.stringify({...summary,requests:undefined}));
  await context.close();
 }
} finally {await browser.close();}
