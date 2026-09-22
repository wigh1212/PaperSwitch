import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {parse} from 'parse5';
import {tools} from '../web/tools.mjs';
import {locales,localizedPath,SITE_ORIGIN} from '../web/seo-config.mjs';
const routes=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy','/terms'];
const attr=(n,k)=>n?.attrs?.find(a=>a.name===k)?.value;
const text=n=>(n.childNodes||[]).map(c=>c.value||text(c)).join('');
const nodes=root=>{const a=[];const walk=n=>{a.push(n);for(const c of n.childNodes||[])walk(c)};walk(root);return a;};
const file=p=>'dist'+(p.endsWith('/')?p+'index.html':/\.[^/]+$/.test(p)?p:p+'.html');
const inventory=[],missing=new Set();
for(const locale of locales){const titles=new Set(),descriptions=new Set();for(const base of routes){const path=localizedPath(base,locale.language),source=await readFile(file(path),'utf8'),all=nodes(parse(source));
const find=f=>all.find(f),meta=name=>attr(find(n=>attr(n,'name')===name),'content');
assert.equal(attr(find(n=>n.tagName==='html'),'lang'),locale.language,path);
assert.equal(all.filter(n=>n.tagName==='h1').length,1,path);assert.ok(!source.includes('�'),path);
const title=text(find(n=>n.tagName==='title')),description=meta('description');assert.ok(description);assert.ok(!titles.has(title),path);titles.add(title);assert.ok(!descriptions.has(description),'duplicate description '+path);descriptions.add(description);
assert.equal(attr(find(n=>attr(n,'rel')==='canonical'),'href'),SITE_ORIGIN+path);
assert.equal(meta('twitter:description'),description);assert.ok(meta('twitter:title'));assert.equal(all.filter(n=>attr(n,'rel')==='alternate').length,5);
assert.ok(!/noindex/.test(meta('robots')||''));JSON.parse(text(find(n=>attr(n,'id')==='seo-structured')));
for(const href of ['/','/about','/contact','/privacy','/terms'])assert.ok(all.some(n=>n.tagName==='a'&&attr(n,'href')===localizedPath(href,locale.language)),path+' footer '+href);
const baseURL=new URL(attr(find(n=>n.tagName==='base'),'href')||path,SITE_ORIGIN);
for(const n of all){const v=n.tagName==='a'?attr(n,'href'):['script','img'].includes(n.tagName)?attr(n,'src'):n.tagName==='link'&&attr(n,'rel')==='stylesheet'?attr(n,'href'):null;if(!v||/^(mailto:|data:|blob:|#)/.test(v))continue;const u=new URL(v,baseURL);if(u.origin!==SITE_ORIGIN)continue;try{await access(file(decodeURIComponent(u.pathname)));}catch{missing.add(path+' -> '+u.pathname)}}
inventory.push({path,title,description,engine:attr(find(n=>n.tagName==='body'),'data-engine')||'static',h2:all.filter(n=>n.tagName==='h2').map(text),faq:all.filter(n=>attr(n,'class')==='faq').length});
}}
assert.deepEqual([...missing],[]);const error=await readFile('dist/404.html','utf8');assert.ok(!error.includes('adsbygoogle.js'));assert.ok(error.includes('name="robots" content="noindex"'));assert.ok(error.includes('/jpg-to-pdf'));await mkdir('test-results',{recursive:true});await writeFile('test-results/site-inventory.json',JSON.stringify(inventory,null,2));console.log('PASS '+inventory.length+' pages: unique metadata, localized policy links, assets, internal links, schema, translation encoding and 404');

