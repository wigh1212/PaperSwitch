import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
import {tools} from '../web/tools.mjs';
import {locales,localizedPath} from '../web/seo-config.mjs';
import {taskGuideRows} from '../web/task-guides.mjs';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
await mkdir('test-results',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:320,height:850}});
 page.on('pageerror',error=>errors.push(error.message));
 for(const locale of locales)for(const tool of tools){
  const path=localizedPath('/'+tool.slug,locale.language);
  assert.equal((await page.goto('http://127.0.0.1:4173'+path)).status(),200);
  await page.waitForSelector('body[data-ready]');
  assert.equal(await page.locator('html').getAttribute('lang'),locale.language,path);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow');
  for(const selector of ['#tool-guide','#tool-details']){
   await page.locator('.task-sections a[href$="'+selector+'"]').click();
   assert.equal(new URL(page.url()).hash,selector);
  }
 }
 console.log('PASS 188 task pages: four languages, initialization, mobile width and section links');
 await page.goto('http://127.0.0.1:4173/qr-reader');await page.waitForSelector('body[data-ready]');
 for(const [index,locale] of locales.entries()){
  await page.selectOption('#language',locale.language);
  assert.equal(await page.locator('.task-guidance p').first().textContent(),taskGuideRows[2][index]);
  assert.equal(await page.locator('.task-sections a').first().getAttribute('href'),localizedPath('/qr-reader',locale.language)+'#tool-guide');
 }
 await page.selectOption('#language','ko');
 await page.screenshot({path:'test-results/focused-qr-reader-mobile.png',fullPage:true});
 await page.goto('http://127.0.0.1:4173/png-to-jpg');await page.waitForSelector('body[data-ready]');
 await page.screenshot({path:'test-results/focused-png-jpg-mobile.png',fullPage:true});
 await page.setViewportSize({width:1280,height:900});
 await page.screenshot({path:'test-results/focused-png-jpg-desktop.png',fullPage:true});
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('body[data-ready]');
 assert.ok(await page.locator('.home-evidence').isVisible());
 await page.screenshot({path:'test-results/focused-home-desktop.png',fullPage:true});
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),raw=await noJS.newPage();
 for(const path of ['/png-to-jpg','/qr-reader','/wifi-qr','/image-resizer']){
  await raw.goto('http://127.0.0.1:4173'+path);
  assert.ok(await raw.locator('#tool-guide').isVisible());
  assert.ok(await raw.locator('#tool-details').isVisible());
  assert.ok(await raw.locator('.javascript-notice').isVisible());
 }
 await noJS.close();assert.deepEqual(errors,[]);
 console.log('PASS translated task guidance, visible home examples, no-JavaScript instructions and no browser errors');
}finally{await browser.close();}
