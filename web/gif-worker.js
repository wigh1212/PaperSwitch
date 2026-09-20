import {GIFEncoder,quantize,applyPalette} from 'gifenc';
self.onmessage=async({data:{files,size,delay,repeat}})=>{
 try{const gif=GIFEncoder();let width,height;
 for(let i=0;i<files.length;i++){
 const image=await createImageBitmap(files[i]);
 try{if(image.width*image.height>24000000)throw Error('size');
 if(!i){const scale=Math.min(1,size/Math.max(image.width,image.height));width=Math.max(1,Math.round(image.width*scale));height=Math.max(1,Math.round(image.height*scale));}
 const canvas=new OffscreenCanvas(width,height),ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);const scale=Math.min(width/image.width,height/image.height),w=image.width*scale,h=image.height*scale;ctx.drawImage(image,(width-w)/2,(height-h)/2,w,h);
 const rgba=ctx.getImageData(0,0,width,height).data,palette=quantize(rgba,256);gif.writeFrame(applyPalette(rgba,palette),width,height,{palette,delay,repeat:repeat?0:-1});self.postMessage({progress:i+1,total:files.length});
 }finally{image.close();}}
 gif.finish();const bytes=gif.bytes();self.postMessage({bytes,width,height},[bytes.buffer]);
 }catch{self.postMessage({error:true});}
};