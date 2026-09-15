import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {compressorRows} from '../web/compressor-copy.mjs';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://pagead2.googlesyndication.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 await page.goto('http://127.0.0.1:4173/ko/image-compressor');await page.waitForSelector('body[data-ready]');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=600;const x=c.getContext('2d');const d=x.createImageData(800,600);for(let i=0;i<d.data.length;i+=4){d.data[i]=(i*13)%251;d.data[i+1]=(i*7)%243;d.data[i+2]=(i*3)%239;d.data[i+3]=i%16?255:0;}x.putImageData(d,0,0);return c.toDataURL().split(',')[1];});
 await page.locator('#compress-file').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await page.waitForFunction(()=>!document.querySelector('#compress-controls').disabled);
 for(const [i,language] of ['en','ko','ja','zh-CN'].entries()){
  await page.selectOption('#language',language);
  assert.equal(await page.title(),compressorRows[16][i]+' | Paper Switch');
  assert.equal(await page.locator('#compress-file').evaluate(n=>n.files.length),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 for(const type of ['image/jpeg','image/png','image/webp']){
  await page.selectOption('#compress-format',type);await page.fill('#compress-target','20');await page.click('#compress-run');
  await page.waitForSelector('#compress-download:not([hidden])');
  const result=await page.locator('#compress-download').evaluate(async a=>{const b=await(await fetch(a.href)).blob(),im=await createImageBitmap(b);const out={size:b.size,type:b.type,width:im.width,height:im.height,name:a.download};im.close();return out;});
  assert.equal(result.type,type);assert.ok(result.size<=20000);assert.ok(result.width<=800);assert.ok(result.name.startsWith('sample-compressed.'));
 }
 await page.selectOption('#compress-format','image/png');await page.uncheck('#compress-resize');await page.fill('#compress-target','1');await page.click('#compress-run');await page.waitForSelector('#compress-download:not([hidden])');
 assert.equal(await page.locator('#compress-status').textContent(),compressorRows[12][3]);
 await page.fill('#compress-target','0');await page.click('#compress-run');assert.equal(await page.locator('#compress-status').textContent(),compressorRows[10][3]);assert.ok(await page.locator('#compress-download').isHidden());
 await page.locator('#compress-file').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('invalid')});await page.waitForFunction(()=>document.querySelector('#compress-status').textContent.length>0);assert.ok(await page.locator('#compress-controls').evaluate(n=>n.disabled));
 assert.deepEqual(errors,[]);
 for(const prefix of ['', '/ko','/ja','/zh-cn']){const html=await readFile('dist'+prefix+'/image-compressor.html','utf8');assert.ok(html.includes('rel="canonical"'));assert.ok(html.includes('adsbygoogle.js'));assert.ok(!html.includes('name="robots" content="noindex"'));}
 console.log('PASS: JPG/PNG/WEBP actual compression, target failure, invalid input, 4 languages, retained file, mobile layout and SEO.');
}finally{await browser.close();}
