import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DEFAULT_LANGUAGE,localizedPath,splitPath} from '../web/seo-config.mjs';
import worker from '../web/worker.js';

test('Korean is served in root HTML; English has an explicit address',async()=>{
 assert.equal(DEFAULT_LANGUAGE,'ko');
 assert.deepEqual(splitPath('/pdf-to-jpg'),{language:'ko',base:'/pdf-to-jpg'});
 assert.deepEqual(splitPath('/ko/pdf-to-jpg'),{language:'ko',base:'/pdf-to-jpg'});
 assert.equal(localizedPath('/','en'),'/en/');
 const html=await readFile('dist/index.html','utf8');
 assert.match(html,/<html lang="ko">/);
 assert.match(html,/파일 변환과 정리, 한곳에서\./);
 assert.match(html,/PDF를 합치고, 사진 형식을 바꾸고, 파일 용량을 줄이세요\./);
 assert.match(html,/hreflang="en" href="https:\/\/paperswitch.saerokbit.com\/en\/"/);
 const english=await readFile('dist/en/index.html','utf8');
 assert.match(english,/<html lang="en">/);
});
test('old Korean addresses redirect once and preserve query parameters',async()=>{
 const env={ASSETS:{fetch:async()=>new Response('page')}};
 for(const base of ['/','/pdf-to-jpg','/privacy']){
  const alias=base==='/'?'/ko/':'/ko'+base;
  const response=await worker.fetch(new Request('https://paperswitch.saerokbit.com'+alias+'?source=bookmark'),env);
  assert.equal(response.status,301);
  assert.equal(response.headers.get('location'),'https://paperswitch.saerokbit.com'+base+'?source=bookmark');
  assert.equal((await worker.fetch(new Request('https://paperswitch.saerokbit.com'+base),env)).status,200);
 }
});
