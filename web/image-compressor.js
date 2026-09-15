import {initLanguages,setText} from './i18n.js';
import {loadEditableImage} from './services/image-edit-service.js';
const $=id=>document.getElementById('compress-'+id);
let original,file,revision=0,url;
function clear(){revision++;if(url)URL.revokeObjectURL(url);url=null;$('download').hidden=true;$('result').replaceChildren();setText($('stats'),'');setText($('status'),'');}
$('file').onchange=async()=>{clear();const job=revision;original=null;$('controls').disabled=true;$('original').replaceChildren();file=$('file').files[0];if(!file)return;try{const canvas=await loadEditableImage(file);if(job!==revision)return;original=canvas;$('original').append(canvas);$('controls').disabled=false;}catch(e){if(job===revision)setText($('status'),e.message);}};
for(const id of ['target','format','resize'])$(id).oninput=clear;
const encode=(canvas,type,quality)=>new Promise((resolve,reject)=>canvas.toBlob(b=>b&&b.type===type?resolve(b):reject(new Error('Could not read this image.')),type,quality));
$('run').onclick=async()=>{
 if(!original)return;clear();const job=revision,source=original,inputFile=file,target=Number($('target').value)*1000,type=$('format').value,resize=$('resize').checked;
 if(!Number.isFinite(target)||target<1000||target>10000000){setText($('status'),'Use a target from 1 to 10,000 KB.');return;}
 $('controls').disabled=true;setText($('status'),'Compressing…');
 try{
 let width=source.width,height=source.height,best;
 for(let round=0;round<18;round++){
  if(job!==revision)return;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');
  if(type==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);}ctx.imageSmoothingQuality='high';ctx.drawImage(source,0,0,width,height);
  let blob=await encode(canvas,type,0.92);
  if(type!=='image/png'&&blob.size>target){let lo=0.08,hi=0.92;const low=await encode(canvas,type,lo);blob=low;
   if(low.size<=target)for(let i=0;i<7;i++){const q=(lo+hi)/2,candidate=await encode(canvas,type,q);if(candidate.size<=target){lo=q;blob=candidate;}else hi=q;}
  }
  if(!best||blob.size<best.blob.size)best={blob,width,height};
  if(blob.size<=target){best={blob,width,height};break;}
  if(!resize||(width===1&&height===1))break;
  const scale=Math.min(0.85,Math.sqrt(target/blob.size)*0.92);width=Math.max(1,Math.floor(width*scale));height=Math.max(1,Math.round(width*source.height/source.width));
 }
 if(job!==revision)return;
 url=URL.createObjectURL(best.blob);const image=new Image();image.src=url;image.alt='';$('result').append(image);$('download').href=url;
 $('download').download=inputFile.name.replace(/\.[^.]+$/,'')+'-compressed.'+({'image/jpeg':'jpg','image/webp':'webp','image/png':'png'}[type]);$('download').hidden=false;
 setText($('stats'),'Original: '+(inputFile.size/1000).toFixed(1)+' KB → Result: '+(best.blob.size/1000).toFixed(1)+' KB · '+best.width+' × '+best.height+' px');
 setText($('status'),best.blob.size>target?'Target not reached. Allow smaller dimensions or increase the target.':best.blob.size>=inputFile.size?'No size saving. Try WEBP or allow smaller dimensions.':'Target reached. Review the image before downloading.');
 }catch(e){if(job===revision)setText($('status'),e.message);}finally{if(job===revision)$('controls').disabled=false;}
};
window.addEventListener('beforeunload',()=>{if(url)URL.revokeObjectURL(url);});initLanguages();
