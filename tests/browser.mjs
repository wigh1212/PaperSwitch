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
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  await page.click('#jpg-tab');
  assert.equal(await page.locator('#jpg-panel .mode').count(),10);
  const rasterFixtures=await page.evaluate(async()=>{
    const c=new OffscreenCanvas(40,30),ctx=c.getContext('2d');ctx.fillStyle='#ef4020';ctx.fillRect(0,0,40,30);
    const result={};for(const [key,type] of Object.entries({jpg:'image/jpeg',png:'image/png',webp:'image/webp'}))result[key]=[...new Uint8Array(await(await c.convertToBlob({type})).arrayBuffer())];
    const {encodeTIFF}=await import('./tiff.js');result.tiff=[...encodeTIFF(new Uint8Array(40*30*3).fill(120),40,30)];return result;
  });
  const jpgTestPDF=new jsPDF();jpgTestPDF.text('JPG source',20,20);
  const fixtures={...Object.fromEntries(Object.entries(rasterFixtures).map(([k,v])=>[k,Buffer.from(v)])),pdf:Buffer.from(jpgTestPDF.output('arraybuffer')),svg:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="red"/></svg>')};
  for(const format of ['pdf','svg','png','webp','tiff'])for(const [input,output] of [['jpg',format],[format,'jpg']]){
    await page.click('#jpg-tab-'+input+'-'+output+'-mode');
    await page.setInputFiles('#file',{name:'fixture.'+(input==='jpg'?'jpeg':input),mimeType:'application/octet-stream',buffer:fixtures[input]});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
    await mkdir('test-results',{recursive:true});
    const pending=page.waitForEvent('download');await page.click('#download');const download=await pending;const target='test-results/jpg-tab-'+input+'-'+output+'.'+output;await download.saveAs(target);
    const data=await readFile(target),result=[...data];
    if(output==='pdf')assert.equal(data.subarray(0,4).toString(),'%PDF');
    else if(output==='svg')assert.match(data.toString(),/<image/);
    else if(output==='tiff')assert.deepEqual([...data.subarray(0,4)],[73,73,42,0]);
    else {
      const dims=await page.evaluate(async bytes=>{const image=await createImageBitmap(new Blob([new Uint8Array(bytes)]));const dims=[image.width,image.height];image.close();return dims;},result);
      assert.ok(dims[0]>0&&dims[1]>0);
      if(input==='jpg'||['png','webp'].includes(input))assert.deepEqual(dims,[40,30]);
      if(output==='jpg')assert.deepEqual([...data.subarray(0,3)],[255,216,255]);
    }
  }
  await page.click('#png-tab');
  for(const format of ['pdf','svg','jpg','webp','tiff'])for(const [input,output] of [['png',format],[format,'png']]){
    await page.click('#png-tab-'+input+'-'+output+'-mode');
    await page.setInputFiles('#file',{name:'fixture.'+(input==='jpg'?'jpeg':input),mimeType:'application/octet-stream',buffer:fixtures[input]});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
    await mkdir('test-results',{recursive:true});
    const pending=page.waitForEvent('download');await page.click('#download');const download=await pending;const target='test-results/png-tab-'+input+'-'+output+'.'+output;await download.saveAs(target);
    const data=await readFile(target),result=[...data];
    if(output==='pdf')assert.equal(data.subarray(0,4).toString(),'%PDF');
    else if(output==='svg')assert.match(data.toString(),/<image/);
    else if(output==='tiff')assert.deepEqual([...data.subarray(0,4)],[73,73,42,0]);
    else {
      const dims=await page.evaluate(async bytes=>{const image=await createImageBitmap(new Blob([new Uint8Array(bytes)]));const dims=[image.width,image.height];image.close();return dims;},result);
      assert.ok(dims[0]>0&&dims[1]>0);
      if(input==='jpg'||['png','webp'].includes(input))assert.deepEqual(dims,[40,30]);
      if(output==='jpg')assert.deepEqual([...data.subarray(0,3)],[255,216,255]);
    }
  }
  await page.click('#webp-tab');
  for(const format of ["pdf","svg","jpg","png","tiff"])for(const [input,output] of [['webp',format],[format,'webp']]){
    await page.click('#webp-tab-'+input+'-'+output+'-mode');
    await page.setInputFiles('#file',{name:'fixture.'+(input==='jpg'?'jpeg':input),mimeType:'application/octet-stream',buffer:fixtures[input]});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
    await mkdir('test-results',{recursive:true});
    const pending=page.waitForEvent('download');await page.click('#download');const download=await pending;const target='test-results/webp-tab-'+input+'-'+output+'.'+output;await download.saveAs(target);
    const data=await readFile(target),result=[...data];
    if(output==='pdf')assert.equal(data.subarray(0,4).toString(),'%PDF');
    else if(output==='svg')assert.match(data.toString(),/<image/);
    else if(output==='tiff')assert.deepEqual([...data.subarray(0,4)],[73,73,42,0]);
    else {
      const dims=await page.evaluate(async bytes=>{const image=await createImageBitmap(new Blob([new Uint8Array(bytes)]));const dims=[image.width,image.height];image.close();return dims;},result);
      assert.ok(dims[0]>0&&dims[1]>0);
      if(input==='jpg'||['png','webp'].includes(input))assert.deepEqual(dims,[40,30]);
      if(output==='jpg')assert.deepEqual([...data.subarray(0,3)],[255,216,255]);
    }
  }
  await page.click('#tiff-tab');
  for(const format of ["pdf","svg","jpg","png","webp"])for(const [input,output] of [['tiff',format],[format,'tiff']]){
    await page.click('#tiff-tab-'+input+'-'+output+'-mode');
    await page.setInputFiles('#file',{name:'fixture.'+(input==='jpg'?'jpeg':input),mimeType:'application/octet-stream',buffer:fixtures[input]});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
    await mkdir('test-results',{recursive:true});
    const pending=page.waitForEvent('download');await page.click('#download');const download=await pending;const target='test-results/tiff-tab-'+input+'-'+output+'.'+output;await download.saveAs(target);
    const data=await readFile(target),result=[...data];
    if(output==='pdf')assert.equal(data.subarray(0,4).toString(),'%PDF');
    else if(output==='svg')assert.match(data.toString(),/<image/);
    else if(output==='tiff')assert.deepEqual([...data.subarray(0,4)],[73,73,42,0]);
    else {
      const dims=await page.evaluate(async bytes=>{const image=await createImageBitmap(new Blob([new Uint8Array(bytes)]));const dims=[image.width,image.height];image.close();return dims;},result);
      assert.ok(dims[0]>0&&dims[1]>0);
      if(input==='jpg'||['png','webp'].includes(input))assert.deepEqual(dims,[40,30]);
      if(output==='jpg')assert.deepEqual([...data.subarray(0,3)],[255,216,255]);
    }
  }
  // Link two baseline TIFF directories to exercise multipage input.
  const firstTIFF=Buffer.from(fixtures.tiff),secondTIFF=Buffer.from(fixtures.tiff),shift=firstTIFF.length;
  firstTIFF.writeUInt32LE(shift+8,8+2+firstTIFF.readUInt16LE(8)*12);
  const tagCount=secondTIFF.readUInt16LE(8);
  for(let i=0;i<tagCount;i++){const pos=10+i*12,tag=secondTIFF.readUInt16LE(pos);if(tag===258||tag===273)secondTIFF.writeUInt32LE(secondTIFF.readUInt32LE(pos+8)+shift,pos+8);}
  const multiTIFF=Buffer.concat([firstTIFF,secondTIFF]);
  for(const output of ['pdf','svg','jpg','png','webp']){
    await page.click('#tiff-tab-tiff-'+output+'-mode');
    await page.setInputFiles('#file',{name:'two-pages.tif',mimeType:'image/tiff',buffer:multiTIFF});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
    const pending=page.waitForEvent('download');await page.click('#download');const download=await pending;const path='test-results/tiff-multipage-'+output;await download.saveAs(path);const bytes=await readFile(path);
    if(output==='pdf'){const doc=mupdf.Document.openDocument(bytes,'application/pdf');assert.equal(doc.countPages(),2);doc.destroy();}
    else assert.equal(Object.keys(unzipSync(bytes)).length,2);
  }
  await page.setViewportSize({width:390,height:900});await page.screenshot({path:'test-results/six-tabs-mobile.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.setViewportSize({width:1200,height:1080});
  for(const [language,text] of [['jpn+eng','日本語の文書 TEST 12345'],['chi_sim+eng','中文文档测试 TEST 12345'],['chi_tra+eng','繁體中文測試 TEST 12345'],['fra+eng','Bonjour le monde TEST 12345'],['deu+eng','Guten Morgen TEST 12345'],['spa+eng','Buenos días TEST 12345'],['por+eng','Bom dia TEST 12345']]){
    const recognized=await page.evaluate(async({language,text})=>{
      const {default:Tesseract}=await import('./vendor/ocr/tesseract.esm.min.js');
      const c=document.createElement('canvas');c.width=1400;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='black';ctx.font='52px sans-serif';ctx.fillText(text,30,95);
      const worker=await Tesseract.createWorker(language,1,{workerPath:new URL('./vendor/ocr/worker.min.js',location.href).href,corePath:new URL('./vendor/ocr/core',location.href).href,langPath:new URL('./vendor/ocr/lang',location.href).href,workerBlobURL:false,gzip:false,cacheMethod:'none'});
      try{return (await worker.recognize(c)).data.text;}finally{await worker.terminate();}
    },{language,text});assert.match(recognized,/12345/);console.log('OCR language',language,recognized.trim());
  }
  await page.click('#pdf-tab');
  await page.selectOption('#language','ko');
  await mkdir('test-results',{recursive:true});
  await page.screenshot({path:'test-results/screen.png',fullPage:true});
  await page.click('#pdf-merge-mode');
  const mergeA=new jsPDF();mergeA.text('FIRST',20,20);mergeA.addPage();mergeA.text('SECOND',20,20);
  const mergeB=new jsPDF({format:'a5'});mergeB.text('THIRD',20,20);
  await page.setInputFiles('#file',[
    {name:'a.pdf',mimeType:'application/pdf',buffer:Buffer.from(mergeA.output('arraybuffer'))},
    {name:'b.pdf',mimeType:'application/pdf',buffer:Buffer.from(mergeB.output('arraybuffer'))}
  ]);
  assert.equal(await page.locator('#pdf-options').isVisible(),false);
  await page.locator('#queue li').nth(1).locator('button').first().click();
  assert.match(await page.locator('#queue li').first().innerText(),/b.pdf/);
  await page.click('#convert');
  await page.locator('#result').waitFor({state:'visible',timeout:30000});
  const mergedDownload=page.waitForEvent('download');await page.click('#download');
  await (await mergedDownload).saveAs('test-results/merged.pdf');
  const merged=mupdf.Document.openDocument(await readFile('test-results/merged.pdf'),'application/pdf');
  assert.equal(merged.countPages(),3);
  for(const [index,expected] of ['THIRD','FIRST','SECOND'].entries()){
    const p=merged.loadPage(index),text=p.toStructuredText();
    assert.match(text.asText(),new RegExp(expected));text.destroy();p.destroy();
  }
  merged.destroy();
  await page.setInputFiles('#file',[
    {name:'a.pdf',mimeType:'application/pdf',buffer:Buffer.from(mergeA.output('arraybuffer'))},
    {name:'bad.pdf',mimeType:'application/pdf',buffer:Buffer.from('broken')}
  ]);
  await page.click('#convert');
  await page.waitForFunction(()=>!document.getElementById('convert').disabled);
  assert.equal(await page.locator('#result').isVisible(),false);
  assert.ok(await page.locator('#status').innerText());
  await page.click('#svg-mode');
  assert.equal(await page.locator('#pdf-output-options').isVisible(),true);
  await page.check('[name="pdf-output"][value="combined"]');
  await page.setInputFiles('#file',['red','blue'].map(color=>({name:color+'.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="'+color+'"/></svg>')})));
  await page.locator('#queue li').nth(1).locator('button').first().click();
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
  const combinedDownload=page.waitForEvent('download');await page.click('#download');await (await combinedDownload).saveAs('test-results/combined-svg.pdf');
  const combinedPDF=mupdf.Document.openDocument(await readFile('test-results/combined-svg.pdf'),'application/pdf');
  assert.equal(combinedPDF.countPages(),2);
  for(const [i,color] of [[0,[0,0,255]],[1,[255,0,0]]]){const p=combinedPDF.loadPage(i),pix=p.toPixmap([1,0,0,1,0,0],mupdf.ColorSpace.DeviceRGB,false,true);assert.deepEqual([...pix.getPixels().slice(0,3)],color);pix.destroy();p.destroy();}
  combinedPDF.destroy();
  await page.check('[name="pdf-output"][value="individual"]');
  assert.equal(await page.locator('#result').isVisible(),false);
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><style>.st0{fill:#28684f;} .st1{fill:orange;}</style><rect class="st0" x="10" y="10" width="200" height="100"/><circle class="st1" cx="260" cy="90" r="30"/></svg>';
  await page.setInputFiles('#file',{name:'sample.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
  await page.click('#convert');
  await page.locator('#result').waitFor({state:'visible',timeout:30000});
  const download=page.waitForEvent('download');await page.click('#download');
  await (await download).saveAs('test-results/sample.pdf');
  const pdf=mupdf.Document.openDocument(await readFile('test-results/sample.pdf'),'application/pdf');
  assert.equal(pdf.countPages(),1);const p=pdf.loadPage(0);assert.deepEqual(p.getBounds(),[0,0,240,135]);
  const pix=p.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);
  const pixels=pix.getPixels();const offset=(30*pix.getWidth()+30)*3;
  assert.deepEqual([...pixels.slice(offset,offset+3)],[40,104,79]);
  pix.destroy();p.destroy();pdf.destroy();
  // Modern design tools often use CSS variables and inherited currentColor.
  const styledSVG='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><style>:root{--brand:#28684f}.shape{fill:var(--brand)}.group{color:#ffa500}.accent{fill:currentColor}</style><rect class="shape" x="10" y="10" width="200" height="100"/><g class="group"><circle class="accent" cx="260" cy="90" r="30"/></g></svg>';
  await page.setInputFiles('#file',{name:'css-variables.svg',mimeType:'image/svg+xml',buffer:Buffer.from(styledSVG)});
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  const styleDownload=page.waitForEvent('download');await page.click('#download');await(await styleDownload).saveAs('test-results/css-variables.pdf');
  const styleDoc=mupdf.Document.openDocument(await readFile('test-results/css-variables.pdf'),'application/pdf');const stylePage=styleDoc.loadPage(0);const stylePix=stylePage.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);
  assert.deepEqual([...stylePix.getPixels().slice((30*240+30)*3,(30*240+30)*3+3)],[40,104,79]);
  stylePix.destroy();stylePage.destroy();styleDoc.destroy();
  for(const name of ['next','prev']){
    const input=await readFile(resolve(process.env.SVG_ICONS||'tests/fixtures/svg',`${name}.svg`));
    await page.setInputFiles('#file',{name:`${name}.svg`,mimeType:'image/svg+xml',buffer:input});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
    const saved=page.waitForEvent('download');await page.click('#download');await mkdir('output',{recursive:true});await(await saved).saveAs(`output/${name}.pdf`);
    const d=mupdf.Document.openDocument(await readFile(`output/${name}.pdf`),'application/pdf');const p=d.loadPage(0);const pix=p.toPixmap([8/3,0,0,8/3,0,0],mupdf.ColorSpace.DeviceRGB,false,true);
    await writeFile(`test-results/${name}-pdf.png`,pix.asPNG());
    // Sample the pale gray circle away from the arrow.
    const offset=(20*pix.getWidth()+50)*3;assert.ok([...pix.getPixels().slice(offset,offset+3)].every((v,i)=>Math.abs(v-[221,227,232][i])<=2));
    const svgBytes=(await import('../extension/core.js')).renderPage(mupdf,p,'svg');assert.match(new TextDecoder().decode(svgBytes),/<path/);assert.doesNotMatch(new TextDecoder().decode(svgBytes),/<image/);
    pix.destroy();p.destroy();d.destroy();
  }
  if(process.env.SVG_FIXTURE) {
    const input=await readFile(process.env.SVG_FIXTURE);
    await page.setInputFiles('#file',{name:'완주.svg',mimeType:'image/svg+xml',buffer:input});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
    const actual=page.waitForEvent('download');await page.click('#download');
    await mkdir('output',{recursive:true});await (await actual).saveAs('output/완주.pdf');
    const actualDoc=mupdf.Document.openDocument(await readFile('output/완주.pdf'),'application/pdf');
    const actualPage=actualDoc.loadPage(0);
    const extracted=actualPage.toStructuredText();
    assert.match(extracted.asText(),/성명/);assert.match(extracted.asText(),/인증번호/);extracted.destroy();
    const rendered=actualPage.toPixmap([4/3,0,0,4/3,0,0],mupdf.ColorSpace.DeviceRGB,false,true);
    await writeFile('test-results/wanju-pdf.png',rendered.asPNG());
    const reference=await page.evaluate(async(base64)=>{
      const img=new Image();img.src='data:image/svg+xml;base64,'+base64;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);
      return {png:canvas.toDataURL().split(',')[1],pixels:Array.from(ctx.getImageData(0,0,canvas.width,canvas.height).data)};
    },input.toString('base64'));
    await writeFile('test-results/wanju-original.png',Buffer.from(reference.png,'base64'));
    const rgb=rendered.getPixels();let difference=0;
    assert.equal(rgb.length/3,reference.pixels.length/4);
    for(let i=0;i<rgb.length;i++) difference+=Math.abs(rgb[i]-reference.pixels[Math.floor(i/3)*4+i%3]);
    const mean=difference/rgb.length;console.log('Wanju mean RGB difference:',mean.toFixed(3));assert.ok(mean<5,'SVG and PDF must visually agree');
    rendered.destroy();actualPage.destroy();actualDoc.destroy();
  }
  await page.click('#pdf-mode');
  const fixture=new jsPDF();fixture.text('Page one',20,20);fixture.addPage();fixture.text('Page two',20,20);
  await page.setInputFiles('#file',{name:'two-pages.pdf',mimeType:'application/pdf',buffer:Buffer.from(fixture.output('arraybuffer'))});
  await page.click('#convert');
  await page.waitForFunction(()=>!document.querySelector('#result').hidden || document.querySelector('#status').classList.contains('error'),{},{timeout:30000});
  assert.equal(await page.locator('#status').textContent(),'');
  const zipDownload=page.waitForEvent('download');await page.click('#download');await (await zipDownload).saveAs('test-results/pages.zip');
  const files=unzipSync(await readFile('test-results/pages.zip'));assert.equal(Object.keys(files).length,2);
  for(const bytes of Object.values(files))assert.match(new TextDecoder().decode(bytes),/<path/);
  await page.fill('#pages','99');await page.click('#convert');await page.locator('#status.error').waitFor();
  await page.click('#svg-mode');
  await page.setInputFiles('#file',{name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')});
  await page.click('#convert');await page.locator('#status.error').waitFor();
  // A failed file does not prevent later files, and duplicate names stay distinct.
  await page.setInputFiles('#file',[
    {name:'same.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)},
    {name:'broken.svg',mimeType:'image/svg+xml',buffer:Buffer.from('broken')},
    {name:'same.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)}
  ]);
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  assert.match(await page.locator('#result-info').textContent(),/성공 2개 · 실패 1개/);
  assert.equal(await page.locator('#downloads a').count(),2);
  assert.match(await page.locator('#queue').textContent(),/실패/);
  const batchDownload=page.waitForEvent('download');await page.click('#download');await (await batchDownload).saveAs('test-results/batch.zip');
  const batchEntries=unzipSync(await readFile('test-results/batch.zip'));
  assert.deepEqual(Object.keys(batchEntries),['01-same.pdf','03-same.pdf']);
  await page.click('#pdf-webp-mode');
  const colored=new jsPDF({unit:'pt',format:[120,80],orientation:'landscape'});
  colored.setFillColor(40,104,79);colored.rect(0,0,120,80,'F');colored.addPage([120,80],'landscape');colored.setFillColor(255,180,0);colored.rect(0,0,120,80,'F');
  await page.setInputFiles('#file',[
    {name:'colors.pdf',mimeType:'application/pdf',buffer:Buffer.from(colored.output('arraybuffer'))},
    {name:'colors.pdf',mimeType:'application/pdf',buffer:Buffer.from(colored.output('arraybuffer'))}
  ]);
  await page.fill('#pages','1-2');await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
  assert.equal(await page.locator('#downloads a').count(),4);
  const webpsDownload=page.waitForEvent('download');await page.click('#download');await (await webpsDownload).saveAs('test-results/webps.zip');
  const webps=unzipSync(await readFile('test-results/webps.zip'));
  assert.equal(Object.keys(webps).length,4);
  const first=Object.values(webps)[0];assert.equal(Buffer.from(first.slice(8,12)).toString(),'WEBP');
  const dimensions=await page.evaluate(async(bytes)=>{const img=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/webp'}));const size=[img.width,img.height];img.close();return size;},[...first]);
  assert.deepEqual(dimensions,[240,160]);
  await page.click('#webp-pdf-mode');
  await page.setInputFiles('#file',Object.values(webps).slice(0,2).map((buffer,i)=>({name:`image-${i}.webp`,mimeType:'image/webp',buffer:Buffer.from(buffer)})));
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:30000});
  const imagePdfs=page.waitForEvent('download');await page.click('#download');await (await imagePdfs).saveAs('test-results/image-pdfs.zip');
  const imageOutputs=unzipSync(await readFile('test-results/image-pdfs.zip'));
  assert.equal(Object.keys(imageOutputs).length,2);
  for(const bytes of Object.values(imageOutputs)){
    const doc=mupdf.Document.openDocument(bytes,'application/pdf');assert.equal(doc.countPages(),1);
    const p=doc.loadPage(0);assert.deepEqual(p.getBounds(),[0,0,180,120]);
    const rendered=p.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);
    const sample=[...rendered.getPixels().slice((30*180+30)*3,(30*180+30)*3+3)];
    const expected=bytes===Object.values(imageOutputs)[0]?[40,104,79]:[255,180,0];
    assert.ok(sample.every((value,i)=>Math.abs(value-expected[i])<8),'WebP round-trip colors');
    rendered.destroy();p.destroy();doc.destroy();
  }
  await page.screenshot({path:'test-results/batch-screen.png',fullPage:true});
  await page.click('#pdf-webp-mode');
  await page.setInputFiles('#file',{name:'cancel.pdf',mimeType:'application/pdf',buffer:Buffer.from(colored.output('arraybuffer'))});
  await page.evaluate(()=>{document.querySelector('#convert').click();document.querySelector('#cancel').click();});
  assert.match(await page.locator('#status').textContent(),/취소/);
  assert.equal(await page.locator('#convert').isEnabled(),true);
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);
  await page.click('#svg-tab');
  assert.equal(await page.locator('#pdf-panel').isVisible(),false);
  assert.equal(await page.locator('#svg-panel').isVisible(),true);
  for(const format of ['pdf','png','jpg','webp','tiff']) {
    await page.click(`#svg-${format}-mode`);
    await page.setInputFiles('#file', ['one.svg','two.svg'].map(name=>({name,mimeType:'image/svg+xml',buffer:Buffer.from(svg)})));
    if(format!=='pdf')await page.selectOption('#scale','1');
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
    assert.equal(await page.locator('#downloads a').count(),2);
    const saved=page.waitForEvent('download');await page.click('#download');await(await saved).saveAs(`test-results/svg-${format}.zip`);
    const entries=unzipSync(await readFile(`test-results/svg-${format}.zip`));assert.equal(Object.keys(entries).length,2);
    await page.click(`#${format}-svg-mode`);
    await page.setInputFiles('#file',Object.entries(entries).map(([name,bytes])=>({name,mimeType:'application/octet-stream',buffer:Buffer.from(bytes)})));
    if(format==='pdf')await page.fill('#pages','');
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
    assert.equal(await page.locator('#downloads a').count(),2);
    const reverse=page.waitForEvent('download');await page.click('#download');await(await reverse).saveAs(`test-results/${format}-svg.zip`);
    for(const bytes of Object.values(unzipSync(await readFile(`test-results/${format}-svg.zip`)))){
      const svgText=new TextDecoder().decode(bytes);assert.match(svgText,/<svg/);
      if(format!=='pdf')assert.match(svgText,/<image/);
      const color=await page.evaluate(async(text)=>{const img=new Image();img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(text)));await img.decode();const c=new OffscreenCanvas(img.naturalWidth,img.naturalHeight);const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return [...ctx.getImageData(20,20,1,1).data].slice(0,3);},svgText);
      assert.ok(color.every((v,i)=>Math.abs(v-[40,104,79][i])<8));
    }
    for(const [name,bytes] of Object.entries(entries)){
      assert.ok(name.endsWith(`.${format}`));
      if(format==='pdf'||format==='tiff'){
        const d=mupdf.Document.openDocument(bytes,format==='pdf'?'application/pdf':'image/tiff');const p=d.loadPage(0);const pix=p.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);const offset=(20*pix.getWidth()+20)*3;assert.deepEqual([...pix.getPixels().slice(offset,offset+3)],[40,104,79]);pix.destroy();p.destroy();d.destroy();
      }else{
        const output=await page.evaluate(async({bytes,format})=>{const img=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:format==='jpg'?'image/jpeg':`image/${format}`}));const c=new OffscreenCanvas(img.width,img.height);const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const result={size:[img.width,img.height],rgb:[...ctx.getImageData(20,20,1,1).data].slice(0,3)};img.close();return result;},{bytes:[...bytes],format});
        assert.deepEqual(output.size,[320,180]);assert.ok(output.rgb.every((v,i)=>Math.abs(v-[40,104,79][i])<8));
      }
    }
  }
  await page.screenshot({path:'test-results/svg-tab.png',fullPage:true});
  await page.click('#pdf-tab');assert.equal(await page.locator('#svg-panel').isVisible(),false);
  const scanImage=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1400;c.height=500;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='black';ctx.font='52px sans-serif';ctx.fillText('한글 문서 변환 테스트',60,120);ctx.fillText('OCR TEST 12345',60,230);return c.toDataURL('image/png');});
  const scan=new jsPDF({unit:'pt',format:[700,250],orientation:'landscape'});scan.addImage(scanImage,'PNG',0,0,700,250);
  await page.click('#pdf-txt-mode');await page.fill('#pages','');
  await page.setInputFiles('#file',{name:'scan.pdf',mimeType:'application/pdf',buffer:Buffer.from(scan.output('arraybuffer'))});
  await page.click('#convert');
  await page.waitForFunction(()=>!document.querySelector('#result').hidden||document.querySelector('#status').classList.contains('error'),{},{timeout:60000});
  assert.equal(await page.locator('#status').textContent(),'');
  const ocrDownload=page.waitForEvent('download');await page.click('#download');await(await ocrDownload).saveAs('test-results/ocr.txt');
  const ocrText=await readFile('test-results/ocr.txt','utf8');console.log('OCR:',ocrText);assert.match(ocrText,/12345/);assert.match(ocrText,/한글/);
  for(const format of ['png','tiff']) {
    await page.click(`#pdf-${format}-mode`);
    await page.setInputFiles('#file',{name:'color.pdf',mimeType:'application/pdf',buffer:Buffer.from(colored.output('arraybuffer'))});
    await page.fill('#pages','1');await page.selectOption('#scale','1');
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
    const out=page.waitForEvent('download');await page.click('#download');await(await out).saveAs(`test-results/color.${format}`);
    const bytes=await readFile(`test-results/color.${format}`);
    assert.deepEqual([...bytes.slice(0,4)],format==='png'?[137,80,78,71]:[73,73,42,0]);
    await page.click(`#${format}-pdf-mode`);
    await page.setInputFiles('#file',{name:`color.${format==='tiff'?'tif':format}`,mimeType:`image/${format}`,buffer:bytes});
    await page.click('#convert');
    await page.waitForFunction(()=>!document.querySelector('#result').hidden||document.querySelector('#status').classList.contains('error'));
    assert.equal(await page.locator('#status').textContent(),'');
    const back=page.waitForEvent('download');await page.click('#download');await(await back).saveAs(`test-results/${format}-back.pdf`);
    const doc=mupdf.Document.openDocument(await readFile(`test-results/${format}-back.pdf`),'application/pdf');const p=doc.loadPage(0);
    const pix=p.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);
    const offset=(10*pix.getWidth()+10)*3;assert.deepEqual([...pix.getPixels().slice(offset,offset+3)],[40,104,79]);pix.destroy();p.destroy();doc.destroy();
  }
  await page.click('#txt-pdf-mode');
  const text='한글 변환 확인\n'+Array.from({length:110},(_,i)=>`문서 내용 ${i+1}`).join('\n');
  await page.setInputFiles('#file',{name:'한글.txt',mimeType:'text/plain',buffer:Buffer.from(text)});
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  const textPdf=page.waitForEvent('download');await page.click('#download');await(await textPdf).saveAs('test-results/text.pdf');
  const textDoc=mupdf.Document.openDocument(await readFile('test-results/text.pdf'),'application/pdf');assert.ok(textDoc.countPages()>1);textDoc.destroy();
  await page.click('#pdf-txt-mode');await page.fill('#pages','');
  await page.setInputFiles('#file',{name:'text.pdf',mimeType:'application/pdf',buffer:await readFile('test-results/text.pdf')});
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  const textDownload=page.waitForEvent('download');await page.click('#download');await(await textDownload).saveAs('test-results/extracted.txt');
  const extractedText=await readFile('test-results/extracted.txt','utf8');assert.match(extractedText,/한글 변환 확인/);assert.match(extractedText,/문서 내용 110/);
  await page.setInputFiles('#file',{name:'no-text.pdf',mimeType:'application/pdf',buffer:Buffer.from(colored.output('arraybuffer'))});
  await page.click('#convert');await page.locator('#status.error').waitFor();assert.match(await page.locator('#queue').textContent(),/OCR/);
  await page.click('#pdf-jpg-mode');
  const jpgButtons=await page.locator('[aria-label="JPG 변환"] button').evaluateAll(nodes=>nodes.map(n=>n.id));
  assert.deepEqual(jpgButtons,['pdf-jpg-mode','jpg-pdf-mode']);
  await page.setInputFiles('#file',[1,2].map(i=>({name:`pages-${i}.pdf`,mimeType:'application/pdf',buffer:Buffer.from(colored.output('arraybuffer'))})));
  await page.fill('#pages','2');await page.selectOption('#scale','1');
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  const rasterDownload=page.waitForEvent('download');await page.click('#download');await(await rasterDownload).saveAs('test-results/pdf-jpg.zip');
  const jpgs=unzipSync(await readFile('test-results/pdf-jpg.zip'));assert.equal(Object.keys(jpgs).length,2);
  for(const [name,bytes] of Object.entries(jpgs)){
    assert.match(name,/-page-2\.jpg$/);assert.deepEqual([...bytes.slice(0,3)],[255,216,255]);
    const rendered=await page.evaluate(async(data)=>{const img=await createImageBitmap(new Blob([new Uint8Array(data)],{type:'image/jpeg'}));const c=new OffscreenCanvas(img.width,img.height);const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const result={size:[img.width,img.height],rgb:[...ctx.getImageData(20,20,1,1).data].slice(0,3)};img.close();return result;},[...bytes]);
    assert.deepEqual(rendered.size,[120,80]);assert.ok(rendered.rgb.every((v,i)=>Math.abs(v-[255,180,0][i])<5));
  }
  await page.screenshot({path:'test-results/pdf-jpg-screen.png',fullPage:true});
  await page.click('#jpg-pdf-mode');
  const jpeg=await page.evaluate(async()=>{const c=new OffscreenCanvas(80,120);const ctx=c.getContext('2d');ctx.fillStyle='#28684f';ctx.fillRect(0,0,80,120);return Array.from(new Uint8Array(await(await c.convertToBlob({type:'image/jpeg',quality:1})).arrayBuffer()));});
  await page.setInputFiles('#file',['photo.jpg','photo.jpeg'].map(name=>({name,mimeType:'image/jpeg',buffer:Buffer.from(jpeg)})));
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  assert.equal(await page.locator('#downloads a').count(),2);
  const jpgDownload=page.waitForEvent('download');await page.click('#download');await(await jpgDownload).saveAs('test-results/jpg-pdfs.zip');
  for(const bytes of Object.values(unzipSync(await readFile('test-results/jpg-pdfs.zip')))){
    const doc=mupdf.Document.openDocument(bytes,'application/pdf');const p=doc.loadPage(0);assert.deepEqual(p.getBounds(),[0,0,60,90]);
    const pix=p.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);const rgb=pix.getPixels().slice((20*60+20)*3,(20*60+20)*3+3);
    assert.ok([...rgb].every((v,i)=>Math.abs(v-[40,104,79][i])<5));pix.destroy();p.destroy();doc.destroy();
  }
  await page.setInputFiles('#file',{name:'invalid.jpg',mimeType:'image/jpeg',buffer:Buffer.from('invalid')});
  await page.click('#convert');await page.locator('#status.error').waitFor();assert.match(await page.locator('#queue').textContent(),/올바른 JPG/);
  console.log('PASS: browser SVG→PDF, PDF→SVG ZIP, invalid pages, unsafe SVG; no page errors under extension CSP.');
  for(const [lang,title,button] of [['en','PDF tools','Convert to PDF'],['ja','PDF ツール','PDF に変換'],['zh-CN','PDF 工具','转换为 PDF'],['ko','PDF 기준','PDF로 변환']]){
    const previousDownload=await page.locator('#download').getAttribute('href');
    await page.selectOption('#language',lang);
    assert.equal(await page.locator('#download').getAttribute('href'),previousDownload);
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    assert.equal(await page.locator('#pdf-tab').textContent(),title);
    await page.click('#svg-mode');assert.match(await page.locator('#convert').textContent(),new RegExp(button));
    await page.setInputFiles('#file',{name:'변환 실패.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
    await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
    assert.equal(await page.locator('#queue li > span').textContent(),'변환 실패.svg');
    assert.equal(await page.locator('#download').getAttribute('download'),'변환 실패.pdf');
    if(lang==='en'){
      const untranslated=await page.evaluate(()=>{const clone=document.body.cloneNode(true);clone.querySelectorAll('#language,#ocr-language,#queue,#downloads,script').forEach(n=>n.remove());return clone.textContent.match(/[가-힣]+/g);});
      assert.equal(untranslated,null);
    }
    await page.screenshot({path:`test-results/language-${lang}.png`,fullPage:true});
    await page.setInputFiles('#file',{name:'broken.svg',mimeType:'image/svg+xml',buffer:Buffer.from('broken')});
    await page.click('#convert');await page.locator('#status.error').waitFor();
    const row=await page.locator('#queue small').textContent();
    assert.match(row,new RegExp({en:'Invalid SVG',ja:'無効なSVG',ko:'올바른 SVG', 'zh-CN':'无效的SVG'}[lang]));
  }
  await page.selectOption('#language','ja');await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'ja');
  console.log('PASS: all languages, filename isolation and persisted language.');
  assert.deepEqual(errors,[]);
}finally{await browser?.close();server.close();}

