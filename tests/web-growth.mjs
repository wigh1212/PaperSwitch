import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {jsPDF} from 'jspdf';
import mupdf from '../extension/vendor/mupdf/mupdf.js';
import {wifiPayload} from '../extension/services/wifi-service.js';
import {growthEntries} from '../web/growth-copy.mjs';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://pagead2.googlesyndication.com/**',r=>r.fulfill({body:''}));
 const fixture=new jsPDF();fixture.text('PAGE ONE',20,20);fixture.addPage();fixture.text('PAGE TWO',20,20);fixture.addPage();fixture.text('PAGE THREE',20,20);
 const bytes=Buffer.from(fixture.output('arraybuffer'));
 for(const mode of ['split-pdf','extract-pdf-pages','delete-pdf-pages','rotate-pdf']){
  await page.goto('http://127.0.0.1:4173/ko/'+mode);await page.waitForSelector('body[data-ready]');
  await page.locator('#ft-file').setInputFiles({name:'pages.pdf',mimeType:'application/pdf',buffer:bytes});await page.waitForSelector('#ft-pages input');assert.equal(await page.locator('#ft-pages input').count(),3);
  if(mode!=='split-pdf'){await page.click('#ft-none');await page.locator('#ft-pages input').nth(1).check();}
  await page.click('#ft-save');await page.waitForSelector('#ft-results a');
  const results=await page.locator('#ft-results a').evaluateAll(async links=>Promise.all(links.filter(a=>a.download.endsWith('.pdf')).map(async a=>[a.download,Array.from(new Uint8Array(await(await fetch(a.href)).arrayBuffer()))])));
  assert.equal(results.length,mode==='split-pdf'?3:1);
  for(const [,raw] of results){const doc=mupdf.Document.openDocument(new Uint8Array(raw),'application/pdf');try{assert.equal(doc.countPages(),mode==='delete-pdf-pages'?2:mode==='rotate-pdf'?3:1);if(mode==='extract-pdf-pages'){const pg=doc.loadPage(0),st=pg.toStructuredText();assert.match(st.asText(),/PAGE TWO/);st.destroy();pg.destroy();}if(mode==='rotate-pdf'){const pg=doc.loadPage(1);assert.equal(pg.getObject().getInheritable('Rotate').asNumber(),90);pg.destroy();}}finally{doc.destroy();}}
  if(mode==='delete-pdf-pages'){await page.click('#ft-all');await page.click('#ft-save');await page.waitForFunction(()=>!document.querySelector('#ft-controls').disabled);assert.equal(await page.locator('#ft-results a').count(),0);}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 console.log('PASS PDF thumbnails, split, extract text, delete, rotate and all-page deletion guard');
 await page.goto('http://127.0.0.1:4173/ko/wifi-qr');await page.waitForSelector('body[data-ready]');await page.fill('#wifi-ssid','Cafe;한글');await page.fill('#wifi-password','a:b;c,d');await page.click('#qr-generate');await page.waitForSelector('#qr-download:not([hidden])');
 const decoded=await page.evaluate(async()=>{const {readCanvas}=await import('/assets/services/qr-service.js');return readCanvas(document.querySelector('#qr-preview canvas'));});assert.equal(decoded,wifiPayload({ssid:'Cafe;한글',password:'a:b;c,d'}));
 await page.selectOption('#language','ja');assert.equal(await page.locator('#wifi-password').inputValue(),'a:b;c,d');await page.click('[data-frame="classic"]');await page.fill('#qr-frame-title','Wi-Fi');await page.waitForSelector('#qr-download:not([hidden])');
 console.log('PASS Wi-Fi escaping, QR decoding, framing and language retention');
 for(const output of ['jpg','png']){
  await page.goto('http://127.0.0.1:4173/ko/heic-to-'+output);await page.waitForSelector('body[data-ready]');await page.locator('#ft-file').setInputFiles('test-results/sample.heic');await page.click('#ft-save');await page.waitForSelector('#ft-results a',{timeout:120000});
  const result=await page.locator('#ft-results a').first().evaluate(async a=>{const b=await(await fetch(a.href)).blob(),im=await createImageBitmap(b);const result={width:im.width,height:im.height,size:b.size,name:a.download};im.close();return result;});assert.ok(result.width>0&&result.height>0&&result.size>0);assert.ok(result.name.endsWith('.'+output));
 }
 console.log('PASS real HEIC to JPG and PNG decoding');
 for(const entry of growthEntries)for(const [i,prefix] of ['', '/ko','/ja','/zh-cn'].entries()){const html=await readFile('dist'+prefix+'/'+entry[0]+'.html','utf8');assert.ok(html.includes(entry[i+1]),entry[0]+prefix);assert.ok(html.includes('rel="canonical"'));assert.ok(html.includes('adsbygoogle.js'));}
 assert.deepEqual(errors,[]);console.log('PASS 28 localized pages and no browser errors');
}finally{await browser.close();}
