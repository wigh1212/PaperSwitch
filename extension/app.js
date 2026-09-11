import {initNavigation} from './navigation.js';
import {ocrLanguages} from './ocr-languages.js';
import {initLanguages,setText} from './i18n.js';
import {services} from './bootstrap.js';
import {runBatch,validateBatch} from './services/batch-service.js';
const $=id=>document.getElementById(id);
import {modes,sourceTabs} from './conversions.js';
for(const [value,label] of ocrLanguages){const option=document.createElement('option');option.value=value;option.textContent=label;$('ocr-language').append(option);}
let mode='pdf',files=[],busy=false,generation=0,controller=null;
const readable=n=>n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(1)} MB`;
function status(message='',error=false){setText($('status'),message);$('status').classList.toggle('error',error);}
function clearResult(){services.downloads.clear();$('result').hidden=true;$('downloads').replaceChildren();$('download').removeAttribute('href');}
function setBusy(value){busy=value;document.querySelectorAll('.mode,.source-tab,#drop,#remove,#pages,#file,#scale,#ocr-mode,#ocr-language,.queue-order,[name="pdf-output"]').forEach(el=>el.disabled=value);$('convert').disabled=value||!files.length;$('cancel').hidden=!value;$('progress').hidden=!value;}
function reset(){files=[];$('file').value='';$('selection').hidden=true;$('queue').replaceChildren();clearResult();status();setBusy(false);}
function switchMode(next){
  if(busy)return;mode=next;reset();const config=modes[mode];
  $('pdf-output-options').hidden=config.output!=='pdf'||config.operation==='merge';
  updatePDFOutput();
  $('ocr-options').hidden=next!=='pdf-txt';
  for(const key of Object.keys(modes)){$(`${key}-mode`).classList.toggle('selected',key===mode);$(`${key}-mode`).setAttribute('aria-pressed',String(key===mode));}
  $('file').accept=config.input==='jpg'?'.jpg,.jpeg':config.input==='tiff'?'.tif,.tiff':`.${config.input}`;setText($('accept-hint'),`${config.input.toUpperCase()} · 최대 20개 · 파일당 50 MB · 합계 100 MB`);
  $('pdf-options').hidden=config.input!=='pdf'||config.operation==='merge';$('webp-options').hidden=!(['pdf','tiff'].includes(config.input)&&['webp','jpg','png','tiff'].includes(config.output));
  if(config.input==='svg'&&config.output!=='pdf')$('webp-options').hidden=false;
  const svgImage=config.input==='svg'&&config.output!=='pdf';
  [...$('scale').options].forEach((option,i)=>setText(option,svgImage?`${i+1}× · Original pixel dimensions`:['Standard · 72 dpi','Sharp · 144 dpi','Extra sharp · 216 dpi'][i]));
  setText($('convert'),`${config.output.toUpperCase()}로 변환 ↗`);
  setText($('mode-note'),config.input==='pdf'?'페이지마다 파일을 만들어요. 여러 결과는 ZIP으로도 저장해요.':'파일마다 별도의 PDF를 만들어요. 여러 결과는 ZIP으로도 저장해요.');
  if(config.operation==='merge'){setText($('convert'),'Merge PDFs ↗');setText($('mode-note'),'Merge all pages in the order below. Use the arrows to change the file order.');}
  if(mode==='pdf-txt')setText($('mode-note'),'Extract text to one TXT per PDF. Pages without text use OCR in the selected language.');
  if(mode==='txt-pdf')setText($('mode-note'),'UTF-8 텍스트를 한글 폰트가 포함된 A4 문서로 만들어요.');
  if(config.input==='tiff'&&config.output==='pdf')setText($('mode-note'),'TIFF의 모든 페이지를 파일별 PDF 하나로 만들어요.');
  if(svgImage)setText($('mode-note'),`SVG마다 ${config.output.toUpperCase()} 이미지 하나를 만들어요. 흰 배경으로 저장합니다.`);
  if(['jpg','png','webp'].includes(config.input)&&['jpg','png','webp','tiff'].includes(config.output))setText($('mode-note'),'Keep original pixel dimensions. Transparent areas become white.');
  if(config.input==='tiff'&&['jpg','png','webp'].includes(config.output))setText($('mode-note'),`Create one ${config.output.toUpperCase()} per TIFF page.`);
  if(config.output==='pdf'&&config.operation!=='merge')setText($('mode-note'),'Choose separate files or one PDF above.');
  if(config.output==='svg'&&config.input!=='pdf')setText($('mode-note'),'이미지를 SVG 안에 포함합니다. 벡터 선으로 자동 추적하지 않습니다. TIFF는 페이지별로 저장합니다.');
}
function select(selected){
  if(busy||!selected.length)return;reset();
  try{validateBatch(selected);}catch(error){status(error.message,true);return;}
  files=selected;$('selection').hidden=false;setText($('filename'),`${files.length}개 파일 선택`);setText($('filesize'),readable(files.reduce((sum,f)=>sum+f.size,0)));
  for(const file of files){const row=document.createElement('li');const name=document.createElement('span');name.textContent=file.name;const state=document.createElement('small');setText(state,'Waiting');row.append(name,state);if(modes[mode].output==='pdf'){for(const [label,delta] of [['Move up',-1],['Move down',1]]){const button=document.createElement('button');button.type='button';button.className='text-button queue-order';setText(button,label);button.onclick=()=>{const index=files.indexOf(file),target=index+delta;if(busy||target<0||target>=files.length)return;const reordered=[...files];[reordered[index],reordered[target]]=[reordered[target],reordered[index]];select(reordered);};row.append(button);}}$('queue').append(row);}
  setBusy(false);
}
function rowStatus(index,message){setText($('queue').children[index].querySelector('small'),message);}
function results(entries,success,failed,config){
  const prepared=services.downloads.prepare(entries,config.output);if(!prepared)return;
  for(const file of prepared.files){const link=document.createElement('a');link.href=file.url;link.download=file.name;link.textContent=file.name+' ↓';$('downloads').append(link);}
  $('download').href=prepared.main.url;$('download').download=prepared.main.name;
  setText($('download'),prepared.files.length===1?'Download file ↓':'Download all as ZIP ↓');
  setText($('result-info'),'Succeeded: '+success+' · Failed: '+failed+' · Outputs: '+prepared.files.length+' · '+readable(prepared.main.size));$('result').hidden=false;
}
for(const key of Object.keys(modes))$(`${key}-mode`).onclick=()=>switchMode(key);
function updatePDFOutput(){
  const combined=document.querySelector('[name="pdf-output"]:checked').value==='combined';
  setText($('pdf-output-note'),combined?'Combine all pages in list order. Use Move up and Move down to reorder files.':'Create a separate PDF for each file.');
}
for(const option of document.querySelectorAll('[name="pdf-output"]'))option.onchange=()=>{if(busy)return;clearResult();status();updatePDFOutput();};
$('remove').onclick=reset;$('drop').onclick=()=>$('file').click();$('file').onchange=e=>select([...e.target.files]);
for(const type of ['dragover','drop'])document.addEventListener(type,e=>e.preventDefault());
$('drop').ondragover=()=>{if(!busy)$('drop').classList.add('drag');};$('drop').ondragleave=()=>$('drop').classList.remove('drag');
$('drop').ondrop=e=>{$('drop').classList.remove('drag');select([...e.dataTransfer.files]);};
$('cancel').onclick=()=>{generation++;controller?.abort();controller=null;setBusy(false);status('Conversion cancelled. You can try again.');for(let i=0;i<files.length;i++)rowStatus(i,'Cancelled');};
$('convert').onclick=async()=>{
  if(busy||!files.length)return;
  const job=++generation,config=modes[mode],batch=[...files];
  controller=new AbortController();const signal=controller.signal;
  const options={pdfOutput:document.querySelector('[name="pdf-output"]:checked').value,pages:$('pages').value,scale:Number($('scale').value),ocr:$('ocr-mode').value,ocrLanguage:$('ocr-language').value};
  clearResult();setBusy(true);$('progress').value=0;
  try{
    const result=await runBatch({files:batch,config,options,service:services.conversion,access:services.access,signal,
      onEvent:event=>{
        if(job!==generation)return;
        if(event.type==='merging'){status('Combining PDFs…');return;}
        const i=event.index;
        if(event.type==='start'){rowStatus(i,'Converting');status((i+1)+'/'+batch.length+' · '+event.name);}
        if(event.type==='progress'){
          if(event.kind==='ocr')rowStatus(i,'Page '+event.page+' · OCR '+Math.round(event.progress*100)+'%');
          else{rowStatus(i,event.current+'/'+event.total+' pages');$('progress').value=(i+event.current/event.total)/batch.length*100;}
        }
        if(event.type==='done')rowStatus(i,'Done · '+event.count+' outputs');
        if(event.type==='error')rowStatus(i,'Failed · '+event.message);
        if(['done','error'].includes(event.type))$('progress').value=(i+1)/batch.length*100;
      }
    });
    if(job!==generation)return;
    results(result.entries,result.success,result.failed,config);
    status(result.failed?'Could not convert '+result.failed+' files. Check the reasons in the list.':'',result.failed>0);
  }catch(error){if(job===generation&&!signal.aborted)status(error.message,true);}
  finally{if(job===generation){controller=null;setBusy(false);}}
};
window.addEventListener('beforeunload',()=>{controller?.abort();services.downloads.clear();});
switchMode('pdf');
function selectTab(tab){
  if(busy)return;
  for(const key of sourceTabs){$(`${key}-panel`).hidden=key!==tab;$(`${key}-tab`).setAttribute('aria-selected',String(key===tab));$(`${key}-tab`).tabIndex=key===tab?0:-1;}
  switchMode(tab==='pdf'?'pdf':tab==='svg'?'svg-pdf':`${tab}-tab-${tab}-pdf`);
}
for(const tab of sourceTabs){
  $(`${tab}-tab`).onclick=()=>selectTab(tab);
  $(`${tab}-tab`).onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=sourceTabs;const next=e.key==='Home'?'pdf':e.key==='End'?tabs.at(-1):tabs[(tabs.indexOf(tab)+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];selectTab(next);$(`${next}-tab`).focus();}};
}
initNavigation();
initLanguages();







// Dedicated web pages choose their conversion before interaction.
if(document.body.dataset.toolMode && modes[document.body.dataset.toolMode]) switchMode(document.body.dataset.toolMode);
