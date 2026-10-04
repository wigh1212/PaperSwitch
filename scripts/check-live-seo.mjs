import assert from 'node:assert/strict';
import {parse} from 'parse5';
import {writeFile,mkdir} from 'node:fs/promises';
import {indexableRoutes} from '../web/routes.mjs';
import {SITE_ORIGIN,locales,localizedPath} from '../web/seo-config.mjs';
const attr=(n,k)=>n?.attrs?.find(a=>a.name===k)?.value;
const nodes=root=>{const all=[];function walk(n){all.push(n);for(const c of n.childNodes||[])walk(c);}walk(root);return all;};
const plain=n=>n?.nodeName==='#text'?n.value:(n?.childNodes||[]).map(plain).join('');
const entries=indexableRoutes.flatMap(base=>locales.map(l=>({base,language:l.language,path:localizedPath(base,l.language)})));
const results=[],failures=[];let cursor=0;
async function get(path){const r=await fetch(SITE_ORIGIN+path,{redirect:'manual',signal:AbortSignal.timeout(20000)});return {r,body:await r.text()};}
await Promise.all(Array.from({length:6},async()=>{while(cursor<entries.length){const e=entries[cursor++];try{const {r,body}=await get(e.path),all=nodes(parse(body)),find=f=>all.find(f);
 assert.equal(r.status,200);assert.doesNotMatch(r.headers.get('x-robots-tag')||'',/noindex|none/i);
 assert.equal(attr(find(n=>attr(n,'rel')==='canonical'),'href'),SITE_ORIGIN+e.path);
 assert.equal(attr(find(n=>n.tagName==='html'),'lang'),e.language);
 for(const n of all.filter(n=>['robots','googlebot'].includes(attr(n,'name'))))assert.doesNotMatch(attr(n,'content')||'',/noindex|nofollow|none/i);
 assert.equal(all.filter(n=>n.tagName==='h1').length,1);assert(plain(find(n=>n.tagName==='title')).trim());assert(attr(find(n=>attr(n,'name')==='description'),'content'));
 for(const l of locales)assert.equal(attr(find(n=>attr(n,'hreflang')===l.language&&n.tagName==='link'),'href'),SITE_ORIGIN+localizedPath(e.base,l.language));
 assert.equal(attr(find(n=>attr(n,'hreflang')==='x-default'),'href'),SITE_ORIGIN+e.base);
 results.push({path:e.path,status:r.status,canonical:SITE_ORIGIN+e.path});
 }catch(error){failures.push({path:e.path,error:error.message});}}}));
for(const path of ['/missing-seo-check-20261004','/ko/missing-seo-check-20261004'])try{const {r,body}=await get(path);assert.equal(r.status,404);assert.match(r.headers.get('x-robots-tag')||'',/noindex/);assert(!body.includes('adsbygoogle.js'));results.push({path,status:404});}catch(e){failures.push({path,error:e.message});}
for(const [path,target] of [['/ko','/ko/'],['/ko/index.html','/ko/'],['/ko/webp-to-jpg/','/ko/webp-to-jpg'],['/en/','/']])try{const {r}=await get(path);assert.equal(r.status,301);assert.equal(r.headers.get('location'),SITE_ORIGIN+target);results.push({path,status:301});}catch(e){failures.push({path,error:e.message});}
for(const path of ['/sitemap.xml','/sitemap-index.xml',...locales.map(l=>'/sitemap-'+l.language.toLowerCase()+'.xml'),'/robots.txt','/ads.txt'])try{const {r,body}=await get(path);assert.equal(r.status,200);assert.doesNotMatch(r.headers.get('x-robots-tag')||'',/noindex|none/i);if(path==='/sitemap.xml'){const urls=[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.deepEqual(urls.sort(),entries.map(e=>SITE_ORIGIN+e.path).sort());}if(path==='/robots.txt'){assert.match(body,/Allow: \/$/m);assert(!/^Disallow:\s*\S/m.test(body));}if(path==='/ads.txt')assert.equal(body.trim(),'google.com, pub-6110796878581495, DIRECT, f08c47fec0942fa0');results.push({path,status:200});}catch(e){failures.push({path,error:e.message});}
await mkdir('test-results',{recursive:true});await writeFile('test-results/live-seo.json',JSON.stringify({checkedAt:new Date().toISOString(),origin:SITE_ORIGIN,results,failures},null,2));
console.log('Live SEO: '+results.length+' checks passed, '+failures.length+' failed. This checks public HTTP/HTML, not Google indexing decisions.');if(failures.length){console.error(failures);process.exitCode=1;}
