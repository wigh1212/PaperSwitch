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
  await page.goto(`http://127.0.0.1:${server.address().port}/image-editor.html#background`);await mkdir('test-results',{recursive:true});
  const fixture=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,1024,1024);x.fillStyle='red';x.fillRect(200,200,624,624);x.fillStyle='white';x.fillRect(400,400,224,224);return [...new Uint8Array(await(await new Promise(r=>c.toBlob(r))).arrayBuffer())];});
  await page.setInputFiles('#image-file',{name:'example.png',mimeType:'image/png',buffer:Buffer.from(fixture)});await page.waitForFunction(()=>!document.getElementById('image-controls').disabled);
  await page.click('#image-half');assert.equal(await page.inputValue('#image-width'),'512');assert.equal(await page.inputValue('#image-height'),'512');await page.click('#image-apply');await page.locator('#image-download').waitFor({state:'visible'});
  const values=await page.evaluate(()=>{const c=document.querySelector('#image-result canvas'),ctx=c.getContext('2d');return [c.width,c.height,...ctx.getImageData(0,0,1,1).data,...ctx.getImageData(256,256,1,1).data];});assert.deepEqual(values,[512,512,0,0,0,0,255,255,255,255]);
  const pending=page.waitForEvent('download');await page.click('#image-download');await(await pending).saveAs('test-results/edited-transparent.png');
  await page.selectOption('#language','ko');await page.screenshot({path:'test-results/image-editor.png',fullPage:true});
  await page.check('#image-all');assert.equal(await page.locator('#image-download').isVisible(),false);await page.click('#image-apply');await page.locator('#image-download').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>document.querySelector('#image-result canvas').getContext('2d').getImageData(256,256,1,1).data[3]),0);
  await page.click('#image-reset');assert.equal(await page.inputValue('#image-width'),'1024');await page.fill('#image-width','256');assert.equal(await page.inputValue('#image-height'),'256');await page.uncheck('#image-lock');await page.fill('#image-height','128');await page.click('#image-apply');await page.locator('#image-download').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>document.querySelector('#image-result canvas').height),128);
  await page.fill('#image-width','0');await page.click('#image-apply');assert.equal(await page.locator('#image-download').isVisible(),false);
  await page.setInputFiles('#image-file',{name:'bad.png',mimeType:'image/png',buffer:Buffer.from('bad')});await page.waitForFunction(()=>document.getElementById('image-status').textContent.length>0);assert.equal(await page.locator('#image-apply').isDisabled(),true);
  assert.deepEqual(errors,[]);console.log('PASS resize 1024→512, alpha, protected interior, all-color removal, reset, ratio, invalid size and file.');
}finally{await browser?.close();server.close();}

