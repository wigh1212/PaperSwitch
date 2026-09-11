import {encodeTIFF} from './tiff.js';
export async function imageToSVG(bytes,format) {
  const signature=new Uint8Array(bytes);
  const valid=format==='png'?[137,80,78,71,13,10,26,10].every((v,i)=>signature[i]===v):format==='jpg'?signature[0]===255&&signature[1]===216&&signature[2]===255:new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
  if(!valid)throw new Error('선택한 형식의 이미지 파일이 아닙니다.');
  const image=await createImageBitmap(new Blob([bytes]));
  try {
    if(image.width*image.height>24000000)throw new Error('이미지가 너무 큽니다. 2,400만 픽셀 이하로 줄여 주세요.');
    const canvas=new OffscreenCanvas(image.width,image.height);canvas.getContext('2d').drawImage(image,0,0);
    const png=new Uint8Array(await(await canvas.convertToBlob({type:'image/png'})).arrayBuffer());
    let binary='';for(let i=0;i<png.length;i+=8192)binary+=String.fromCharCode(...png.subarray(i,i+8192));
    return new TextEncoder().encode(`<svg xmlns="http://www.w3.org/2000/svg" width="${image.width}" height="${image.height}" viewBox="0 0 ${image.width} ${image.height}"><image width="${image.width}" height="${image.height}" href="data:image/png;base64,${btoa(binary)}"/></svg>`);
  }finally{image.close();}
}
export async function svgToImage(svg,format,scale=2) {
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
  const img=new Image();
  try {
    img.src=url;await img.decode();
    const width=Math.ceil(img.naturalWidth*scale),height=Math.ceil(img.naturalHeight*scale);
    if(!width||!height||width>16000||height>16000||width*height>24000000)throw new Error('이미지가 너무 큽니다. 해상도를 낮추거나 SVG 크기를 확인해 주세요.');
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
    if(format==='tiff'){
      const rgba=ctx.getImageData(0,0,width,height).data,rgb=new Uint8Array(width*height*3);
      for(let p=0;p<width*height;p++)rgb.set(rgba.subarray(p*4,p*4+3),p*3);
      return encodeTIFF(rgb,width,height);
    }
    const mime={png:'image/png',jpg:'image/jpeg',webp:'image/webp'}[format];
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,mime,.92));
    if(!blob||blob.type!==mime)throw new Error('이미지 저장에 실패했습니다.');
    return new Uint8Array(await blob.arrayBuffer());
  } finally {URL.revokeObjectURL(url);}
}
