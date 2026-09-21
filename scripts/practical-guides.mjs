import {practicalGuides,practicalLabels as l} from '../web/practical-guides.mjs';
import {readFile} from 'node:fs/promises';
const measurements=JSON.parse(await readFile('web/examples/measurements.json','utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function practicalGuide(slug){const g=practicalGuides[slug];if(!g)return '';const all=measurements.samples,m=g.metric==='pdfImage'?all.conversion:all[g.metric];const input=g.metric==='conversion'?m.jpgBytes:g.metric==='pdfImage'?m.pdfBytes:m.input,output=g.metric==='conversion'?m.pdfBytes:g.metric==='pdfImage'?m.resultBytes:m.output;
 const metrics='<p class="example-metrics" translate="no">'+(input/1000).toFixed(1)+' KB → '+(output/1000).toFixed(1)+' KB</p>';
 const links=g.input?'<a download href="/assets/examples/'+g.input+'">'+esc(l.input)+'</a><a download href="/assets/examples/'+g.output+'">'+esc(l.output)+'</a>':'<a href="'+esc(m.source)+'" target="_blank" rel="noopener noreferrer">'+esc(l.source)+'</a>';
 return '<section class="practical-guide" aria-labelledby="practical-title"><h2 id="practical-title">'+esc(l.example)+'</h2><p>'+esc(g.intro)+'</p><div class="example-card">'+(g.image?'<img loading="lazy" width="600" height="400" src="/assets/examples/'+g.image+'" alt="'+esc(l.output)+'">':'')+'<div>'+metrics+'<div class="example-links">'+links+'</div><p class="example-note">'+esc(l.tested)+'</p><p class="example-note">'+esc(l.note)+'</p></div></div><h3>'+esc(l.settings)+'</h3><p>'+esc(g.settings)+'</p><h3>'+esc(l.fix)+'</h3><p>'+esc(g.fix)+'</p></section>';
}
