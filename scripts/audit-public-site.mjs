import {parse} from 'parse5';
import {mkdir,writeFile} from 'node:fs/promises';
import {SITE_ORIGIN} from '../web/seo-config.mjs';
const report={checkedAt:new Date().toISOString(),origin:SITE_ORIGIN,resources:[],pages:[],errors:[]};
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
async function get(url){const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});return {status:r.status,headers:Object.fromEntries(r.headers),body:await r.text()};}
let urls=[];
for(const path of ['/ads.txt','/robots.txt','/sitemap.xml','/sitemap-index.xml']){
 try{const r=await get(SITE_ORIGIN+path);report.resources.push({path,...r});if(path==='/sitemap.xml')urls=[...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);}
 catch(e){report.errors.push({path,error:e.message});}
}
let cursor=0;
await Promise.all(Array.from({length:6},async()=>{
 while(cursor<urls.length){const url=urls[cursor++];try{
  const r=await get(url),all=[];function walk(n){all.push(n);for(const c of n.childNodes||[])walk(c);}walk(parse(r.body));
  const find=f=>all.find(f);
  const entry={url,status:r.status,language:attr(find(n=>n.tagName==='html')||{},'lang'),canonical:attr(find(n=>attr(n,'rel')==='canonical')||{},'href'),headerRobots:r.headers['x-robots-tag']||null,metaRobots:all.filter(n=>n.tagName==='meta'&&['robots','googlebot'].includes(attr(n,'name'))).map(n=>attr(n,'content')),adScripts:all.filter(n=>n.tagName==='script'&&/googlesyndication|doubleclick/.test(attr(n,'src')||'')).map(n=>attr(n,'src')),adSlots:all.filter(n=>attr(n,'data-ad-slot')).map(n=>attr(n,'data-ad-slot')),description:attr(find(n=>attr(n,'name')==='description')||{},'content'),h1Count:all.filter(n=>n.tagName==='h1').length,schemaTypes:[]};
  for(const n of all.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json')){try{entry.schemaTypes.push(JSON.parse((n.childNodes||[]).map(n=>n.value||'').join(''))['@type']);}catch{report.errors.push({url,error:'Invalid structured data'});}}
  if(entry.status!==200||entry.canonical!==url||/noindex|none/i.test([entry.headerRobots,...entry.metaRobots].join(' '))||!entry.description||entry.h1Count!==1)report.errors.push({url,error:'HTTP, canonical, robots or content check failed'});
  report.pages.push(entry);
 }catch(e){report.errors.push({url,error:e.message});}}
}));
for(const path of ['/missing-audit-page','/assets/index.html']){try{const r=await get(SITE_ORIGIN+path);report.resources.push({path,status:r.status,headerRobots:r.headers['x-robots-tag'],hasAdvertising:/adsbygoogle\.js/.test(r.body)});}catch(e){report.errors.push({path,error:e.message});}}
await mkdir('test-results',{recursive:true});await writeFile('test-results/public-site-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:report.pages.length,errors:report.errors,advertisingPages:report.pages.filter(p=>p.adScripts.length).length,manualAdSlots:report.pages.filter(p=>p.adSlots.length).length,resources:report.resources.map(({body,headers,...r})=>({...r,content:body?.slice(0,350)}))},null,2));
