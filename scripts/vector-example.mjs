import {readFile} from 'node:fs/promises';
import {vectorExampleRows as rows} from '../web/vector-example-copy.mjs';
const metrics=JSON.parse(await readFile('web/examples/vector-measurements.json','utf8'));
const text=i=>rows[i][0];
export function vectorExample(slug){if(slug!=='svg-to-png')return '';
 return '<section class="vector-example" aria-labelledby="vector-example-title"><h2 id="vector-example-title">'+text(0)+'</h2><p>'+text(1)+'</p><div class="vector-example-files"><figure><img loading="lazy" decoding="async" src="/assets/examples/vector-scale-1x.png" width="320" height="160" alt="'+text(10)+'"><figcaption><a download href="/assets/examples/vector-scale.svg">'+text(2)+'</a></figcaption></figure><ul>'+metrics.outputs.map((m,i)=>'<li><a download href="/assets/examples/'+m.file+'">'+text(i+3)+'</a><span translate="no">'+m.width+' x '+m.height+' px / '+(m.bytes/1000).toFixed(1)+' KB</span></li>').join('')+'</ul></div><p class="example-note">'+text(9)+'</p><p>'+text(5)+'</p><p>'+text(6)+'</p><h3>'+text(7)+'</h3><p>'+text(8)+'</p><div class="service-links"><a href="/svg-to-jpg">SVG to JPG</a><a href="/svg-to-pdf">SVG to PDF</a></div></section>';
}
