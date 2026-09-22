import {searchCopy} from '../web/search-copy.mjs';
import {readFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {tools} from '../web/tools.mjs';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1280,height:900}});
await page.route('https://pagead2.googlesyndication.com/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
const errors=[];page.on('pageerror',error=>errors.push(error.message));
await mkdir('test-results',{recursive:true});
try{
 await page.goto('http://127.0.0.1:4173/');
 assert.equal(await page.locator('.task-nav .dropdown a').count(),tools.length);
 const fixtures=await page.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=80;canvas.height=50;const c=canvas.getContext('2d');c.fillStyle='red';c.fillRect(0,0,80,50);
  const data={};for(const f of ['png','jpeg','webp'])data[f]=canvas.toDataURL('image/'+f).split(',')[1];return data;
 });
 // Use the installed PDF engine to create a PDF with selectable text.
 const {jsPDF}=await import('jspdf');const pdf=new jsPDF();pdf.text('Paper Switch test',20,20);
 const inputs={
 txt:{name:'sample.txt',mimeType:'text/plain',buffer:Buffer.from('Paper Switch test')},
 pdf:{name:'sample.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf.output('arraybuffer'))},
 svg:{name:'sample.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50"><rect width="80" height="50" fill="red"/></svg>')},
 ...Object.fromEntries(['png','jpg','webp'].map(f=>[f,{name:'sample.'+f,mimeType:'image/'+(f==='jpg'?'jpeg':f),buffer:Buffer.from(fixtures[f==='jpg'?'jpeg':f],'base64')}]))
 };
 for(const tool of tools.filter(t=>t.type==='convert'||['qr-generator','qr-reader','image-resizer'].includes(t.slug))){
  const response=await page.goto('http://127.0.0.1:4173/'+tool.slug);
  assert.equal(response.status(),200);
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('h1').textContent(),searchCopy(tool).title[0].split(' – ')[0]);
  assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),searchCopy(tool).description[0]);
  if(tool.type==='convert'){
   const input=tool.slug==='merge-pdf'?'pdf':tool.slug.split('-')[0];
   const output=tool.slug==='merge-pdf'?'pdf':tool.slug.split('-').at(-1);
   assert((await page.locator('#file').getAttribute('accept')).includes('.'+input));
   assert.equal(await page.locator('.mode:visible').count(),0);
   await page.locator('#file').setInputFiles(tool.slug==='merge-pdf'?[inputs.pdf,{...inputs.pdf,name:'second.pdf'}]:inputs[input]);
   await page.locator('#convert').click();
   await page.locator('#download').waitFor({state:'visible',timeout:60000});
   const result=await page.locator('#download').evaluate(async el=>({name:el.download,bytes:[...new Uint8Array(await (await fetch(el.href)).arrayBuffer())]}));
   assert(result.name.endsWith('.'+output),tool.slug+': '+result.name);
   assert(result.bytes.length>10,tool.slug);
   if(output==='tiff')inputs.tiff={name:'sample.tiff',mimeType:'image/tiff',buffer:Buffer.from(result.bytes)};
   if(output==='pdf')assert.equal(Buffer.from(result.bytes).subarray(0,5).toString(),'%PDF-');
   if(output==='txt')assert(Buffer.from(result.bytes).toString().includes('Paper Switch test'));
  }else if(tool.slug==='qr-generator'){
   assert.equal(await page.locator('#read').isVisible(),false);
   await page.locator('#qr-text').fill('https://example.com/paper-switch');
   await page.locator('#qr-generate').click();
   await page.locator('#qr-download').waitFor({state:'visible',timeout:30000});
   fixtures.qr=await page.locator('#qr-download').evaluate(async el=>[...new Uint8Array(await (await fetch(el.href)).arrayBuffer())]);
  }else if(tool.slug==='qr-reader'){
   assert.equal(await page.locator('#create').isVisible(),false);
   await page.locator('#qr-upload').setInputFiles({name:'qr.png',mimeType:'image/png',buffer:Buffer.from(fixtures.qr)});
   await page.waitForFunction(()=>document.getElementById('qr-value').value==='https://example.com/paper-switch');
  }else{
   await page.locator('#image-file').setInputFiles(inputs.png);
   await page.locator('#image-width').fill('40');
   await page.locator('#image-apply').click();
   await page.locator('#image-download').waitFor({state:'visible'});
   assert.equal(await page.locator('#image-result canvas').getAttribute('width'),'40');
  }
  console.log('PASS '+tool.slug);
 }
 await page.goto('http://127.0.0.1:4173/pdf-to-jpg');
 await page.screenshot({path:'test-results/web-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/web-mobile.png',fullPage:true});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
 await page.goto('http://127.0.0.1:4173/not-a-tool');assert.equal(await page.locator('h1').textContent(),'Page not found');
 assert.deepEqual(errors,[]);
 const noJS=await browser.newContext({javaScriptEnabled:false});const raw=await noJS.newPage();
 await raw.goto('http://127.0.0.1:4173/pdf-to-txt');assert.equal(await raw.locator('h1').textContent(),searchCopy(tools.find(t=>t.slug==='pdf-to-txt')).title[0].split(' – ')[0]);assert(await raw.locator('.guide').first().isVisible());await noJS.close();
 console.log('PASS mobile, metadata, 404 and JavaScript-disabled content');
}finally{await browser.close();}

