import {messages} from './locales.js';
export const languages=['en','ko','ja','zh-CN'];
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=messages.flatMap(row=>[0,1].map(column=>{
  const keys=[];let cursor=0,expression='';
  for(const match of row[column].matchAll(/\{(\d+)\}/g)){expression+=escape(row[column].slice(cursor,match.index))+'(.+?)';keys.push(Number(match[1]));cursor=match.index+match[0].length;}
  expression+=escape(row[column].slice(cursor));
  return {row,keys,prefix:row[column].split(/\{\d+\}/)[0].length,regex:new RegExp('^'+expression+'$')};
})).sort((a,b)=>b.prefix-a.prefix);
const exact=new Map();for(const row of messages){exact.set(row[0],row);exact.set(row[1],row);}
export function translate(source,language='en',depth=0){
  const column=Math.max(0,languages.indexOf(language));
  const text=source.trim();const row=exact.get(text);
  if(row)return source.replace(text,row[column]);
  if(depth>4||!text)return source;
  for(const pattern of patterns){
    if(!pattern.keys.length)continue;
    const match=text.match(pattern.regex);if(!match)continue;
    const values={};pattern.keys.forEach((key,index)=>values[key]=translate(match[index+1],language,depth+1));
    return source.replace(text,pattern.row[column].replace(/\{(\d+)\}/g,(_,key)=>values[key]));
  }
  return source;
}
let language='en';try{const saved=globalThis.localStorage?.getItem('paper-switch-language');if(languages.includes(saved))language=saved;}catch{}
const dynamic=new Map();
// Only explicitly registered UI strings are translated. File names, source SVGs,
// temporary engine DOM and output files never pass through the locale layer.
export function setText(element,source){
  dynamic.set(element,String(source));element.textContent=translate(String(source),language);
}
export function initLanguages(){
  const selector=document.getElementById('language');selector.value=language;
  const texts=[],attributes=[];
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.parentElement?.closest('script,style,#downloads,#queue,#language')||dynamic.has(node.parentElement))continue;
    texts.push({node,source:node.data});
  }
  for(const element of document.querySelectorAll('[aria-label],[placeholder]')){
    if(element.id==='language')continue;
    for(const key of ['aria-label','placeholder'])if(element.hasAttribute(key))attributes.push({element,key,source:element.getAttribute(key)});
  }
  function render(){
    document.documentElement.lang=language;
    for(const {node,source} of texts)if(node.isConnected)node.data=translate(source,language);
    for(const {element,key,source} of attributes)element.setAttribute(key,translate(source,language));
    for(const [element,source] of dynamic){if(!element.isConnected){dynamic.delete(element);continue;}element.textContent=translate(source,language);}
  }
  selector.addEventListener('change',()=>{language=selector.value;try{localStorage.setItem('paper-switch-language',language);}catch{}render();});
  render();
}
