import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
export async function exportHTML(source,{size,orientation,margin}){
 const pdf=new jsPDF({unit:'mm',format:size==='Letter'?'letter':'a4',orientation:orientation==='landscape'?'landscape':'portrait'});
 const gap=['0','10','15'].includes(String(margin))?Number(margin):15;
 const width=pdf.internal.pageSize.getWidth()-2*gap,height=pdf.internal.pageSize.getHeight()-2*gap;
 const pixels=Math.round(width*96/25.4),frame=document.createElement('iframe');frame.setAttribute('sandbox','allow-same-origin');frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;left:-20000px;top:0;border:0;height:1px;width:'+pixels+'px;';
 let canvas;
 try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('load')),10000);frame.onload=()=>{clearTimeout(timer);resolve();};frame.onerror=()=>{clearTimeout(timer);reject(Error('load'));};frame.srcdoc=source;document.body.append(frame);});
 const doc=frame.contentDocument;const reset=doc.createElement('style');reset.textContent='html{overflow:visible!important}body{margin:0!important;padding:0!important;min-height:0!important}*{animation:none!important;transition:none!important}';doc.head.append(reset);
 await Promise.all([...doc.images].map(img=>img.decode().catch(()=>{})));await doc.fonts.ready;
 const w=Math.max(pixels,doc.documentElement.scrollWidth,doc.body.scrollWidth),h=Math.max(1,doc.documentElement.scrollHeight,doc.body.scrollHeight);
 if(w>8000||h>16000||w*h*4>24000000)throw Error('limit');
 canvas=await html2canvas(doc.documentElement,{backgroundColor:'#ffffff',scale:2,width:w,height:h,windowWidth:pixels,windowHeight:h,scrollX:0,scrollY:0,logging:false,useCORS:false,allowTaint:false,imageTimeout:5000});
 const pageHeight=Math.max(1,Math.floor(canvas.width*height/width));
 for(let y=0,index=0;y<canvas.height;y+=pageHeight,index++){
 if(index)pdf.addPage();const slice=document.createElement('canvas');slice.width=canvas.width;slice.height=Math.min(pageHeight,canvas.height-y);slice.getContext('2d').drawImage(canvas,0,y,canvas.width,slice.height,0,0,slice.width,slice.height);pdf.addImage(slice,'PNG',gap,gap,width,slice.height*width/slice.width,undefined,'FAST');slice.width=0;slice.height=0;
 }
 return pdf.output('blob');
 }finally{frame.remove();if(canvas){canvas.width=0;canvas.height=0;}}
}
