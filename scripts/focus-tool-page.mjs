import {parse,serialize} from 'parse5';
import {modes} from '../extension/conversions.js';

const attr=(node,name)=>node?.attrs?.find(a=>a.name===name)?.value;
const hasClass=(node,name)=>(attr(node,'class')||'').split(' ').includes(name);
function find(node,predicate){
 if(predicate(node))return node;
 for(const child of node.childNodes||[]){const found=find(child,predicate);if(found)return found;}
}
function remove(node){
 if(node?.parentNode)node.parentNode.childNodes=node.parentNode.childNodes.filter(child=>child!==node);
}
function prune(node,predicate){
 for(const child of [...node.childNodes||[]]){if(predicate(child))remove(child);else prune(child,predicate);}
}
function show(node){if(node)node.attrs=node.attrs.filter(a=>a.name!=='hidden');}
function text(node,value){if(node)node.childNodes=[{nodeName:'#text',value,parentNode:node}];}

// The extension keeps its full workspace. Public URLs contain only their task,
// including in the HTML returned before JavaScript runs.
export function focusToolPage(source,tool){
 const doc=parse(source),main=find(doc,n=>n.tagName==='main');
 const byId=id=>find(main,n=>attr(n,'id')===id);
 prune(main,n=>hasClass(n,'main-tabs')||hasClass(n,'back-link')||hasClass(n,'eyebrow'));
 if(tool.type==='convert'){
  const config=modes[tool.mode];
  const workspace=find(main,n=>hasClass(n,'workspace'));
  const controls=find(workspace,n=>hasClass(n,'body'));
  workspace.childNodes=[controls];controls.parentNode=workspace;
  for(const child of [...main.childNodes]){
   if(child===workspace||child.tagName==='h1'||hasClass(child,'intro')||hasClass(child,'breadcrumbs'))continue;
   remove(child);
  }
  if(!main.childNodes.includes(workspace)){workspace.parentNode=main;main.childNodes.push(workspace);}
  text(byId('mode-note'),tool.note);
  const rasterScale=['pdf','tiff'].includes(config.input)&&['webp','jpg','png','tiff'].includes(config.output);
  const svgScale=config.input==='svg'&&config.output!=='pdf';
  const options={
   'pdf-options':config.input==='pdf'&&config.operation!=='merge',
   'webp-options':rasterScale||svgScale,
   'ocr-options':config.input==='pdf'&&config.output==='txt',
   'pdf-output-options':config.output==='pdf'&&config.operation!=='merge'
  };
  for(const [id,needed] of Object.entries(options))needed?show(byId(id)):remove(byId(id));
  if(svgScale){
   const scale=byId('scale');
   for(const [i,option] of scale.childNodes.filter(n=>n.tagName==='option').entries())text(option,`${i+1}× · Original pixel dimensions`);
  }
 }else if(tool.type==='qr'){
  if(tool.slug==='qr-reader')remove(byId('create'));
  else{
   remove(byId('read'));
   remove(byId(tool.slug==='wifi-qr'?'qr-text-fields':'wifi-fields'));
  }
 }else if(tool.type==='image'){
  prune(main,n=>hasClass(n,'qr-settings')&&find(n,c=>attr(c,'id')==='image-remove'));
 }else if(tool.type==='heic')remove(byId('ft-pdf'));
 else if(tool.type==='pdfedit'){
  for(const [id,needed] of [['ft-group-label',tool.slug==='split-pdf'],['ft-angle-label',tool.slug==='rotate-pdf']])needed?show(byId(id)):remove(byId(id));
 }
 return serialize(doc);
}
