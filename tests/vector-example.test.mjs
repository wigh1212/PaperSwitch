import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {vectorExampleRows} from '../web/vector-example-copy.mjs';
test('SVG example downloads match measured PNG dimensions and sizes in every locale',async()=>{
 const m=JSON.parse(await readFile('web/examples/vector-measurements.json'));
 const source=await readFile('web/examples/vector-scale.svg');assert.equal(source.length,m.sourceBytes);assert.match(source.toString(),/viewBox="0 0 320 160"/);
 for(const output of m.outputs){const png=await readFile('web/examples/'+output.file);assert.equal(png.length,output.bytes);assert.equal(png.readUInt32BE(16),output.width);assert.equal(png.readUInt32BE(20),output.height);assert.equal(output.width,320*output.scale);assert.equal(output.height,160*output.scale);assert.deepEqual(png,await readFile('dist/assets/examples/'+output.file));}
 for(const [i,prefix] of ['','ko/','ja/','zh-cn/'].entries()){const html=await readFile('dist/'+prefix+'svg-to-png.html','utf8');assert.ok(html.includes(vectorExampleRows[0][i]));assert.ok(html.includes(vectorExampleRows[5][i]));for(const f of ['vector-scale.svg',...m.outputs.map(o=>o.file)])assert.ok(html.includes('/assets/examples/'+f));}
});
