import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://pagead2.googlesyndication.com/**',r=>r.fulfill({body:''}));
try{
await page.goto('http://127.0.0.1:4173/ko/gif-maker');await page.waitForFunction(()=>document.body.dataset.ready==='true');
const make=async(color)=>Buffer.from(await page.evaluate(color=>{const c=document.createElement('canvas');c.width=80;c.height=40;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,80,40);return c.toDataURL().split(',')[1];},color),'base64');
await page.locator('#gif-files').setInputFiles([{name:'red.png',mimeType:'image/png',buffer:await make('red')},{name:'blue.png',mimeType:'image/png',buffer:await make('blue')}]);
await page.waitForFunction(()=>document.querySelectorAll('#gif-frames li').length===2);
await page.locator('#gif-frames li').nth(1).getByRole('button',{name:'앞으로 이동'}).click();
assert.match(await page.locator('#gif-frames li').first().innerText(),/blue.png/);
await page.locator('#gif-run').click();await page.locator('#gif-download').waitFor({state:'visible'});
const decoded=await page.evaluate(async()=>{const bytes=await(await fetch(document.querySelector('#gif-download').href)).arrayBuffer();const d=new ImageDecoder({data:bytes,type:'image/gif'});await d.tracks.ready;const f=await d.decode({frameIndex:0});const c=new OffscreenCanvas(80,40),x=c.getContext('2d');x.drawImage(f.image,0,0);const pixel=[...x.getImageData(20,20,1,1).data];const result={count:d.tracks.selectedTrack.frameCount,repeat:d.tracks.selectedTrack.repetitionCount,duration:f.image.duration,width:f.image.displayWidth,pixel};f.image.close();d.close();return result;});
assert.equal(decoded.count,2);assert.equal(decoded.duration,500000);assert.equal(decoded.width,80);assert.ok(decoded.pixel[2]>240&&decoded.pixel[0]<15);assert.equal(decoded.repeat,Infinity);
await page.locator('#gif-repeat').uncheck();assert.equal(await page.locator('#gif-download').isVisible(),false);await page.locator('#gif-delay').fill('250');await page.locator('#gif-run').click();await page.locator('#gif-download').waitFor({state:'visible'});
const once=await page.evaluate(async()=>{const d=new ImageDecoder({data:await(await fetch(document.querySelector('#gif-download').href)).arrayBuffer(),type:'image/gif'});await d.tracks.ready;const f=await d.decode({frameIndex:1});const r={repeat:d.tracks.selectedTrack.repetitionCount,duration:f.image.duration};f.image.close();d.close();return r;});assert.equal(once.repeat,0);assert.equal(once.duration,250000);
await page.locator('#language').selectOption('ja');assert.match(await page.locator('h1').innerText(),/GIF作成/);assert.equal(await page.locator('#gif-frames li').count(),2);
await page.locator('#gif-delay').fill('1');await page.locator('#gif-run').click();assert.equal(await page.locator('#gif-download').isVisible(),false);assert.match(await page.locator('#gif-status').innerText(),/100/);
await page.locator('#gif-delay').fill('500');await page.locator('#language').selectOption('ko');await page.locator('#gif-run').click();await page.locator('#gif-download').waitFor({state:'visible'});await page.evaluate(()=>window.scrollTo(0,0));await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/gif-mobile.png',fullPage:true});await page.setViewportSize({width:1280,height:900});await page.screenshot({path:'test-results/gif-desktop.png',fullPage:true});
for(const [prefix,title] of [['','GIF Maker'],['ko/','GIF 만들기'],['ja/','GIF作成'],['zh-cn/','GIF制作']]){const html=await readFile('dist/'+prefix+'gif-maker.html','utf8');assert.ok(html.includes(title));assert.ok(html.includes('https://paperswitch.saerokbit.com/'+prefix+'gif-maker'));assert.ok((await readFile('dist/sitemap.xml','utf8')).includes('/'+prefix+'gif-maker'));}
assert.deepEqual(errors,[]);console.log('PASS: GIF decoded frames, order, duration, repeat, stale output, validation, languages, mobile and SEO.');
}finally{await browser.close();}
