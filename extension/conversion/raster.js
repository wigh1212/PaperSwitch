import {encodeTIFF} from '../tiff.js';
export async function convertRaster(bytes,input,output){
  const s=new Uint8Array(bytes);
  const valid=input==='jpg'?s[0]===255&&s[1]===216&&s[2]===255:input==='png'?[137,80,78,71,13,10,26,10].every((v,i)=>s[i]===v):input==='webp'&&new TextDecoder().decode(s.slice(0,4))==='RIFF'&&new TextDecoder().decode(s.slice(8,12))==='WEBP';
  if(!valid)throw new Error('선택한 형식의 이미지 파일이 아닙니다.');
  const image=await createImageBitmap(new Blob([bytes]));
  try{
    const {width,height}=image;
    if(width>16000||height>16000||width*height>24000000)throw new Error('이미지가 너무 큽니다. 2,400만 픽셀 이하로 줄여 주세요.');
    const canvas=new OffscreenCanvas(width,height),ctx=canvas.getContext('2d');
    ctx.fillStyle='white';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0);
    if(output==='tiff'){
      const rgba=ctx.getImageData(0,0,width,height).data,rgb=new Uint8Array(width*height*3);
      for(let i=0;i<width*height;i++)rgb.set(rgba.subarray(i*4,i*4+3),i*3);
      return encodeTIFF(rgb,width,height);
    }
    const type={png:'image/png',webp:'image/webp',jpg:'image/jpeg'}[output];
    if(!type)throw new Error('이미지 저장에 실패했습니다.');
    const blob=await canvas.convertToBlob({type,quality:.92});
    if(blob.type!==type)throw new Error('이미지 저장에 실패했습니다.');
    return new Uint8Array(await blob.arrayBuffer());
  }finally{image.close();}
}
