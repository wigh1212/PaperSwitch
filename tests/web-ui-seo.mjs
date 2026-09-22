import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {parse} from 'parse5';
import {pathToFileURL} from 'node:url';
import {tools} from '../web/tools.mjs';
import {SITE_ORIGIN,locales,localizedPath} from '../web/seo-config.mjs';
import {landingRows} from '../web/landing-copy.mjs';
const bases=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy'];
function nodes(root){const a=[];function visit(n){a.push(n);for(const c of n.childNodes||[])visit(c);}visit(root);return a;}
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const content=n=>(n.childNodes||[]).map(c=>c.value||content(c)).join('');
for(const locale of locales){const titles=new Set();for(const base of bases){const path=localizedPath(base,locale.language),html=await readFile('dist'+(path.endsWith('/')?path+'index.html':path+'.html'),'utf8'),all=nodes(parse(html));
 const find=f=>all.find(f),title=content(find(n=>n.tagName==='title'));assert.ok(!titles.has(title));titles.add(title);
 assert.equal(all.filter(n=>n.tagName==='h1').length,1);assert.equal(attr(find(n=>attr(n,'rel')==='canonical'),'href'),SITE_ORIGIN+path);assert.equal(all.filter(n=>attr(n,'rel')==='alternate').length,5);
 assert.ok(attr(find(n=>attr(n,'name')==='description'),'content').trim().length>0);
 for(const a of all.filter(n=>n.tagName==='a'&&attr(n,'data-page-path')))assert.ok(bases.includes(attr(a,'data-page-path')));
 const paragraphs=all.filter(n=>n.tagName==='p').map(content);if(['split-pdf','extract-pdf-pages','delete-pdf-pages','rotate-pdf'].some(s=>base==='/'+s)){assert.equal(paragraphs.filter(p=>p===attr(find(n=>attr(n,'name')==='description'),'content')).length,1);assert.ok(all.some(n=>n.tagName==='h3'));}
 }}
assert.equal((await readFile('dist/sitemap.xml','utf8')).match(/<loc>/g).length,bases.length*4);
console.log('PASS '+(bases.length*locales.length)+' static pages: unique titles, canonical/hreflang, descriptions, links, useful PDF FAQs and no repeated intro');
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);const browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://pagead2.googlesyndication.com/**',r=>r.fulfill({body:''}));
 await page.goto('http://127.0.0.1:4173/ko/');await page.waitForSelector('body[data-ready]');assert.equal(await page.locator('.quick-card').count(),6);assert.equal(await page.locator('.format-menu').count(),3);assert.equal(await page.locator('.tool-category[open]').count(),0);assert.equal(await page.locator('.category-links a').count(),tools.length);assert.equal(await page.locator('.task-nav .dropdown a').count(),tools.length);
 for(const [i,l] of locales.entries()){await page.selectOption('#language',l.language);assert.equal(await page.locator('h1').textContent(),landingRows[0][i]);assert.equal(await page.locator('.quick-card').first().getAttribute('href'),localizedPath('/jpg-to-pdf',l.language));}
 await page.selectOption('#language','ko');await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/home-ui-desktop.png',fullPage:true});
 await page.locator('.tool-category>summary').first().focus();await page.keyboard.press('Enter');assert.ok(await page.locator('.category-links').first().isVisible());
 for(const width of [390,320]){await page.setViewportSize({width,height:844});for(const summary of await page.locator('.task-nav summary').all()){await summary.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.task-nav details[open]').count(),1);const box=await page.locator('.task-nav details[open] .dropdown').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);await page.keyboard.press('Escape');assert.equal(await page.locator('.task-nav details[open]').count(),0);}assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.locator('.tool-category>summary').first().click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/home-ui-mobile.png',fullPage:true});
 await page.locator('.quick-card').first().click();await page.waitForSelector('body[data-ready]');assert.ok(page.url().endsWith('/ko/jpg-to-pdf'));assert.ok(await page.locator('.related a[href="/ko/pdf-to-jpg"]').count());assert.deepEqual(errors,[]);
 const context=await browser.newContext({javaScriptEnabled:false});const raw=await context.newPage();await raw.goto('http://127.0.0.1:4173/ko/');assert.equal(await raw.locator('.quick-card').count(),6);assert.equal(await raw.locator('h1').textContent(),landingRows[0][1]);await context.close();
 console.log('PASS home discovery, language switching, keyboard categories, mobile 320/390, related link and no-JS home');
}finally{await browser.close();}
