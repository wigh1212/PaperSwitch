import {readFile,writeFile,mkdir} from 'node:fs/promises';
import mupdf from 'mupdf';
import {compressPDF} from '../web/pdf-compress-core.mjs';
export async function buildPDFCompressionExample(){
 const out='web/examples',original=new Uint8Array(await readFile(out+'/unoptimized.pdf')),result=compressPDF(mupdf,original);
 await writeFile(out+'/optimized.pdf',result.bytes);await mkdir('test-results/pdf-sample',{recursive:true});
 const a=mupdf.Document.openDocument(original,'application/pdf'),b=mupdf.Document.openDocument(result.bytes,'application/pdf');
 if(a.countPages()!==3||b.countPages()!==3)throw Error('Expected three sample pages');
 for(let i=0;i<3;i++){
  const ap=a.loadPage(i),bp=b.loadPage(i),at=ap.toStructuredText(),bt=bp.toStructuredText();
  if(at.asText()!==bt.asText())throw Error('Text changed during compression');
  const x=ap.toPixmap(mupdf.Matrix.scale(2,2),mupdf.ColorSpace.DeviceRGB,false),y=bp.toPixmap(mupdf.Matrix.scale(2,2),mupdf.ColorSpace.DeviceRGB,false);
  if(!x.getPixels().every((v,j)=>v===y.getPixels()[j]))throw Error('Pixels changed during compression');
  await writeFile('test-results/pdf-sample/page-'+(i+1)+'.png',y.asPNG());
  if(i===0){
   await writeFile(out+'/pdf-preview.png',y.asPNG());
   // A labeled first-page excerpt keeps the schedule readable on the website.
   for(const [page,name] of [[ap,'pdf-before-detail.png'],[bp,'pdf-after-detail.png']]){
    const crop=new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB,[0,0,736,572],false);crop.clear(255);const device=new mupdf.DrawDevice(mupdf.Matrix.identity,crop);page.run(device,[2,0,0,2,-52,-108]);device.close();device.destroy();
    await writeFile(out+'/'+name,crop.asPNG());crop.destroy();
   }
  }
  x.destroy();y.destroy();at.destroy();bt.destroy();ap.destroy();bp.destroy();
 }
 a.destroy();b.destroy();
 return {input:original.length,output:result.bytes.length,pages:3,date:'2026-10-04',engine:'Paper Switch lossless compression',pixelsEqual:true,textEqual:true};
}
if(process.argv[1]?.endsWith('refresh-pdf-example.mjs')){
 const stats=JSON.parse(await readFile('web/examples/measurements.json','utf8'));stats.samples.pdfCompression=await buildPDFCompressionExample();await writeFile('web/examples/measurements.json',JSON.stringify(stats,null,2)+'\n');console.log(stats.samples.pdfCompression);
}
