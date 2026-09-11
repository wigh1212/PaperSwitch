// Baseline little-endian TIFF: one RGB strip, no compression, 8 bits/channel.
export function encodeTIFF(rgb,width,height) {
  const count=10, bitsOffset=8+2+count*12+4, pixelOffset=bitsOffset+6;
  const result=new Uint8Array(pixelOffset+rgb.length),view=new DataView(result.buffer);
  result.set([73,73,42,0]);view.setUint32(4,8,true);view.setUint16(8,count,true);
  const tags=[[256,4,1,width],[257,4,1,height],[258,3,3,bitsOffset],[259,3,1,1],[262,3,1,2],[273,4,1,pixelOffset],[277,3,1,3],[278,4,1,height],[279,4,1,rgb.length],[284,3,1,1]];
  tags.forEach(([tag,type,n,value],i)=>{const p=10+i*12;view.setUint16(p,tag,true);view.setUint16(p+2,type,true);view.setUint32(p+4,n,true);if(type===3&&n===1)view.setUint16(p+8,value,true);else view.setUint32(p+8,value,true);});
  for(let i=0;i<3;i++)view.setUint16(bitsOffset+i*2,8,true);
  result.set(rgb,pixelOffset);return result;
}
