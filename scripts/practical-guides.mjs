import {practicalGuides,practicalLabels as l} from '../web/practical-guides.mjs';
import {readFile} from 'node:fs/promises';
const measurements=JSON.parse(await readFile('web/examples/measurements.json','utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function practicalGuide(slug){const g=practicalGuides[slug];if(!g)return '';const all=measurements.samples,m=g.metric==='pdfImage'?all.conversion:all[g.metric];const input=g.metric==='conversion'?m.jpgBytes:g.metric==='pdfImage'?m.pdfBytes:m.input,output=g.metric==='conversion'?m.pdfBytes:g.metric==='pdfImage'?m.resultBytes:m.output;
 const metrics='<p class="example-metrics"><span>Original</span>: '+(input/1000).toFixed(1)+' KB, <span>Result</span>: '+(output/1000).toFixed(1)+' KB</p>';
 const links=g.input?'<a download href="/assets/examples/'+g.input+'">'+esc(l.input)+'</a><a download href="/assets/examples/'+g.output+'">'+esc(l.output)+'</a>':'<a href="'+esc(m.source)+'" target="_blank" rel="noopener noreferrer">'+esc(l.source)+'</a>';
 let example='<div class="example-card">'+(g.image?'<img loading="lazy" width="600" height="400" src="/assets/examples/'+g.image+'" alt="'+esc(l.output)+'">':'')+'<div>'+metrics+'<div class="example-links">'+links+'</div><p class="example-note">'+esc(l.note)+'</p></div></div>';
 if(slug==='compress-pdf'){
  const figures=[{label:l.before,size:input,image:'pdf-before-detail.png',pdf:g.input,download:l.pdfInput},{label:l.after,size:output,image:'pdf-after-detail.png',pdf:g.output,download:l.pdfOutput}];
  example='<div class="pdf-example-comparison"><div class="pdf-example-summary"><strong>'+esc(l.retained)+'</strong><span>'+esc(l.reduced.replace('{0}',Math.round((1-output/input)*100)))+'</span></div><div class="pdf-example-pair">'+figures.map(f=>'<figure><div class="pdf-example-heading"><h3>'+esc(f.label)+'</h3><strong translate="no">'+(f.size/1000).toFixed(1)+' KB</strong></div><img loading="lazy" width="736" height="572" src="/assets/examples/'+f.image+'" alt="'+esc(l.excerpt)+'"><figcaption>'+esc(l.excerpt)+'</figcaption><div class="example-links"><a download href="/assets/examples/'+f.pdf+'">'+esc(f.download)+'</a></div></figure>').join('')+'</div><p class="example-note">'+esc(l.pdfNote)+'</p></div>';
 }
 return '<section class="practical-guide" aria-labelledby="practical-title"><h2 id="practical-title">'+esc(l.example)+'</h2><p>'+esc(g.intro)+'</p>'+example+'<h3>'+esc(l.settings)+'</h3><p>'+esc(g.settings)+'</p><h3>'+esc(l.fix)+'</h3><p>'+esc(g.fix)+'</p></section>';
}
