import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
// Reuse an installed Playwright or supply PLAYWRIGHT_MODULE without adding a runtime dependency.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const sites = [['solid1',4177],['solid2',4178],['astro',Number(process.env.ASTRO_MEASURE_PORT || 4176)]];
const article = '/posts/solana-vanity-prefix-vs-suffix-probability/';
const records = [];
async function setup(port, cacheDisabled) {
  const context = await browser.newContext({ viewport:{width:1440,height:900}, serviceWorkers:'block' });
  await context.addInitScript(() => { delete Navigator.prototype.serviceWorker; });
  const page = await context.newPage();
  // Deterministic API data; avoid writing page views or likes to production.
  await context.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input), location.href);
      if (url.pathname.startsWith('/v2/')) return Promise.resolve(new Response(JSON.stringify({count:1,interacted:false,total:0,comments:[],discussion_url:'https://github.com/example/discussions/1'}), {headers:{'Content-Type':'application/json'}}));
      return originalFetch(input, init);
    };
    navigator.sendBeacon = () => true;
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled',{cacheDisabled});
  const requests = new Map(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  cdp.on('Network.requestWillBeSent',e=>{
    const u=new URL(e.request.url);
    if(u.origin!==`http://127.0.0.1:${port}`)return;
    requests.set(e.requestId,{path:u.pathname,type:e.type,bytes:0,decoded:0,status:0,cached:false});
  });
  cdp.on('Network.responseReceived',e=>{const r=requests.get(e.requestId);if(r)Object.assign(r,{status:e.response.status,cached:!!e.response.fromDiskCache});});
  cdp.on('Network.dataReceived',e=>{const r=requests.get(e.requestId);if(r)r.decoded+=e.dataLength;});
  cdp.on('Network.loadingFinished',e=>{const r=requests.get(e.requestId);if(r)r.bytes=e.encodedDataLength;});
  return {context,page,requests,errors};
}
function summarize(name,stage,requests,errors) {
  const all=[...requests.values()],js=all.filter(r=>r.type==='Script'||r.path.endsWith('.js'));
  return {name,stage,requests:all.length,transfer:all.reduce((n,r)=>n+r.bytes,0),jsRequests:js.length,jsTransfer:js.reduce((n,r)=>n+r.bytes,0),jsDecoded:js.reduce((n,r)=>n+r.decoded,0),errors:[...errors],resources:all};
}
try {
  for(const [name,port] of sites) {
    for(const [label,path] of [['home','/'],['article',article]]) {
      const {context,page,requests,errors}=await setup(port,true);
      await page.goto(`http://127.0.0.1:${port}${path}`,{waitUntil:'networkidle'});
      await page.waitForTimeout(2000);
      records.push(summarize(name,label+'-cold',requests,errors));
      if(label==='article') {
        await page.locator('#comments').scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        records.push(summarize(name,'article-after-scroll-cumulative',requests,errors));
      }
      await context.close();
    }
    const {context,page,requests,errors}=await setup(port,false);
    await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
    await page.waitForTimeout(1000);
    await page.evaluate(()=>{window.__navigationProbe=12345;});
    requests.clear(); errors.length=0;
    const link=page.locator('main a[href^="/posts/"]').first();
    const href=await link.getAttribute('href');
    await link.click(); await page.waitForURL(`**${href}`); await page.waitForTimeout(2000);
    const row=summarize(name,'home-to-first-article-warm',requests,errors);
    row.documentPreserved=await page.evaluate(()=>window.__navigationProbe===12345);
    row.destination=href; records.push(row); await context.close();
  }
} finally {await browser.close();}
const output=process.env.MEASUREMENT_OUTPUT || '/tmp/blog-astro-measurement.json';
await fs.writeFile(output,JSON.stringify({recordedAt:new Date().toISOString(),method:'Chrome; viewport 1440x900; same Brotli Q11 server; local resources only; API mocked; SW unavailable; cold cache disabled, warm cache enabled; transferred bytes include HTTP headers; scroll cumulative includes lazy islands',records},null,2));
console.table(records.map(({resources,errors,...r})=>({...r,errors:errors.length})));

if (records.some(r => r.errors.length || r.resources.some(x => x.status >= 400) || r.documentPreserved === false)) {
  throw new Error('Measurement encountered browser/HTTP errors or a full reload; inspect the output JSON');
}
