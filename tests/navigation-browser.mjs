import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {jsPDF} from 'jspdf';
import mupdf from '../extension/vendor/mupdf/mupdf.js';
import {unzipSync} from '../extension/vendor/fflate.js';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const manifest=JSON.parse(await readFile('extension/manifest.json','utf8'));
const root=resolve('extension');
const server=createServer(async(req,res)=>{
  try{
    const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!path.startsWith(root+ '\\'))throw new Error('invalid');
    res.setHeader('Content-Security-Policy',manifest.content_security_policy.extension_pages);
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm'})[extname(path)]||'application/octet-stream');
    res.end(await readFile(path));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:1200,height:1080},acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')console.log('Browser:',m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.selectOption('#language','ko');await mkdir('test-results',{recursive:true});
  await page.click('#jpg-tab');await page.setInputFiles('#file',{name:'keep.jpg',mimeType:'image/jpeg',buffer:Buffer.from([255,216,255])});
  await page.screenshot({path:'test-results/navigation-converter.png',fullPage:true});
  await page.click('#utilities-tab');assert.equal(await page.locator('#convert-section').isVisible(),false);assert.equal(await page.locator('.utility-card').count(),4);
  await page.screenshot({path:'test-results/navigation-utilities.png',fullPage:true});
  await page.click('#convert-tab');assert.match(await page.locator('#queue').innerText(),/keep.jpg/);assert.equal(await page.locator('#jpg-panel').isVisible(),true);
  await page.click('#utilities-tab');await page.locator('.utility-card').nth(1).click();assert.match(page.url(),/qr.html#read/);assert.equal(await page.locator('#qr-upload').isVisible(),true);
  await page.locator('.back-link').click();await page.locator('#utilities-section').waitFor({state:'visible'});assert.equal(await page.locator('#utilities-section').isVisible(),true);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/navigation-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#utilities-tab').focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#convert-section').isVisible(),true);
  assert.deepEqual(errors,[]);console.log('PASS navigation, file selection preservation, QR links, keyboard and mobile.');
}finally{await browser?.close();server.close();}

