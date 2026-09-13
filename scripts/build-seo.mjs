import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {dirname} from 'node:path';
import {parse,parseFragment,serialize} from 'parse5';
import {tools} from '../web/tools.mjs';
import {SITE_ORIGIN,locales,localizedPath,structuredData} from '../web/seo-config.mjs';
import {registerTranslations,translate} from '../extension/i18n.js';
import {rows} from '../web/copy.mjs';
import {seoRows,faqPairs,faqsFor} from '../web/seo-copy.mjs';
registerTranslations(rows);registerTranslations(seoRows);
const routes=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy'];
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
   const guide=find(doc,n=>(attr(n,'class')||'').split(' ').includes('guide'));
   const faqs=faqsFor(tool);
   if(guide&&faqs.length)append(guide,'<section class="faq"><h2>Common questions</h2>'+faqs.map(i=>'<h3>'+esc(faqPairs[i][0])+'</h3><p>'+esc(faqPairs[i][1])+'</p>').join('')+'</section>');
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
    if(!blocked&&['placeholder','aria-label'].includes(a.name))a.value=translate(a.value,language);
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
  const current=SITE_ORIGIN+localizedPath(base,language);
  append(head,'<link rel="canonical" href="'+current+'"><meta property="og:url" content="'+current+'">'+locales.map(l=>'<link rel="alternate" hreflang="'+l.language+'" href="'+SITE_ORIGIN+localizedPath(base,l.language)+'">').join('')+'<link rel="alternate" hreflang="x-default" href="'+SITE_ORIGIN+base+'">');
  const heading=find(doc,n=>n.tagName==='h1'),headingText=heading?.childNodes.filter(n=>n.nodeName==='#text').map(n=>n.value).join('')||'Paper Switch';
  append(head,'<script id="seo-structured" type="application/ld+json">'+JSON.stringify(structuredData(base,headingText,language)).replace(/</g,'\\u003c')+'</script>');
  const footer=find(doc,n=>n.tagName==='footer');
  append(footer,'<nav class="language-links" aria-label="'+esc(translate('Choose a language',language))+'">'+locales.map(l=>'<a href="'+localizedPath(base,l.language)+'" data-locale="'+l.language+'" lang="'+l.language+'" hreflang="'+l.language+'" translate="no">'+l.name+'</a>').join('')+'</nav>');
  const file=localizedFile(base,language);await mkdir(dirname(file),{recursive:true});await writeFile(file,serialize(doc));
 }
}
const entries=routes.flatMap(base=>locales.map(l=>({base,language:l.language,path:localizedPath(base,l.language)})));
const sitemap='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+entries.map(e=>'<url><loc>'+SITE_ORIGIN+e.path+'</loc>'+locales.map(l=>'<xhtml:link rel="alternate" hreflang="'+l.language+'" href="'+SITE_ORIGIN+localizedPath(e.base,l.language)+'"/>').join('')+'<xhtml:link rel="alternate" hreflang="x-default" href="'+SITE_ORIGIN+e.base+'"/></url>').join('')+'</urlset>';
await writeFile('dist/sitemap.xml',sitemap);
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: '+SITE_ORIGIN+'/sitemap.xml\n');
console.log('SEO: '+entries.length+' static language pages, canonical URLs, hreflang, sitemap and crawlable resources.');
