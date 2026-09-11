import {QRCode,jsQR} from '../vendor/qr.js';

export function readCanvas(canvas){
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  return jsQR(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height,{inversionAttempts:'attemptBoth'})?.data;
}
async function loadImage(file){
  if(!file||!file.size||file.size>10*1048576)throw new Error('Use a PNG, JPG or WebP image up to 10 MB.');
  if(!/\.(png|jpe?g|webp)$/i.test(file.name))throw new Error('Use a PNG, JPG or WebP image up to 10 MB.');
  let image;
  try{image=await createImageBitmap(file);}catch{throw new Error('Could not read this image.');}
  if(image.width*image.height>24000000){image.close();throw new Error('Image exceeds 24 million pixels.');}
  return image;
}
export async function generateQR(text,{color='#182330',logo=null}={}){
  if(!text.trim()||new TextEncoder().encode(text).length>1000)throw new Error('Enter text or a URL, up to 1,000 UTF-8 bytes.');
  const canvas=document.createElement('canvas');
  await QRCode.toCanvas(canvas,[{data:new TextEncoder().encode(text),mode:'byte'}],{errorCorrectionLevel:'H',scale:8,margin:4,color:{dark:color,light:'#ffffff'}});
  if(logo){
    const image=await loadImage(logo);
    try{
      const ctx=canvas.getContext('2d'),size=Math.floor(canvas.width*.15),padding=8,ratio=Math.min((size-padding*2)/image.width,(size-padding*2)/image.height);
      ctx.fillStyle='white';ctx.fillRect((canvas.width-size)/2,(canvas.height-size)/2,size,size);
      ctx.drawImage(image,(canvas.width-image.width*ratio)/2,(canvas.height-image.height*ratio)/2,image.width*ratio,image.height*ratio);
    }finally{image.close();}
  }
  if(readCanvas(canvas)!==text)throw new Error('QR verification failed. Use a darker color, remove the logo or shorten the text.');
  return canvas;
}
export async function decodeQR(file){
  const image=await loadImage(file);
  try{
    for(const max of [1600,2600]){
      const scale=Math.min(1,max/Math.max(image.width,image.height)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
      const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      const text=readCanvas(canvas);if(text!==undefined)return text;
      if(scale===1)break;
    }
    throw new Error('No readable QR found. Upload a clear image with one QR code.');
  }finally{image.close();}
}
