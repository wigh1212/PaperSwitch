import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tools} from '../web/tools.mjs';
import {SITE_ORIGIN,locales,localizedPath} from '../web/seo-config.mjs';
import {buildSitemaps} from '../scripts/sitemaps.mjs';
const routes=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy'];
const locs=s=>[...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
test('language sitemaps partition canonical URLs without omissions or duplicates',async()=>{
 const combined=locs(await readFile('dist/sitemap.xml','utf8')),parts=[];
 for(const l of locales){const xml=await readFile('dist/sitemap-'+l.language.toLowerCase()+'.xml','utf8'),urls=locs(xml);assert.deepEqual(urls,routes.map(r=>SITE_ORIGIN+localizedPath(r,l.language)));assert.equal((xml.match(/hreflang=/g)||[]).length,urls.length*5);parts.push(...urls);}
 assert.deepEqual([...parts].sort(),[...combined].sort());assert.equal(new Set(parts).size,routes.length*4);
 const index=locs(await readFile('dist/sitemap-index.xml','utf8'));assert.deepEqual(index,locales.map(l=>SITE_ORIGIN+'/sitemap-'+l.language.toLowerCase()+'.xml'));
 const robots=await readFile('dist/robots.txt','utf8');assert.ok(robots.includes('Sitemap: '+SITE_ORIGIN+'/sitemap-index.xml'));
});
test('duplicate routes fail sitemap generation',async()=>{await assert.rejects(()=>buildSitemaps(['/','/']),/Duplicate sitemap URL/);});
