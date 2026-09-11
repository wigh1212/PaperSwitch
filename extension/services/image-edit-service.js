export function validateDimensions(width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>16000||height>16000||width*height>24000000)throw new Error('Use whole pixel sizes from 1 to 16,000, up to 24 million pixels.');
}
// Edge-connected removal protects similarly colored regions inside the subject.
export function removeBackground(data,width,height,color,tolerance,all=false){
  const pixels=new Uint8ClampedArray(data),count=width*height;
  const matches=i=>{const p=i*4;return pixels[p+3]===0||Math.max(Math.abs(pixels[p]-color[0]),Math.abs(pixels[p+1]-color[1]),Math.abs(pixels[p+2]-color[2]))<=tolerance;};
  if(all){for(let i=0;i<count;i++)if(matches(i))pixels[i*4+3]=0;return pixels;}
  const seen=new Uint8Array(count),queue=new Uint32Array(count);let head=0,tail=0;
  const add=i=>{if(!seen[i]){seen[i]=1;if(matches(i))queue[tail++]=i;}};
  for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}
  for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
  while(head<tail){const i=queue[head++],x=i%width;pixels[i*4+3]=0;if(x>0)add(i-1);if(x<width-1)add(i+1);if(i>=width)add(i-width);if(i<count-width)add(i+width);}
  return pixels;
}
export async function loadEditableImage(file){
  if(!file||!file.size||file.size>10*1048576||! /\.(png|jpe?g|webp)$/i.test(file.name))throw new Error('Use a PNG, JPG or WebP image up to 10 MB.');
  let image;try{image=await createImageBitmap(file);}catch{throw new Error('Could not read this image.');}
  try{validateDimensions(image.width,image.height);const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').drawImage(image,0,0);return canvas;}finally{image.close();}
}
export function editImage(original,{width,height,remove,color,tolerance,all}){
  validateDimensions(width,height);
  const source=document.createElement('canvas');source.width=original.width;source.height=original.height;
  const ctx=source.getContext('2d');ctx.drawImage(original,0,0);
  if(remove){const image=ctx.getImageData(0,0,source.width,source.height);image.data.set(removeBackground(image.data,source.width,source.height,color,tolerance,all));ctx.putImageData(image,0,0);}
  const result=document.createElement('canvas');result.width=width;result.height=height;
  const dest=result.getContext('2d');dest.imageSmoothingEnabled=true;dest.imageSmoothingQuality='high';dest.drawImage(source,0,0,width,height);return result;
}
