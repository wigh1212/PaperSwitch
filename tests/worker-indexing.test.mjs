import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../web/worker.js';
const origin='https://paperswitch.saerokbit.com';
const env={ASSETS:{fetch:async request=>new Response('page',{status:new URL(request.url).pathname==='/missing'?404:200})}};
test('production pages and sitemap are indexable',async()=>{
 for(const path of ['/','/ko/pdf-to-jpg','/ja/','/sitemap.xml','/robots.txt']){
  const response=await worker.fetch(new Request(origin+path),env);
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-robots-tag'),null);
  assert.equal(await response.text(),'page');
 }
});
test('preview hosts and error pages retain indexing protection',async()=>{
 for(const url of ['https://preview.workers.dev/',origin+'/missing',origin+'/assets/index.html']){
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
  assert.equal(response.headers.get('location'),origin+'/ko/pdf-to-jpg?x=1');
 }
});
