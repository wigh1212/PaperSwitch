import {readFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {parse} from 'parse5';
import {tools} from '../web/tools.mjs';
import {SITE_ORIGIN,locales,localizedPath,structuredData} from '../web/seo-config.mjs';
import {translate,registerTranslations} from '../extension/i18n.js';
import {rows} from '../web/copy.mjs';
import {seoRows,faqsFor,faqPairs} from '../web/seo-copy.mjs';
import {searchCopy,searchRows} from '../web/search-copy.mjs';
registerTranslations(rows);registerTranslations(seoRows);registerTranslations(searchRows(tools));
const origin=process.env.WEB_BASE_URL||'http://127.0.0.1:4174';
const bases=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy'];
const routes=bases.flatMap(base=>locales.map(l=>({base,language:l.language,path:localizedPath(base,l.language)})));
function nodes(doc){const all=[];function walk(n){all.push(n);for(const c of n.childNodes||[])walk(c);}walk(doc);return all;}
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const text=n=>(n.childNodes||[]).map(c=>c.value||text(c)).join('');
for(const route of routes){
 const file='dist'+(route.path.endsWith('/')?route.path+'index.html':route.path+'.html');
 const html=await readFile(file,'utf8'),all=nodes(parse(html)),find=fn=>all.find(fn);
 assert.equal(attr(find(n=>n.tagName==='html'),'lang'),route.language);
 const canonicals=all.filter(n=>attr(n,'rel')==='canonical');assert.equal(canonicals.length,1);assert.equal(attr(canonicals[0],'href'),SITE_ORIGIN+route.path);
 const alternates=all.filter(n=>attr(n,'rel')==='alternate');assert.equal(alternates.length,5);
 for(const l of locales)assert.equal(attr(alternates.find(n=>attr(n,'hreflang')===l.language),'href'),SITE_ORIGIN+localizedPath(route.base,l.language));
 assert.equal(all.filter(n=>n.tagName==='h1').length,1);
 const tool=tools.find(t=>'/'+t.slug===route.base);
 if(tool){assert.equal(text(find(n=>n.tagName==='h1')),searchCopy(tool).title[locales.findIndex(l=>l.language===route.language)].split(' – ')[0]);for(const index of faqsFor(tool))assert(all.some(n=>n.tagName==='h3'&&text(n)===translate(faqPairs[index][0],route.language)));}
 if(route.base==='/')assert.equal(text(find(n=>n.tagName==='title')),translate(seoRows[0][0],route.language)+' | Paper Switch');
 const description=attr(find(n=>attr(n,'name')==='description'),'content');assert(description.trim().length>0,route.path);
 for(const link of all.filter(n=>n.tagName==='a'&&attr(n,'data-page-path')))assert.equal(attr(link,'href'),localizedPath(attr(link,'data-page-path'),route.language));
 const scripts=all.filter(n=>n.tagName==='script'&&attr(n,'src')?.includes('adsbygoogle.js'));assert.equal(scripts.length,1);assert.equal(scripts[0].parentNode.tagName,'head');
 const schema=JSON.parse(text(find(n=>attr(n,'id')==='seo-structured')));assert.equal(schema['@context'],'https://schema.org');
 const response=await fetch(origin+route.path);assert.equal(response.status,200,route.path);assert(response.headers.get('content-type').includes('text/html'));
}
const sitemap=await(await fetch(origin+'/sitemap.xml')).text();assert.equal((sitemap.match(/<loc>/g)||[]).length,160);
for(const route of routes)assert(sitemap.includes('<loc>'+SITE_ORIGIN+route.path+'</loc>'));
const robots=await(await fetch(origin+'/robots.txt')).text();assert(!robots.includes('Disallow: /assets'));assert(robots.includes(SITE_ORIGIN+'/sitemap.xml'));
const ads=await(await fetch(origin+'/ads.txt')).text();assert(ads.includes('pub-6110796878581495'));
for(const [from,to] of [['/en/pdf-to-jpg','/pdf-to-jpg'],['/ko','/ko/'],['/ko/pdf-to-jpg/','/ko/pdf-to-jpg'],['/ja/index.html','/ja/'],['/pdf-to-jpg.html','/pdf-to-jpg']]){
 const res=await fetch(origin+from,{redirect:'manual'});assert.equal(res.status,301,from);assert.equal(res.headers.get('location'),origin+to);
}
const missing=await fetch(origin+'/ko/missing-tool');assert.equal(missing.status,404);assert.equal(missing.headers.get('x-robots-tag'),'noindex');
assert.equal((await fetch(origin+'/assets/index.html')).headers.get('x-robots-tag'),'noindex');
console.log('PASS 160 raw HTML pages, translated content, metadata, links, sitemap, ads, redirects and 404.');
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const context=await browser.newContext({viewport:{width:1280,height:950}});
 await context.route('https://pagead2.googlesyndication.com/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const l of locales){
  await page.goto(origin+localizedPath('/pdf-to-jpg',l.language));await page.waitForSelector('body[data-ready]');
  assert.equal(await page.locator('h1').textContent(),translate('PDF to JPG Converter',l.language));
  await page.selectOption('#language','en');
  assert.equal(new URL(page.url()).pathname,'/pdf-to-jpg');
  assert.equal(await page.locator('h1').textContent(),'PDF to JPG Converter');
  assert.equal(await page.locator('.faq h3').first().textContent(),faqPairs[0][0]);
 }
 const {jsPDF}=await import('jspdf');const pdf=new jsPDF();pdf.text('SEO test',20,20);
 await page.locator('#file').setInputFiles({name:'Keep-WebP-한국어.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf.output('arraybuffer'))});
 await page.evaluate(()=>window.selectionMarker=1);
 for(const l of locales){
  await page.selectOption('#language',l.language);
  assert.equal(new URL(page.url()).pathname,localizedPath('/pdf-to-jpg',l.language));
  assert.equal(await page.locator('html').getAttribute('lang'),l.language);
  assert.equal(await page.evaluate(()=>window.selectionMarker),1);
  assert((await page.locator('#queue').textContent()).includes('Keep-WebP-한국어.pdf'));
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),SITE_ORIGIN+localizedPath('/pdf-to-jpg',l.language));
 }
 await page.goBack();assert.equal(await page.locator('html').getAttribute('lang'),'ja');
 await page.locator('#convert').click();await page.locator('#download').waitFor({state:'visible',timeout:60000});assert((await page.locator('#download').getAttribute('download')).endsWith('.jpg'));
 await mkdir('test-results',{recursive:true});
 await page.goto(origin+'/ko/');await page.waitForSelector('body[data-ready]');await page.screenshot({path:'test-results/seo-home-ko.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto(origin+'/ko/pdf-to-jpg');await page.waitForSelector('body[data-ready]');await page.screenshot({path:'test-results/seo-tool-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const noJS=await browser.newContext({javaScriptEnabled:false});const raw=await noJS.newPage();
 for(const l of locales){await raw.goto(origin+localizedPath('/pdf-to-txt',l.language));assert.equal(await raw.locator('h1').textContent(),translate('PDF to TXT',l.language));assert(await raw.locator('.faq').isVisible());}
 assert.deepEqual(errors,[]);
 console.log('PASS no-JavaScript localization, language URL switching, history, file retention, real conversion and responsive layout.');
}finally{await browser.close();}


