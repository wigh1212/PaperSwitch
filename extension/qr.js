import {initLanguages,setText} from './i18n.js';
import {generateQR,decodeQR} from './services/qr-service.js';
const $=id=>document.getElementById(id);
let url=null,revision=0;
function clear(){revision++;if(url)URL.revokeObjectURL(url);url=null;$('qr-preview').replaceChildren();$('qr-download').hidden=true;$('qr-download').removeAttribute('href');setText($('qr-status'),'');}
for(const id of ['qr-text','qr-color','qr-logo'])$(id).addEventListener('input',clear);
$('qr-remove-logo').onclick=()=>{$('qr-logo').value='';clear();};
$('qr-generate').onclick=async()=>{
  clear();const job=revision;$('qr-generate').disabled=true;
  try{
    const canvas=await generateQR($('qr-text').value,{color:$('qr-color').value,logo:$('qr-logo').files[0]});
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(job!==revision)return;
    if(!blob)throw new Error('Could not read this image.');
    $('qr-preview').append(canvas);url=URL.createObjectURL(blob);$('qr-download').href=url;$('qr-download').hidden=false;
    setText($('qr-status'),'QR verified. Test with your phone before printing.');
  }catch(error){if(job===revision)setText($('qr-status'),error.message);}
  finally{$('qr-generate').disabled=false;}
};
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
