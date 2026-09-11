import test from 'node:test';
import assert from 'node:assert/strict';
import {runBatch} from '../extension/services/batch-service.js';
import {translate} from '../extension/i18n.js';
const files=[{name:'same.pdf',size:5},{name:'broken.pdf',size:5},{name:'same.pdf',size:5}];
const config={input:'pdf',output:'svg'};
test('combined PDF output preserves order and never merges incomplete batches',async()=>{
  let merges=0;
  const base={files:[{name:'a.svg',size:1},{name:'b.svg',size:1}],config:{input:'svg',output:'pdf'},options:{pdfOutput:'combined'},access:{async authorize(){}}};
  const service={async convert(file){return {[file.name+'.pdf']:new Uint8Array([file.name==='a.svg'?1:2])};},async merge(parts){merges++;assert.deepEqual(await Promise.all(parts.map(async p=>[...new Uint8Array(await p.arrayBuffer())])),[[1],[2]]);return {'merged.pdf':new Uint8Array([1,2])};}};
  const result=await runBatch({...base,service});assert.deepEqual(Object.keys(result.entries),['merged.pdf']);assert.equal(result.success,2);
  await assert.rejects(runBatch({...base,service:{...service,async convert(file){if(file.name==='b.svg')throw new Error('broken');return {'a.pdf':new Uint8Array([1])};}}}),/Some files failed/);
  assert.equal(merges,1);
  const individual=await runBatch({...base,options:{pdfOutput:'individual'},service});assert.equal(Object.keys(individual.entries).length,2);assert.equal(merges,1);
});
test('batch isolates failures, preserves duplicate names, and checks access first',async()=>{
  let authorized=false;const events=[];
  const result=await runBatch({files,config,options:{},access:{async authorize(){authorized=true;}},service:{async convert(file){assert.ok(authorized);if(file.name==='broken.pdf')throw new Error('broken');return {'same.svg':new Uint8Array([1])};}},onEvent:event=>events.push(event)});
  assert.equal(result.success,2);assert.equal(result.failed,1);assert.deepEqual(Object.keys(result.entries),['01-same.svg','03-same.svg']);assert.equal(events.filter(e=>e.type==='error').length,1);
});
test('access denial prevents conversion; aborted batches do not start another file',async()=>{
  let calls=0;const service={async convert(){calls++;return {};}};
  await assert.rejects(runBatch({files,config,access:{async authorize(){throw new Error('denied');}},service}),/denied/);assert.equal(calls,0);
  const controller=new AbortController();
  await assert.rejects(runBatch({files,config,signal:controller.signal,access:{async authorize(){}},service:{async convert(){calls++;controller.abort();return {};}}}),{name:'AbortError'});assert.equal(calls,1);
});
test('four-language nested errors and counts preserve values',()=>{
  assert.equal(translate('Failed · 올바른 SVG 파일이 아닙니다.','en'),'Failed · Invalid SVG file.');
  assert.equal(translate('성공 2개 · 실패 1개 · 결과 2개 · 3 KB','ja'),'成功: 2 · 失敗: 1 · 出力: 2 · 3 KB');
  assert.equal(translate('Cancelled','zh-CN'),'已取消');
  assert.equal(translate('Converting','ko'),'변환 중');
});
