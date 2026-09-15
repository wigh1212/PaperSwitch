import {frameRows} from './qr-frame-copy.js';
import {frameQR,frames} from './services/qr-frame-service.js';
registerTranslations(frameRows);
import {initLanguages,setText,registerTranslations} from './i18n.js';
import {generateQR,decodeQR} from './services/qr-service.js';
const $=id=>document.getElementById(id);
let url=null,revision=0,selectedFrame='none';
function clear(){revision++;if(url)URL.revokeObjectURL(url);url=null;$('qr-preview').replaceChildren();$('qr-empty').hidden=false;$('qr-download').hidden=true;$('qr-download').removeAttribute('href');setText($('qr-status'),'');}
for(const id of ['qr-text','qr-color','qr-logo'])$(id).addEventListener('input',clear);
$('qr-remove-logo').onclick=()=>{$('qr-logo').value='';clear();};
$('qr-generate').onclick=async()=>{
  clear();const job=revision;$('qr-generate').disabled=true;
  try{
    const raw=await generateQR($('qr-text').value,{color:$('qr-color').value,logo:$('qr-logo').files[0]});
    const canvas=frameQR(raw,{frame:selectedFrame,title:$('qr-frame-title').value,description:$('qr-frame-description').value});
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(job!==revision)return;
    if(!blob)throw new Error('Could not read this image.');
    $('qr-preview').append(canvas);$('qr-empty').hidden=true;url=URL.createObjectURL(blob);$('qr-download').href=url;$('qr-download').hidden=false;
    setText($('qr-status'),'QR verified. Test with your phone before printing.');
  }catch(error){if(job===revision)setText($('qr-status'),error.message);}
  finally{$('qr-generate').disabled=false;}
};
let frameTimer;
function refreshFrame(){clear();clearTimeout(frameTimer);const render=()=>{if(!$('qr-text').value.trim())return;if($('qr-generate').disabled){frameTimer=setTimeout(render,100);return;}$('qr-generate').click();};frameTimer=setTimeout(render,180);}
for(const button of document.querySelectorAll('[data-frame]'))button.onclick=()=>{selectedFrame=button.dataset.frame;document.querySelector('.qr-caption-fields').hidden=selectedFrame==='none';$('qr-caption-hint').hidden=selectedFrame!=='none';for(const b of document.querySelectorAll('[data-frame]'))b.setAttribute('aria-pressed',String(b===button));for(const id of ['qr-frame-title','qr-frame-description'])$(id).disabled=selectedFrame==='none';refreshFrame();};
let expanded=false;$('qr-more-frames').onclick=()=>{expanded=!expanded;$('qr-more-frames').setAttribute('aria-expanded',String(expanded));document.querySelectorAll('[data-frame]').forEach((b,i)=>{if(i>=5)b.hidden=!expanded;});setText($('qr-more-label'),expanded?'Fewer frames':'More frames');};
for(const id of ['qr-frame-title','qr-frame-description'])$(id).oninput=refreshFrame;
// Thumbnails use a sample QR; the final preview always uses the user's content.
generateQR('https://example.com').then(sample=>{for(const button of document.querySelectorAll('[data-frame]')){const preview=frameQR(sample,{frame:button.dataset.frame,title:'Aa',description:'—'}),canvas=button.querySelector('canvas'),ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,110,140);const scale=Math.min(106/preview.width,136/preview.height);ctx.drawImage(preview,(110-preview.width*scale)/2,2,preview.width*scale,preview.height*scale);}}).catch(()=>{});
let scanRevision=0;
$('qr-upload').onchange=async()=>{
  const job=++scanRevision;$('qr-value').value='';$('qr-copy').disabled=true;setText($('qr-read-status'),'');
  const file=$('qr-upload').files[0];if(!file)return;
  setText($('qr-read-status'),'Reading QR…');
  try{const text=await decodeQR(file);if(job!==scanRevision)return;$('qr-value').value=text;$('qr-copy').disabled=false;setText($('qr-read-status'),'QR content extracted.');}
  catch(error){if(job===scanRevision)setText($('qr-read-status'),error.message);}
};
$('qr-copy').onclick=async()=>{try{await navigator.clipboard.writeText($('qr-value').value);setText($('qr-read-status'),'Copied.');}catch{setText($('qr-read-status'),'Select the text and copy it manually.');}};
window.addEventListener('beforeunload',()=>{if(url)URL.revokeObjectURL(url);});
initLanguages();
