import assert from 'node:assert/strict';
import {tools} from '../web/tools.mjs';
const origin=process.env.WEB_BASE_URL||'http://127.0.0.1:4174';
for(const path of ['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy']){
 const response=await fetch(origin+path);assert.equal(response.status,200,path);
 const html=await response.text();assert(html.includes('rel="canonical" href="'+origin+path+'"'),path);
 for(const [,href] of html.matchAll(/<link[^>]*href="([^"]+)"/g)){
  if(href===origin+path)continue;
  const asset=new URL(href,origin+(html.includes('<base href="/assets/">')?'/assets/':path));
  const loaded=await fetch(asset);assert.equal(loaded.status,200,asset.href);
 }
}
const sitemap=await (await fetch(origin+'/sitemap.xml')).text();assert.equal((sitemap.match(/<loc>/g)||[]).length,tools.length+4);
const robots=await (await fetch(origin+'/robots.txt')).text();assert(robots.includes('Sitemap: '+origin+'/sitemap.xml'));
for(const path of ['/pdf-to-jpg/','/pdf-to-jpg.html','/index.html']){
 const result=await fetch(origin+path,{redirect:'manual'});assert.equal(result.status,301);assert.equal(result.headers.get('location'),origin+(path==='/index.html'?'/':'/pdf-to-jpg'));
}
assert.equal((await fetch(origin+'/missing-tool')).status,404);
assert.equal((await fetch(origin+'/assets/index.html')).headers.get('x-robots-tag'),'noindex');
console.log('PASS all canonical pages, stylesheets, sitemap, robots, redirects, noindex and 404');

