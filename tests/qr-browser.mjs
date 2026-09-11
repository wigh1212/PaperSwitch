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
  await page.goto(`http://127.0.0.1:${server.address().port}/qr.html`);
  await mkdir('test-results',{recursive:true});
  const logo=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=80;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#ee8833';ctx.fillRect(0,0,80,80);return [...new Uint8Array(await(await new Promise(r=>c.toBlob(r))).arrayBuffer())];});
  await writeFile('test-results/qr-test-logo.png',Buffer.from(logo));
  const text='https://example.com/한글?日本語=中文 😀';
  await page.fill('#qr-text',text);await page.click('#qr-generate');await page.locator('#qr-download').waitFor({state:'visible'});
  let pending=page.waitForEvent('download');await page.click('#qr-download');await(await pending).saveAs('test-results/qr-plain.png');
  await page.setInputFiles('#qr-upload','test-results/qr-plain.png');await page.waitForFunction(()=>!document.getElementById('qr-copy').disabled);assert.equal(await page.inputValue('#qr-value'),text);
  await page.setInputFiles('#qr-logo','test-results/qr-test-logo.png');await page.fill('#qr-color','#245d46');await page.click('#qr-generate');await page.locator('#qr-download').waitFor({state:'visible'});
  pending=page.waitForEvent('download');await page.click('#qr-download');await(await pending).saveAs('test-results/qr-logo.png');
  await page.setInputFiles('#qr-upload','test-results/qr-logo.png');await page.waitForFunction(()=>!document.getElementById('qr-copy').disabled);assert.equal(await page.inputValue('#qr-value'),text);
  await page.selectOption('#language','ko');assert.equal(await page.inputValue('#qr-value'),text);assert.match(await page.locator('#qr-generate').innerText(),/만들기/);
  await page.screenshot({path:'test-results/qr-screen.png',fullPage:true});
  await page.fill('#qr-color','#ffffff');assert.equal(await page.locator('#qr-download').isVisible(),false);await page.click('#qr-generate');await page.waitForFunction(()=>!document.getElementById('qr-generate').disabled);assert.equal(await page.locator('#qr-download').isVisible(),false);
  await page.setInputFiles('#qr-upload','test-results/qr-test-logo.png');await page.waitForFunction(()=>!document.getElementById('qr-read-status').textContent.includes('읽는 중'));assert.equal(await page.inputValue('#qr-value'),'');assert.equal(await page.locator('#qr-copy').isDisabled(),true);
  await page.fill('#qr-text','');await page.click('#qr-generate');assert.equal(await page.locator('#qr-download').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('PASS: Unicode QR roundtrip, colored logo QR, language isolation, invalid contrast/image and empty input.');
}finally{await browser?.close();server.close();}
