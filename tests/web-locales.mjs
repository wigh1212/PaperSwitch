import {seoRows} from '../web/seo-copy.mjs';
import {registerTranslations,translate} from '../extension/i18n.js';
registerTranslations(seoRows);
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {tools} from '../web/tools.mjs';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1280,height:950}});
await page.route('https://pagead2.googlesyndication.com/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('test-results',{recursive:true});
const missing=new Set();let logo;
try{
 for(const path of ['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy']){
  await page.goto('http://127.0.0.1:4173'+path);await page.waitForSelector('body[data-ready]');
  await page.selectOption('#language','en');
  const en=await page.locator('h1').textContent();const enDescription=await page.getAttribute('meta[name="description"]','content');
  const originals=await page.evaluate(()=>{
   const list=[],walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
   while(walk.nextNode()){const node=walk.currentNode,el=node.parentElement,text=node.data.trim();if(text&&/[a-zA-Z]{3}/.test(text)&&el.checkVisibility()&&!el.closest('script,style,[translate="no"],#language,summary,[data-source],.site-footer small')){list.push({el,text});}}
   window.localeAudit=list;return list.map(v=>v.text);
  });
  for(const lang of ['ko','ja','zh-CN','en']){
   await page.selectOption('#language',lang);
   assert.equal(await page.getAttribute('html','lang'),lang);assert.equal(await page.title(),(path==='/'?translate(seoRows[0][0],lang):await page.locator('h1').textContent())+' | Paper Switch');
   const box=await page.locator('.brand').boundingBox();const shape=[box.width,box.height];
   if(!logo)logo=shape;assert.deepEqual(shape,logo,'Logo geometry '+path+' '+lang);
   if(lang!=='en'){
    assert.notEqual(await page.locator('h1').textContent(),en);assert.notEqual(await page.getAttribute('meta[name="description"]','content'),enDescription);
    const remaining=await page.evaluate(()=>window.localeAudit.filter(({el,text})=>el.checkVisibility()&&el.textContent.trim()===text).map(v=>v.text));
    for(const s of remaining)if(!/^(PDF|PNG|JPG|SVG|WEBP|TIFF|TXT|UTF-8|English|한국어|日本語|简体中文|\d|glsrhfo17)/.test(s))missing.add(lang+': '+s);
   }
   assert((await page.getAttribute('meta[name="description"]','content')).length>0);
  }
 }
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('body[data-ready]');
 await page.selectOption('#language','ko');
 assert.equal(await page.locator('.format-group:visible').count(),1);await page.locator('[data-source="pdf"]').focus();await page.keyboard.press('ArrowRight');assert(await page.locator('#group-png').isVisible());
 await page.locator('[data-source="png"]').click();assert(await page.locator('#group-png').isVisible());
 const pngMenu=page.locator('.format-menu').filter({has:page.locator('summary',{hasText:/^PNG$/})});
 await pngMenu.hover();assert(await pngMenu.getAttribute('open')!==null);
 await pngMenu.locator('a[data-page-path="/png-to-svg"]').click();
 await page.waitForSelector('body[data-ready]');assert.equal(await page.getAttribute('html','lang'),'ko');
 assert.equal(await page.locator('h1').textContent(),'PNG → SVG 변환');
 await page.locator('#file').setInputFiles({name:'original-English-한국어.png',mimeType:'image/png',buffer:Buffer.from('bad')});
 await page.selectOption('#language','ja');
 assert((await page.locator('#queue').textContent()).includes('original-English-한국어.png'));
 assert.equal(await page.locator('#queue > li').count(),1);assert(await page.locator('#convert').isEnabled());
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('body[data-ready]');
 await page.selectOption('#language','ko');await page.screenshot({path:'test-results/home-ko.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/home-mobile-ko.png',fullPage:true});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
 const mobileMenu=page.locator('.format-menu').filter({has:page.locator('summary',{hasText:/^SVG$/})});
 await mobileMenu.locator('summary').click();assert(await mobileMenu.locator('.dropdown').isVisible());
 await page.keyboard.press('Escape');assert.equal(await mobileMenu.getAttribute('open'),null);
 await page.goto('http://127.0.0.1:4173/pdf-to-jpg');await page.waitForSelector('body[data-ready]');
 await page.screenshot({path:'test-results/tool-mobile-ko.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('MISSING',JSON.stringify([...missing],null,2));assert.equal(missing.size,0);
 console.log('PASS four-language coverage on '+(tools.length+4)+' pages, fixed logo, menus, persistence and mobile');
}finally{await browser.close();}
