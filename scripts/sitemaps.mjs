import {readFile,writeFile} from 'node:fs/promises';
import {parse} from 'parse5';
import {SITE_ORIGIN,locales,localizedPath} from '../web/seo-config.mjs';
const escape=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const attr=(n,key)=>n.attrs?.find(a=>a.name===key)?.value;
export async function buildSitemaps(routes){
 const entries=routes.flatMap(base=>locales.map(l=>({base,language:l.language,path:localizedPath(base,l.language)})));
 if(new Set(entries.map(e=>e.path)).size!==entries.length)throw Error('Duplicate sitemap URL');
 for(const entry of entries){
  const path=entry.path,html=await readFile('dist'+(path.endsWith('/')?path+'index.html':path+'.html'),'utf8'),nodes=[];
  function walk(n){nodes.push(n);for(const c of n.childNodes||[])walk(c);}walk(parse(html));
  const canonicals=nodes.filter(n=>n.tagName==='link'&&attr(n,'rel')==='canonical');
  if(canonicals.length!==1||attr(canonicals[0],'href')!==SITE_ORIGIN+path)throw Error('Sitemap canonical mismatch: '+path);
  if(nodes.some(n=>n.tagName==='meta'&&['robots','googlebot'].includes(attr(n,'name')?.toLowerCase())&&/noindex|none/i.test(attr(n,'content')||'')))throw Error('Noindex page in sitemap: '+path);
  for(const locale of locales){if(!nodes.some(n=>attr(n,'rel')==='alternate'&&attr(n,'hreflang')===locale.language&&attr(n,'href')===SITE_ORIGIN+localizedPath(entry.base,locale.language)))throw Error('Missing language alternate: '+path);}
 }
 const header='<?xml version="1.0" encoding="UTF-8"?>\n';
 const render=list=>header+'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+list.map(e=>'  <url>\n    <loc>'+escape(SITE_ORIGIN+e.path)+'</loc>\n'+[...locales.map(l=>({language:l.language,path:localizedPath(e.base,l.language)})),{language:'x-default',path:e.base}].map(l=>'    <xhtml:link rel="alternate" hreflang="'+l.language+'" href="'+escape(SITE_ORIGIN+l.path)+'"/>').join('\n')+'\n  </url>').join('\n')+'\n</urlset>\n';
 // Keep the previously submitted flat sitemap valid. Language partitions aid diagnosis.
 await writeFile('dist/sitemap.xml',render(entries));
 const children=[];for(const l of locales){const file='sitemap-'+l.language.toLowerCase()+'.xml';children.push(file);await writeFile('dist/'+file,render(entries.filter(e=>e.language===l.language)));}
 await writeFile('dist/sitemap-index.xml',header+'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+children.map(file=>'  <sitemap><loc>'+SITE_ORIGIN+'/'+file+'</loc></sitemap>').join('\n')+'\n</sitemapindex>\n');
 await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: '+SITE_ORIGIN+'/sitemap-index.xml\nSitemap: '+SITE_ORIGIN+'/sitemap.xml\n');
 return entries.length;
}
