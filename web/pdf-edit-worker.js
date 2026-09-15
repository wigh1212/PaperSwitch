import mupdf from './vendor/mupdf/mupdf.js';
let doc;
self.onmessage=({data})=>{try{
 if(data.type==='load'){doc?.destroy();doc=mupdf.Document.openDocument(data.bytes,'application/pdf');if(doc.needsPassword()||doc.countPages()<1||doc.countPages()>100)throw Error('limit');
 const thumbnails=[];for(let i=0;i<doc.countPages();i++){const page=doc.loadPage(i);try{const b=page.getBounds(),scale=Math.min(150/(b[2]-b[0]),180/(b[3]-b[1]));const pix=page.toPixmap(mupdf.Matrix.scale(scale,scale),mupdf.ColorSpace.DeviceRGB,false);try{thumbnails.push(new Uint8Array(pix.asPNG()));}finally{pix.destroy();}}finally{page.destroy();}}self.postMessage({type:'loaded',thumbnails});
 }else{
 const n=doc.countPages(),selected=data.selected.filter(i=>Number.isInteger(i)&&i>=0&&i<n);if(!selected.length)throw Error('Select at least one page.');
 let pages=data.mode==='delete-pdf-pages'?Array.from({length:n},(_,i)=>i).filter(i=>!selected.includes(i)):data.mode==='rotate-pdf'?Array.from({length:n},(_,i)=>i):selected;
 if(!pages.length)throw Error('Keep at least one page.');
 if(data.mode==='split-pdf'&&(!Number.isInteger(data.group)||data.group<1||data.group>n))throw Error('Use a whole number from 1 to the page count.');
 const groups=data.mode==='split-pdf'?Array.from({length:Math.ceil(pages.length/data.group)},(_,i)=>pages.slice(i*data.group,(i+1)*data.group)):[pages],entries={};let total=0;
 for(const [index,group] of groups.entries()){const out=new mupdf.PDFDocument();try{for(const i of group){out.graftPage(-1,doc,i);if(data.mode==='rotate-pdf'&&selected.includes(i)){const pg=out.loadPage(out.countPages()-1);try{const obj=pg.getObject();obj.put('Rotate',((obj.getInheritable('Rotate').asNumber()||0)+data.angle)%360);}finally{pg.destroy();}}}const buffer=out.saveToBuffer('compress');try{const bytes=new Uint8Array(buffer.asUint8Array());total+=bytes.length;if(total>150*1048576)throw Error('limit');entries['pages-'+(index+1)+'.pdf']=bytes;}finally{buffer.destroy();}}finally{out.destroy();}}
 self.postMessage({type:'saved',entries});
 }
 }catch(e){self.postMessage({type:'error',message:e.message});}};

self.postMessage({type:'ready'});
