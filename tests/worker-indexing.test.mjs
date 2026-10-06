import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../web/worker.js';
const origin='https://paperswitch.saerokbit.com';
const env={ASSETS:{fetch:async request=>new Response('page',{status:new URL(request.url).pathname==='/missing'?404:200})}};
test('production pages and sitemap are indexable',async()=>{
 for(const path of ['/','/en/pdf-to-jpg','/ja/','/sitemap.xml','/robots.txt']){
  const response=await worker.fetch(new Request(origin+path),env);
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-robots-tag'),null);
  assert.equal(await response.text(),'page');
 }
});
test('preview hosts and error pages retain indexing protection',async()=>{
 for(const url of ['https://preview.workers.dev/en/',origin+'/missing',origin+'/assets/index.html']){
  const response=await worker.fetch(new Request(url),env);
  assert.equal(response.headers.get('x-robots-tag'),'noindex');
 }
 const robots=await worker.fetch(new Request('https://preview.workers.dev/robots.txt'),env);
 assert.match(await robots.text(),/Disallow: \/$/m);
});
test('production aliases preserve path and query on redirect',async()=>{
 for(const host of ['http://paperswitch.saerokbit.com','https://www.paperswitch.saerokbit.com']){
  const response=await worker.fetch(new Request(host+'/ko/pdf-to-jpg?x=1'),env);
  assert.equal(response.status,301);
  assert.equal(response.headers.get('location'),origin+'/pdf-to-jpg?x=1');
 }
});

test('root domain allows ads.txt discovery and redirects pages to the canonical service',async()=>{
 const adsEnv={ASSETS:{fetch:async()=>new Response('google.com, pub-6110796878581495, DIRECT, f08c47fec0942fa0\n',{headers:{'X-Robots-Tag':'noindex'}})}};
 for(const host of ['saerokbit.com','www.saerokbit.com']){const robots=await worker.fetch(new Request('https://'+host+'/robots.txt'),env);assert.match(await robots.text(),/Allow: \/$/m);const ads=await worker.fetch(new Request('https://'+host+'/ads.txt'),adsEnv);assert.equal(ads.status,200);assert.equal(ads.headers.get('x-robots-tag'),null);assert.match(ads.headers.get('content-type'),/text\/plain/);assert.match(await ads.text(),/pub-6110796878581495/);const page=await worker.fetch(new Request('https://'+host+'/ko/compress-pdf?x=1'),env);assert.equal(page.status,301);assert.equal(page.headers.get('location'),origin+'/compress-pdf?x=1');}
});

test('known aliases normalize path and host in one worker redirect',async()=>{for(const host of ['https://saerokbit.com','https://www.paperswitch.saerokbit.com','http://paperswitch.saerokbit.com']){const r=await worker.fetch(new Request(host+'/ko/terms.html?from=audit'),env);assert.equal(r.status,301);assert.equal(r.headers.get('location'),origin+'/terms?from=audit');}});


test('preview strips only site ads, while public HTML retains them',async()=>{
 const html='<html><head><script data-site-ad="" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6110796878581495"></script></head><body><main>Tool</main><aside class="home-ad"><span>Advertisement</span><ins data-home-ad></ins></aside><script type="module" src="/site.js"></script></body></html>';
 const htmlEnv={ASSETS:{fetch:async()=>new Response(html,{headers:{'content-type':'text/html','etag':'old','content-length':String(html.length)}})}};
 const preview=await worker.fetch(new Request('https://test.workers.dev/'),htmlEnv),body=await preview.text();
 assert.doesNotMatch(body,/adsbygoogle|data-home-ad/);assert.match(body,/<main>Tool<\/main>/);assert.match(body,/src="\/site.js"/);
 assert.equal(preview.headers.get('x-robots-tag'),'noindex');assert.equal(preview.headers.get('etag'),null);assert.equal(preview.headers.get('content-length'),null);assert.equal(preview.headers.get('cache-control'),'no-store');
 const prod=await worker.fetch(new Request(origin+'/'),htmlEnv);assert.equal(await prod.text(),html);
});

test('canonical variants redirect once, canonical URLs do not redirect',async()=>{
 for(const [path,target] of [['/ko','/'],['/ko/index.html','/'],['/en','/en/'],['/index.html','/'],['/ko/webp-to-jpg/','/webp-to-jpg'],['/ja/about.html','/ja/about'],['/ZH-CN/terms/','/zh-cn/terms']]){
  const r=await worker.fetch(new Request(origin+path+'?ref=test'),env);assert.equal(r.status,301,path);assert.equal(r.headers.get('location'),origin+target+'?ref=test');
  assert.equal((await worker.fetch(new Request(origin+target),env)).status,200,target);
 }
});
