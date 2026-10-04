import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><rect x="20" y="20" width="104" height="104" rx="12" fill="#285d48"/><circle cx="146" cy="72" r="42" fill="#efbc65"/><path d="M216 26v94m8-94v94m8-94v94m8-94v94m8-94v94m8-94v94m8-94v94" stroke="#285d48" stroke-width="1"/><text x="20" y="148" font-family="Arial, sans-serif" font-size="12" fill="#253830">Paper Switch / SVG sample</text></svg>';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();await page.route('https://pagead2.googlesyndication.com/**',r=>r.fulfill({body:''}));await page.goto('http://127.0.0.1:4173/svg-to-png');await page.waitForSelector('body[data-ready]');
 const result=await page.evaluate(async svg=>{const {localConversionService}=await import('/assets/services/conversion-service.js');const file=new File([svg],'vector-scale.svg',{type:'image/svg+xml'}),outputs=[];
 for(const scale of [1,3]){const bytes=(await localConversionService.convert(file,{input:'svg',output:'png'},{scale}))['vector-scale.png'];const bitmap=await createImageBitmap(new Blob([bytes]));const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);const corner=[...ctx.getImageData(0,0,1,1).data];if(bitmap.width!==320*scale||bitmap.height!==160*scale||corner.some(v=>v!==255))throw Error('Unexpected rendered SVG output');outputs.push({scale,width:bitmap.width,height:bitmap.height,bytes:[...bytes],corner});bitmap.close();}return {outputs,browser:navigator.userAgent};},svg);
 await writeFile('web/examples/vector-scale.svg',svg);
 const measurements={browser:result.browser,sourceBytes:Buffer.byteLength(svg),outputs:[]};
 for(const output of result.outputs){const file='vector-scale-'+output.scale+'x.png';await writeFile('web/examples/'+file,new Uint8Array(output.bytes));measurements.outputs.push({file,scale:output.scale,width:output.width,height:output.height,bytes:output.bytes.length,corner:output.corner});}
 await writeFile('web/examples/vector-measurements.json',JSON.stringify(measurements,null,2));console.log(measurements);
}finally{await browser.close();}
