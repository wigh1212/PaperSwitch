import {jsPDF} from 'jspdf';
export async function webpToPDF(bytes, format='webp') {
  const head=new TextDecoder().decode(bytes.slice(0,12));
  const signature=new Uint8Array(bytes);
  if(format==='jpg') {
    if(signature[0]!==255 || signature[1]!==216 || signature[2]!==255)throw new Error('올바른 JPG 파일이 아닙니다.');
  } else if(format==='png') {
    if(![137,80,78,71,13,10,26,10].every((v,i)=>signature[i]===v))throw new Error('올바른 PNG 파일이 아닙니다.');
  } else if(!head.startsWith('RIFF') || head.slice(8,12)!=='WEBP')throw new Error('올바른 WebP 파일이 아닙니다.');
  const image=await createImageBitmap(new Blob([bytes],{type:{jpg:'image/jpeg',png:'image/png',webp:'image/webp'}[format]}));
  try {
    const {width,height}=image;
    if(width*height>24000000 || width>16000 || height>16000)throw new Error('이미지가 너무 큽니다. 2,400만 픽셀 이하로 줄여 주세요.');
    const canvas=new OffscreenCanvas(width,height);
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0);
    const png=new Uint8Array(await (await canvas.convertToBlob({type:'image/png'})).arrayBuffer());
    const pdf=new jsPDF({orientation:width>height?'landscape':'portrait',unit:'pt',format:[width*.75,height*.75],compress:true});
    pdf.addImage(png,'PNG',0,0,width*.75,height*.75);
    return new Uint8Array(pdf.output('arraybuffer'));
  } finally {image.close();}
}
