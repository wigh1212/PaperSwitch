import {initLanguages,setText} from './i18n.js';
import {zipSync} from './vendor/fflate.js';
const $=id=>document.getElementById('ft-'+id),mode=document.body.dataset.tool,isHeic=mode.startsWith('heic-');
let worker,ready=false,pending=[],files=[],urls=[],thumbs=[],count=0,timeout;
const errorText='Could not process this file. Check the format and try another file.';
function clear(){for(const u of urls)URL.revokeObjectURL(u);urls=[];$('results').replaceChildren();}
function status(s){setText($('status'),s);}
function arm(){clearTimeout(timeout);timeout=setTimeout(()=>{worker?.terminate();$('controls').disabled=true;status(errorText);},120000);}
function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);urls.push(a.href);a.download=name;a.textContent=name;a.className='secondary';$('results').append(a);return a;}
function send(data,transfer=[]){if(ready)worker.postMessage(data,transfer);else pending.push([data,transfer]);}
function connect(){worker?.terminate();ready=false;pending=[];worker=new Worker(new URL(isHeic?'./heic-worker.js':'./pdf-edit-worker.js',import.meta.url),{type:'module'});worker.onerror=()=>{clearTimeout(timeout);$('controls').disabled=true;status(errorText);};worker.onmessage=({data})=>{
 if(data.type==='ready'){ready=true;for(const [data,transfer] of pending)worker.postMessage(data,transfer);pending=[];return;}
 if(data.type==='progress'){arm();return;}clearTimeout(timeout);
 if(data.type==='error'){status(['Select at least one page.','Keep at least one page.','Use a whole number from 1 to the page count.'].includes(data.message)?data.message:errorText);$('controls').disabled=count===0&&!isHeic;return;}
 if(data.type==='loaded'){count=data.thumbnails.length;$('group').max=count;for(const [i,bytes] of data.thumbnails.entries()){const label=document.createElement('label'),check=document.createElement('input'),img=new Image(),span=document.createElement('span');check.type='checkbox';check.value=i;check.checked=mode==='split-pdf'||mode==='rotate-pdf';check.onchange=()=>{clear();status('');};img.src=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));thumbs.push(img.src);img.alt='';setText(span,'Page '+(i+1));label.append(check,img,span);$('pages').append(label);}$('controls').disabled=false;status('');}
 if(data.type==='saved'){clear();for(const [name,bytes] of Object.entries(data.entries)){download(name,new Blob([bytes],{type:isHeic?(mode.endsWith('jpg')?'image/jpeg':'image/png'):'application/pdf'}));}if(Object.keys(data.entries).length>1){const a=download('results.zip',new Blob([zipSync(data.entries,{level:0})],{type:'application/zip'}));setText(a,'Download ZIP');}$('controls').disabled=false;status('Ready to download.');}
 };}
$('file').onchange=async()=>{clear();clearTimeout(timeout);worker?.terminate();count=0;for(const u of thumbs)URL.revokeObjectURL(u);thumbs=[];$('pages').replaceChildren();$('controls').disabled=true;files=[...$('file').files];status('');if(!files.length)return;
 const valid=isHeic?files.length<=10&&files.every(f=>f.size>0&&f.size<=10*1048576&&/\.hei[cf]$/i.test(f.name))&&files.reduce((s,f)=>s+f.size,0)<=50*1048576:files.length===1&&files[0].size>0&&files[0].size<=50*1048576&&/\.pdf$/i.test(files[0].name);
 if(!valid){status(errorText);return;}connect();if(isHeic){$('controls').disabled=false;return;}status('Processing…');const active=worker,bytes=await files[0].arrayBuffer();if(active!==worker)return;arm();send({type:'load',bytes},[bytes]);};
for(const [id,checked] of [['all',true],['none',false]])$(id).onclick=()=>{for(const c of $('pages').querySelectorAll('input'))c.checked=checked;clear();status('');};
for(const id of ['group','angle'])$(id).oninput=()=>{clear();status('');};
$('save').onclick=()=>{clear();$('controls').disabled=true;status('Processing…');arm();if(isHeic)send({files,output:mode.endsWith('jpg')?'jpg':'png'});else send({type:'save',mode,selected:[...$('pages').querySelectorAll('input:checked')].map(c=>Number(c.value)),group:Number($('group').value),angle:Number($('angle').value)});};
$('group-label').hidden=mode!=='split-pdf';$('angle-label').hidden=mode!=='rotate-pdf';
if(isHeic){$('pdf').hidden=true;$('file').accept='.heic,.heif';$('file').multiple=true;setText($('label'),'Choose HEIC photos');setText($('limit'),'HEIC/HEIF: up to 10 files, 10 MB each, 50 MB total. Only the main still image is converted; metadata and Live Photo video are not retained.');}
window.addEventListener('beforeunload',()=>{worker?.terminate();clearTimeout(timeout);for(const u of [...urls,...thumbs])URL.revokeObjectURL(u);});initLanguages();
