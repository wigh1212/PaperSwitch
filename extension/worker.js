import mupdf from './vendor/mupdf/mupdf.js';
import {encodeTIFF} from './tiff.js';
import { parsePages, baseName, renderPage, MAX_BYTES } from './core.js';
let ocrReply;
self.onmessage = async ({data}) => {
  if(data.type==='ocr-result'){ocrReply?.(data);return;}
  let doc;
  try {
    if (data.bytes.byteLength > MAX_BYTES) throw new Error('50 MB 이하 파일을 선택해 주세요.');
    doc = mupdf.Document.openDocument(data.bytes, data.input==='tiff'?'image/tiff':'application/pdf');
    if (doc.needsPassword()) throw new Error('암호로 보호된 PDF입니다. 암호를 해제한 사본을 선택해 주세요.');
    const pages = parsePages(data.input==='tiff'?'':data.pages, doc.countPages());
    if(data.input==='tiff'&&data.format==='pdf') {
      const buffer=new mupdf.Buffer();let writer;
      try {
        writer=new mupdf.DocumentWriter(buffer,'pdf','');
        for(const index of pages){const page=doc.loadPage(index);let device;try{device=writer.beginPage(page.getBounds());page.run(device,mupdf.Matrix.identity);device.close();writer.endPage();if(buffer.asUint8Array().length>150*1048576)throw new Error('TIFF 결과가 너무 큽니다. 페이지를 나누어 주세요.');}finally{device?.destroy();page.destroy();}self.postMessage({type:'progress',current:index+1,total:pages.length});}
        writer.close();const bytes=new Uint8Array(buffer.asUint8Array());
        self.postMessage({type:'done',entries:{[`${baseName(data.name)}.pdf`]:bytes}},[bytes.buffer]);return;
      }finally{writer?.destroy();buffer.destroy();}
    }
    const format = ['webp','jpg','png','txt','tiff'].includes(data.format) ? data.format : 'svg';
    const entries = Object.create(null);
    const texts=[];
    let total = 0;
    for (let i=0; i<pages.length; i++) {
      const page = doc.loadPage(pages[i]);
      try {
        if(format==='txt') {
          const text=page.toStructuredText();let extracted;try{extracted=text.asText();}finally{text.destroy();}
          if(!extracted.trim() || data.ocr==='always') {
            const image=await renderImage(page,3,'png');
            const reply=await new Promise(resolve=>{ocrReply=resolve;self.postMessage({type:'ocr',image,page:pages[i]+1},[image.buffer]);});
            ocrReply=null;if(reply.error)throw new Error(reply.error);extracted=reply.text;
          }
          texts.push(extracted);
          self.postMessage({type:'progress',current:i+1,total:pages.length});
          continue;
        }
        const bytes = format !== 'svg' ? await renderImage(page, data.scale, format) : renderPage(mupdf, page, format);
        total += bytes.byteLength;
        if (total > 150 * 1024 * 1024) throw new Error('결과가 너무 큽니다. 페이지를 나누어 변환해 주세요.');
        const suffix = `-page-${pages[i]+1}`;
        entries[`${baseName(data.name)}${suffix}.${format}`] = bytes;
      } finally { page.destroy(); }
      self.postMessage({type:'progress', current:i+1, total:pages.length});
    }
    if(format==='txt') {
      if(!texts.some(text=>text.trim()))throw new Error('OCR로도 글자를 찾지 못했습니다. 글자가 선명한 문서인지 확인해 주세요.');
      entries[`${baseName(data.name)}.txt`]=new TextEncoder().encode(texts.join('\n\f\n'));
    }
    self.postMessage({type:'done', entries}, Object.values(entries).map(bytes=>bytes.buffer));
  } catch (error) { self.postMessage({type:'error', message:error.message || '파일을 읽을 수 없습니다.'}); }
  finally { doc?.destroy(); }
};
self.postMessage({type:'ready'});
async function renderImage(page, value, format) {
  const scale=[1,2,3].includes(Number(value)) ? Number(value) : 2;
  const bounds=page.getBounds();
  const width=Math.ceil((bounds[2]-bounds[0])*scale),height=Math.ceil((bounds[3]-bounds[1])*scale);
  if(width>16000 || height>16000 || width*height>24000000)throw new Error('이미지가 너무 큽니다. 이미지 해상도를 낮춰 주세요.');
  const pix=page.toPixmap([scale,0,0,scale,0,0],mupdf.ColorSpace.DeviceRGB,false,true);
  try {
    if(format==='tiff')return encodeTIFF(pix.getPixels(),pix.getWidth(),pix.getHeight());
    const rgb=pix.getPixels(),rgba=new Uint8ClampedArray(pix.getWidth()*pix.getHeight()*4);
    for(let p=0;p<rgba.length/4;p++){rgba[p*4]=rgb[p*3];rgba[p*4+1]=rgb[p*3+1];rgba[p*4+2]=rgb[p*3+2];rgba[p*4+3]=255;}
    const canvas=new OffscreenCanvas(pix.getWidth(),pix.getHeight());
    canvas.getContext('2d').putImageData(new ImageData(rgba,pix.getWidth(),pix.getHeight()),0,0);
    const mime={jpg:'image/jpeg',png:'image/png',webp:'image/webp'}[format];
    const blob=await canvas.convertToBlob({type:mime,quality:.92});
    if(blob.type!==mime)throw new Error('이 브라우저는 이미지 저장을 지원하지 않습니다.');
    return new Uint8Array(await blob.arrayBuffer());
  } finally {pix.destroy();}
}

