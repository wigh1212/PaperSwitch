import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tools} from '../web/tools.mjs';
import {experienceRows} from '../web/experience-copy.mjs';

test('every tool has readable HTML instructions and localized JavaScript fallback after the tool',async()=>{
 for(const [i,prefix] of ['', 'ko/', 'ja/', 'zh-CN/'].entries()){
  for(const tool of tools){
   const html=await readFile(`dist/${prefix}${tool.slug}.html`,'utf8');
   const notice=html.indexOf('<noscript>');
   const guide=html.indexOf('id="tool-guide"');
   const details=html.indexOf('id="tool-details"');
   assert(notice>html.indexOf('class="intro"'),tool.slug);
   assert(guide>notice&&details>guide,tool.slug);
   assert(html.includes(experienceRows[3][i]),`${prefix}${tool.slug}: localized fallback`);
   assert(!html.includes('Enable JavaScript to use this tool.'),tool.slug);
   assert(html.slice(guide,details).includes('<ol>'),tool.slug);
  }
 }
});
