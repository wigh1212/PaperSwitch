import {initLanguages,setText} from './i18n.js';
import {loadEditableImage,editImage} from './services/image-edit-service.js';
const $=id=>document.getElementById(id);
let original=null,url=null,revision=0;
function invalidate(){revision++;if(url)URL.revokeObjectURL(url);url=null;$('image-download').hidden=true;$('image-result').replaceChildren();setText($('image-status'),'');}
function defaults(){if(!original)return;$('image-width').value=original.width;$('image-height').value=original.height;$('image-lock').checked=true;$('image-remove').checked=location.hash==='#background';$('image-color').value='#ffffff';$('image-tolerance').value=30;$('image-all').checked=false;invalidate();}
$('image-file').onchange=async()=>{
  invalidate();const job=revision;original=null;$('image-original').replaceChildren();$('image-controls').disabled=true;
  try{const canvas=await loadEditableImage($('image-file').files[0]);if(job!==revision)return;original=canvas;defaults();$('image-original').append(canvas);$('image-controls').disabled=false;
    canvas.onclick=event=>{const rect=canvas.getBoundingClientRect(),x=Math.min(canvas.width-1,Math.floor((event.clientX-rect.left)*canvas.width/rect.width)),y=Math.min(canvas.height-1,Math.floor((event.clientY-rect.top)*canvas.height/rect.height));const pixel=canvas.getContext('2d').getImageData(x,y,1,1).data;$('image-color').value='#'+[...pixel.slice(0,3)].map(v=>v.toString(16).padStart(2,'0')).join('');invalidate();};
  }catch(error){if(job===revision)setText($('image-status'),error.message);}
};
for(const dimension of ['width','height'])$('image-'+dimension).oninput=()=>{if(original&&$('image-lock').checked){const other=dimension==='width'?'height':'width';$('image-'+other).value=Math.max(1,Math.round(Number($('image-'+dimension).value)*original[other]/original[dimension]));}invalidate();};
for(const id of ['image-lock','image-remove','image-color','image-tolerance','image-all'])$(id).oninput=invalidate;
$('image-half').onclick=()=>{if(original){$('image-width').value=Math.max(1,Math.round(original.width/2));$('image-height').value=Math.max(1,Math.round(original.height/2));invalidate();}};
$('image-reset').onclick=defaults;
$('image-apply').onclick=async()=>{
  if(!original)return;invalidate();const job=revision;
  try{const color=$('image-color').value.match(/\w\w/g).map(v=>parseInt(v,16));const canvas=editImage(original,{width:Number($('image-width').value),height:Number($('image-height').value),remove:$('image-remove').checked,color,tolerance:Number($('image-tolerance').value),all:$('image-all').checked});const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(job!==revision)return;if(!blob)throw new Error('Could not read this image.');$('image-result').append(canvas);url=URL.createObjectURL(blob);$('image-download').href=url;$('image-download').download='edited-'+$('image-file').files[0].name.replace(/\.[^.]+$/,'')+'.png';$('image-download').hidden=false;setText($('image-status'),'Image ready. Transparent areas are shown as a checkerboard.');}
  catch(error){if(job===revision)setText($('image-status'),error.message);}
};
window.addEventListener('beforeunload',()=>{if(url)URL.revokeObjectURL(url);});
initLanguages();
