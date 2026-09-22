import {messages} from './locales.js';
export const languages=['en','ko','ja','zh-CN'];
const escape=s=>s.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&');
const exact=new Map(),patterns=[];
export function registerTranslations(rows){
 for(const row of rows){
  if(row.length!==4||row.some(value=>typeof value!=='string'||!value.trim()))throw new Error('Incomplete translation');
  for(const value of row)exact.set(value,row);
  for(const column of [0,1,2,3]){
   const keys=[];let cursor=0,expression='';
   for(const match of row[column].matchAll(/\{(\d+)\}/g)){expression+=escape(row[column].slice(cursor,match.index))+'(.+?)';keys.push(Number(match[1]));cursor=match.index+match[0].length;}
   expression+=escape(row[column].slice(cursor));
   patterns.push({row,keys,literal:row[column].replace(/\{\d+\}/g,'').length,prefix:row[column].split(/\{\d+\}/)[0].length,regex:new RegExp('^'+expression+'$')});
  }
 }
 patterns.sort((a,b)=>b.prefix-a.prefix||b.literal-a.literal);
}
registerTranslations(messages);
export function translate(source,language='en',depth=0){
 source=source.replace(/\bWebP\b/g,'WEBP');
 const column=Math.max(0,languages.indexOf(language)),text=source.trim(),row=exact.get(text);
 if(row)return source.replace(text,()=>row[column]);
 if(depth>4||!text)return source;
 for(const pattern of patterns){
  if(!pattern.keys.length)continue;
  const match=text.match(pattern.regex);if(!match)continue;
  const values={};pattern.keys.forEach((key,index)=>values[key]=translate(match[index+1],language,depth+1));
  return source.replace(text,()=>pattern.row[column].replace(/\{(\d+)\}/g,(_,key)=>values[key]));
 }
 return source;
}
let language='en';try{const saved=globalThis.localStorage?.getItem('paper-switch-language');if(languages.includes(saved))language=saved;}catch{}
export function setLanguage(value){if(languages.includes(value))language=value;}
const dynamic=new Map();
export function setText(element,source){dynamic.set(element,String(source));element.textContent=translate(String(source),language);}
let initialized=false;
export function initLanguages(){
 if(initialized)return;
 const selector=document.getElementById('language');if(!selector)return;
 initialized=true;selector.value=language;
 const originalTitle=document.title,titleSuffix=' | Paper Switch';
 const texts=[],attributes=[],walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode;
  if(node.parentElement?.closest('script,style,title,#downloads,#queue,#language,[translate="no"]')||dynamic.has(node.parentElement))continue;
  texts.push({node,source:node.data});
 }
 for(const element of document.querySelectorAll('[aria-label],[placeholder],[alt],meta[name="twitter:title"],meta[name="twitter:description"],meta[name="description"],meta[property="og:title"],meta[property="og:description"]')){
  if(element.id==='language'||element.closest('[translate="no"]'))continue;
  for(const key of ['aria-label','placeholder','alt','content'])if(element.hasAttribute(key))attributes.push({element,key,source:element.getAttribute(key)});
 }
 function render(){
  document.documentElement.lang=language;
  document.title=originalTitle.endsWith(titleSuffix)?translate(originalTitle.slice(0,-titleSuffix.length),language)+titleSuffix:translate(originalTitle,language);
  for(const {node,source} of texts)if(node.isConnected)node.data=translate(source,language);
  for(const {element,key,source} of attributes)element.setAttribute(key,translate(source,language));
  for(const [element,source] of dynamic){if(!element.isConnected){dynamic.delete(element);continue;}element.textContent=translate(source,language);}
 }
 selector.addEventListener('change',()=>{language=selector.value;try{localStorage.setItem('paper-switch-language',language);}catch{}render();document.dispatchEvent(new CustomEvent('paper-language-change',{detail:{language}}));});
 render();
}
