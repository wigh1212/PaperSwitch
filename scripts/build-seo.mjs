import {serviceRows} from '../web/service-content.mjs';
import {factRows} from '../web/tool-facts.mjs';
import {landingRows} from '../web/landing-copy.mjs';
import {practicalRows} from '../web/practical-guides.mjs';
import {pdfCompressRows} from '../web/pdf-compress-copy.mjs';
import {htmlRows} from '../web/html-copy.mjs';
import {gifRows} from '../web/gif-copy.mjs';
import {uxRows,extraFaqs} from '../web/ux-copy.mjs';
import {growthRows} from '../web/growth-copy.mjs';
import {frameRows} from '../extension/qr-frame-copy.js';
import {compressorRows} from '../web/compressor-copy.mjs';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {dirname} from 'node:path';
import {parse,parseFragment,serialize} from 'parse5';
import {tools} from '../web/tools.mjs';
import {SITE_ORIGIN,locales,localizedPath,structuredData} from '../web/seo-config.mjs';
import {registerTranslations,translate} from '../extension/i18n.js';
import {rows} from '../web/copy.mjs';
import {seoRows,faqPairs,faqsFor} from '../web/seo-copy.mjs';
import {searchCopy,searchRows} from '../web/search-copy.mjs';
const searchTranslations=searchRows(tools);
registerTranslations(serviceRows);registerTranslations(factRows);registerTranslations(landingRows);registerTranslations(practicalRows);registerTranslations(pdfCompressRows);registerTranslations(htmlRows);registerTranslations(gifRows);registerTranslations(compressorRows);registerTranslations(frameRows);registerTranslations(growthRows);registerTranslations(uxRows);registerTranslations(rows);registerTranslations(seoRows);registerTranslations(searchTranslations);
await writeFile('dist/search-copy.js','export const searchRows='+JSON.stringify(searchTranslations)+';');
const routes=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy','/terms'];
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
function set(n,k,v){n.attrs??=[];const a=n.attrs.find(a=>a.name===k);if(a)a.value=v;else n.attrs.push({name:k,value:v});}
function walk(n,fn){fn(n);for(const child of n.childNodes||[])walk(child,fn);}
function find(n,fn){let result;walk(n,node=>{if(!result&&fn(node))result=node;});return result;}
function append(n,html){const fragment=parseFragment(html);for(const child of fragment.childNodes){child.parentNode=n;n.childNodes.push(child);}}
function text(n,value){n.childNodes=[{nodeName:'#text',value,parentNode:n}];}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function localizedFile(base,language){
 const path=localizedPath(base,language);
 return 'dist'+(path.endsWith('/')?path+'index.html':path+'.html');
}
await cp('web/seo-config.mjs','dist/seo-config.js');
await cp('web/seo-copy.mjs','dist/seo-copy.js');
for(const base of routes){
 const source=await readFile('dist'+(base==='/'?'/index.html':base+'.html'),'utf8');
 const tool=tools.find(t=>'/'+t.slug===base);
 for(const locale of locales){
  const language=locale.language,doc=parse(source,{scriptingEnabled:false});
  const html=find(doc,n=>n.tagName==='html'),head=find(doc,n=>n.tagName==='head'),body=find(doc,n=>n.tagName==='body');
  set(html,'lang',language);set(body,'data-route-language',language);set(body,'data-route-base',base);
  if(base==='/'){
   text(find(doc,n=>n.tagName==='title'),seoRows[0][0]+' | Paper Switch');
   for(const node of [find(doc,n=>attr(n,'name')==='description'),find(doc,n=>attr(n,'property')==='og:description')])set(node,'content',seoRows[1][0]);
   set(find(doc,n=>attr(n,'property')==='og:title'),'content',seoRows[0][0]);
  }
  if(tool){
   const copy=searchCopy(tool);
   text(find(doc,n=>n.tagName==='title'),copy.title[0]+' | Paper Switch');
   text(find(doc,n=>n.tagName==='h1'),copy.title[0].split(' – ')[0]);
   for(const node of [find(doc,n=>attr(n,'name')==='description'),find(doc,n=>attr(n,'property')==='og:description')])set(node,'content',copy.description[0]);
   set(find(doc,n=>attr(n,'property')==='og:title'),'content',copy.title[0]);
   text(find(doc,n=>(attr(n,'class')||'').split(' ').includes('intro')),copy.description[0]);
   const guide=find(doc,n=>(attr(n,'class')||'').split(' ').includes('guide'));
   if(guide){text(find(guide,n=>n.tagName==='h2'),copy.how[0]);if(copy.use[0]!==copy.description[0])append(guide,'<p>'+esc(copy.use[0])+'</p>');}
   const questions=[...extraFaqs(tool).map(([q,a])=>[uxRows[q][0],uxRows[a][0]]),...faqsFor(tool).map(i=>faqPairs[i])];
   if(guide&&questions.length)append(guide,'<section class="faq"><h2>Common questions</h2>'+questions.map(([q,a])=>'<h3>'+esc(q)+'</h3><p>'+esc(a)+'</p>').join('')+'</section>');
   if(tool.type==='convert'){
    const input=find(doc,n=>attr(n,'id')==='file');set(input,'accept',tool.input==='jpg'?'.jpg,.jpeg':tool.input==='tiff'?'.tif,.tiff':'.'+tool.input);
    text(find(doc,n=>attr(n,'id')==='convert'),tool.slug==='merge-pdf'?'Merge PDFs ↗':tool.output.toUpperCase()+'로 변환 ↗');
    text(find(doc,n=>attr(n,'id')==='accept-hint'),tool.input.toUpperCase()+' · 최대 20개 · 파일당 50 MB · 합계 100 MB');
   }
  }
  function localize(node,skip=false){
   const blocked=skip||attr(node,'translate')==='no'||['script','style','select'].includes(node.tagName)&&attr(node,'id')==='language'||['script','style'].includes(node.tagName);
   if(node.nodeName==='#text'&&!blocked){
    if(node.parentNode?.tagName==='title'){
     const suffix=' | Paper Switch';node.value=node.value.endsWith(suffix)?translate(node.value.slice(0,-suffix.length),language)+suffix:translate(node.value,language);
    }else node.value=translate(node.value,language);
   }
   for(const a of node.attrs||[]){
    if(!blocked&&['placeholder','aria-label','alt','title'].includes(a.name))a.value=translate(a.value,language);
    if(node.tagName==='meta'&&a.name==='content'&&(['description'].includes(attr(node,'name'))||['og:title','og:description'].includes(attr(node,'property'))))a.value=translate(a.value,language);
   }
   if(node.tagName==='a'){
    const href=attr(node,'href');
    if(href&&routes.includes(href)){set(node,'data-page-path',href);set(node,'href',localizedPath(href,language));}
   }
   if(node.tagName==='option'&&node.parentNode?.tagName==='select'&&attr(node.parentNode,'id')==='language'){
    node.attrs=node.attrs.filter(a=>a.name!=='selected');if(attr(node,'value')===language)set(node,'selected','');
   }
   for(const child of node.childNodes||[])localize(child,blocked);
  }
  localize(doc);
  append(head,'<meta name="twitter:card" content="summary"><meta name="twitter:title" content="'+esc(attr(find(doc,n=>attr(n,'property')==='og:title'),'content'))+'"><meta name="twitter:description" content="'+esc(attr(find(doc,n=>attr(n,'name')==='description'),'content'))+'">');
  const current=SITE_ORIGIN+localizedPath(base,language);
  append(head,'<link rel="canonical" href="'+current+'"><meta property="og:url" content="'+current+'">'+locales.map(l=>'<link rel="alternate" hreflang="'+l.language+'" href="'+SITE_ORIGIN+localizedPath(base,l.language)+'">').join('')+'<link rel="alternate" hreflang="x-default" href="'+SITE_ORIGIN+base+'">');
  const heading=find(doc,n=>n.tagName==='h1'),headingText=heading?.childNodes.filter(n=>n.nodeName==='#text').map(n=>n.value).join('')||'Paper Switch';
  append(head,'<script id="seo-structured" type="application/ld+json">'+JSON.stringify(structuredData(base,headingText,language)).replace(/</g,'\\u003c')+'</script>');
  const footer=find(doc,n=>n.tagName==='footer');
  append(footer,'<nav class="language-links" aria-label="'+esc(translate('Choose a language',language))+'">'+locales.map(l=>'<a href="'+localizedPath(base,l.language)+'" data-locale="'+l.language+'" lang="'+l.language+'" hreflang="'+l.language+'" translate="no">'+l.name+'</a>').join('')+'</nav>');
  const file=localizedFile(base,language);await mkdir(dirname(file),{recursive:true});await writeFile(file,serialize(doc));
 }
}
const {buildSitemaps}=await import('./sitemaps.mjs');
const count=await buildSitemaps(routes);
console.log('SEO: '+count+' validated pages; aggregate sitemap and four language sitemaps.');
