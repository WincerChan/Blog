import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const output=process.env.VISUAL_OUTPUT || '/tmp/blog-astro-full-visual';await fs.mkdir(output,{recursive:true});
const routes=['/','/archives/','/category/实验室/','/search/','/friends/','/life/','/about/','/posts/solana-vanity-prefix-vs-suffix-probability/'];
const results=[];
try {
for(const width of [1440,375]) for(const [i,path] of routes.entries()) {
 const pair=[];
 for(const port of [4177,4180]) {
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await context.addInitScript(()=>{delete Navigator.prototype.serviceWorker;});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.port===String(port))return r.continue();if(u.pathname.startsWith('/v2/'))return r.fulfill({json:{total:0,comments:[],count:0,items:[],hits:[],elapsed_ms:1}});return r.abort();});
  await page.goto(`http://127.0.0.1:${port}${path}`);await page.waitForTimeout(600);
  const data=await page.evaluate(()=>{
    const bounds=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    return {text:document.querySelector('main').innerText,header:bounds(document.querySelector('header')),main:bounds(document.querySelector('main')),title:bounds(document.querySelector('main h1, main h2')),footer:bounds(document.querySelector('footer')),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  await page.screenshot({path:`${output}/${port}-${width}-${i}.png`,fullPage:true});pair.push({...data,errors});await context.close();
 }
 results.push({width,path,baseline:pair[0],astro:pair[1],textEqual:pair[0].text===pair[1].text});
 console.log(JSON.stringify({width,path,textEqual:pair[0].text===pair[1].text,title:pair.map(p=>p.title),footerY:pair.map(p=>p.footer.y),errors:pair[1].errors,overflow:pair[1].overflow}));
}
}finally{await browser.close();}
await fs.writeFile(output+'/results.json',JSON.stringify(results,null,2));
