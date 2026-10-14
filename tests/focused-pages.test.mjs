import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'parse5';
import {tools} from '../web/tools.mjs';
import {locales,localizedPath} from '../web/seo-config.mjs';
import {modes} from '../extension/conversions.js';

const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const descendants=n=>[n,...(n.childNodes||[]).flatMap(descendants)];
for(const locale of locales)test(`${locale.language}: public tools contain only controls for their task`,async()=>{
 for(const tool of tools){
  const path=localizedPath('/'+tool.slug,locale.language);
  const source=await readFile('dist'+path+'.html','utf8'),all=descendants(parse(source));
  const main=all.find(n=>n.tagName==='main'),nodes=descendants(main);
  const ids=nodes.map(n=>attr(n,'id')).filter(Boolean),has=id=>ids.includes(id);
  assert.equal(new Set(ids).size,ids.length,path+' duplicate IDs');
  assert.ok(has('tool-guide')&&has('tool-details'),path+' static guidance');
  assert.ok(nodes.some(n=>attr(n,'href')===path+'#tool-guide'),path+' guide navigation');
  assert.ok(nodes.some(n=>attr(n,'href')===path+'#tool-details'),path+' result navigation');
  assert.ok(!has('utilities-section')&&!has('convert-tab'),path+' extension navigation leaked');
  if(tool.type==='convert'){
   const config=modes[tool.mode];
   assert.ok(has('file')&&has('convert')&&has('download'),path+' missing conversion');
   assert.ok(!ids.some(id=>id.endsWith('-mode')&&id!=='ocr-mode'||id.endsWith('-panel')),path+' other conversions leaked');
   assert.equal(has('pages'),config.input==='pdf'&&config.operation!=='merge',path+' page range');
   assert.equal(has('ocr-language'),config.input==='pdf'&&config.output==='txt',path+' OCR');
   assert.equal(has('pdf-output-options'),config.output==='pdf'&&config.operation!=='merge',path+' PDF output');
  }else if(tool.type==='qr'){
   assert.equal(has('create'),tool.slug!=='qr-reader',path+' QR creation');
   assert.equal(has('read'),tool.slug==='qr-reader',path+' QR reading');
   assert.equal(has('wifi-ssid'),tool.slug==='wifi-qr',path+' Wi-Fi fields');
   assert.equal(has('qr-text'),tool.slug==='qr-generator',path+' text fields');
  }else if(tool.type==='heic')assert.ok(!has('ft-pages'),path+' PDF selection leaked');
  else if(tool.type==='pdfedit'){
   assert.equal(has('ft-group'),tool.slug==='split-pdf',path+' split controls');
   assert.equal(has('ft-angle'),tool.slug==='rotate-pdf',path+' rotation controls');
  }else if(tool.type==='image')assert.ok(!has('image-remove'),path+' background controls leaked');
 }
});
