import {landingRows} from '../web/landing-copy.mjs';
import {practicalGuide} from './practical-guides.mjs';
import {pdfCompressRows} from '../web/pdf-compress-copy.mjs';
import {htmlRows} from '../web/html-copy.mjs';
import {gifRows} from '../web/gif-copy.mjs';
import {build} from 'esbuild';
import {uxRows,guideSteps} from '../web/ux-copy.mjs';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {tools,formats,label} from '../web/tools.mjs';
const out='dist',escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await mkdir(out,{recursive:true});
await cp('web/landing-copy.mjs',out+'/landing-copy.js');
await cp('web/practical-guides.mjs',out+'/practical-guides.js');
await cp('web/examples',out+'/assets/examples',{recursive:true});
await mkdir(out+'/assets',{recursive:true});
await cp('web/pdf-compress-copy.mjs',out+'/pdf-compress-copy.js');
for(const f of ['pdf-compressor.js','pdf-compress-worker.js','pdf-compress-core.mjs'])await cp('web/'+f,out+'/assets/'+(f==='pdf-compress-core.mjs'?'pdf-compress-core.js':f));
await cp('web/html-copy.mjs',out+'/html-copy.js');
await cp('web/html-to-pdf.js',out+'/assets/html-to-pdf.js');
await build({entryPoints:['web/html-export.js'],outfile:out+'/assets/html-export.js',bundle:true,format:'esm',platform:'browser',minify:true});
await cp('node_modules/html2canvas/LICENSE',out+'/assets/html2canvas-LICENSE');
await build({entryPoints:['web/html-document.mjs'],outfile:out+'/assets/html-document.js',bundle:true,format:'esm',platform:'browser',minify:true});
await cp('web/gif-copy.mjs',out+'/gif-copy.js');
await mkdir(out+'/assets/vendor',{recursive:true});
await cp('web/gif-maker.js',out+'/assets/gif-maker.js');
await cp('node_modules/gifenc/LICENSE.md',out+'/assets/vendor/gifenc-LICENSE');
await build({entryPoints:['web/gif-worker.js'],outfile:out+'/assets/gif-worker.js',bundle:true,format:'esm',platform:'browser',minify:true});
await cp('web/ux-copy.mjs',out+'/ux-copy.js');
await cp('web/ads.txt',out+'/ads.txt');
await cp('web/growth-copy.mjs',out+'/growth-copy.js');
await mkdir(out+'/assets',{recursive:true});
for(const f of ['file-tools.js','pdf-edit-worker.js','heic-worker.js'])await cp('web/'+f,out+'/assets/'+f);
await mkdir(out+'/assets/vendor',{recursive:true});
await cp('node_modules/heic-to/dist/next/heic-to.js',out+'/assets/vendor/heic-to.js');
await cp('node_modules/heic-to/LICENSE',out+'/assets/vendor/heic-to-LICENSE');
await cp('web/image-compressor.js',out+'/assets/image-compressor.js');
await cp('web/compressor-copy.mjs',out+'/compressor-copy.js');
await cp('extension',out+'/assets',{recursive:true,filter:path=>!path.endsWith('manifest.json')&&!path.endsWith('background.js')});
for(const file of ['site.css','site.js','copy.mjs'])await cp('web/'+file,out+'/'+(file==='copy.mjs'?'copy.js':file));
const menuLabel=t=>t.slug.includes('-to-')?label(t.input)+' → '+label(t.output):escape(t.title);
const link=t=>'<a href="/'+t.slug+'">'+menuLabel(t)+'</a>';
const logo='<a class="brand" href="/" translate="no" aria-label="Paper Switch"><img src="/favicon.svg" width="34" height="34" alt=""><span>Paper Switch</span></a>';
const lr=i=>escape(landingRows[i][0]);
const categories=[{name:lr(2),key:'pdf',items:tools.filter(t=>t.input==='pdf'||t.output==='pdf'||t.type==='pdfedit')},{name:lr(3),key:'image',items:tools.filter(t=>t.input!=='pdf'&&t.output!=='pdf'&&t.type!=='pdfedit'&&t.type!=='qr'&&t.type!=='gif')},{name:lr(4),key:'create',items:tools.filter(t=>t.type==='qr'||t.type==='gif')}];
const formatOrder=['jpg','png','webp','svg','tiff','txt','html'];
const sorted=items=>[...items].sort((a,b)=>formatOrder.indexOf(a.output)-formatOrder.indexOf(b.output)||a.slug.localeCompare(b.slug));
const group=(title,items)=>({title,items});
categories[0].groups=[group(lr(24),categories[0].items.filter(t=>!t.output||t.output==='pdf'&&t.input==='pdf')),group(lr(25),sorted(categories[0].items.filter(t=>t.input==='pdf'&&t.output&&t.output!=='pdf'))),group(lr(26),[...categories[0].items.filter(t=>t.output==='pdf'&&t.input!=='pdf')].sort((a,b)=>formatOrder.indexOf(a.input)-formatOrder.indexOf(b.input)))];
categories[1].groups=[group(lr(27),categories[1].items.filter(t=>!t.input)),...['jpg','png','webp','heic','svg','tiff'].map((f,i)=>group(lr(28+i),sorted(categories[1].items.filter(t=>t.input===f))))].filter(g=>g.items.length);
const groupedLinks=c=>c.groups?c.groups.map(g=>'<section class="menu-section"><h3>'+g.title+'</h3><div>'+g.items.map(link).join('')+'</div></section>').join(''):c.items.map(link).join('');
const menu='<nav class="format-nav task-nav" aria-label="Main navigation">'+categories.map(c=>'<details class="format-menu"><summary>'+c.name+'</summary><div class="dropdown'+(c.groups?' grouped-menu':'')+'">'+groupedLinks(c)+'</div></details>').join('')+'</nav>';
const header='<header class="site-header">'+logo+menu+'<label class="language-control"><span class="sr-only">Language</span><select id="language" aria-label="Language"><option value="en">English</option><option value="ko">한국어</option><option value="ja">日本語</option><option value="zh-CN">简体中文</option></select></label></header>';
const footer='<footer class="site-footer"><span translate="no">Paper Switch</span><nav><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav><small><a href="/assets/licenses/index.html">Open-source notices</a></small></footer>';
const adSenseScript="<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6110796878581495\" crossorigin=\"anonymous\"></script>";
const meta=(title,description,ads=true)=>'<meta name="google-site-verification" content="JIdKokUDjFkeRxD607YfHHpJQ9nnjR4Fa37FeFeDekI"><meta name="description" content="'+escape(description)+'"><meta property="og:title" content="'+escape(title)+'"><meta property="og:description" content="'+escape(description)+'"><meta property="og:type" content="website"><link rel="stylesheet" href="/site.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml">'+(ads?adSenseScript:'');
const shell=(title,description,body,ads=true)=>'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+' | Paper Switch</title><link rel="stylesheet" href="/assets/style.css">'+meta(title,description,ads)+'</head><body>'+header+'<main><h1>'+escape(title)+'</h1><p class="intro">'+escape(description)+'</p>'+body+'</main>'+footer+'<script type="module" src="/site.js"></script></body></html>';
const quick=[['jpg-to-pdf',6,'JPG → PDF'],['pdf-to-jpg',7,'PDF → JPG'],['image-compressor',8,'KB ↓'],['merge-pdf',9,'PDF + PDF'],['heic-to-jpg',10,'HEIC → JPG'],['qr-generator',11,'QR']];
const hero='<section class="landing-hero"><div><p class="eyebrow">'+lr(5)+'</p><h1>'+lr(0)+'</h1><p class="intro">'+lr(1)+'</p><div class="hero-actions"><a class="primary-action" href="/jpg-to-pdf">'+lr(7)+'</a><a class="secondary-action" href="#all-tools">'+lr(6)+' <span aria-hidden="true">↗</span></a></div><div class="home-trust"><span>'+uxRows[4][0]+'</span><span>'+uxRows[5][0]+'</span></div></div><div class="hero-art" aria-hidden="true"><div class="art-orbit"></div><div class="file-paper paper-back"><b>JPG</b><div class="landscape"><i></i></div><span></span><span></span></div><div class="file-paper paper-front"><b>PDF</b><div class="paper-lines"></div><div class="paper-chart"><i></i><i></i><i></i><i></i></div></div><div class="art-switch">↗</div><div class="art-caption" translate="no">JPG → PDF</div></div></section>';
const quickHtml='<section class="landing-section"><div class="section-heading"><h2>'+lr(8)+'</h2><p>'+lr(9)+'</p></div><div class="quick-tools">'+quick.map(([slug,index,badge])=>'<a class="quick-card" href="/'+slug+'"><span class="quick-icon" aria-hidden="true">'+badge+'</span><h3>'+uxRows[index][0]+'</h3><span class="quick-name">'+escape(tools.find(t=>t.slug===slug).title)+'</span><span class="quick-arrow" aria-hidden="true">↗</span></a>').join('')+'</div></section>';
const browse='<section id="all-tools" class="landing-section all-tools"><div class="section-heading"><h2>'+lr(10)+'</h2><p>'+lr(11)+'</p></div>'+categories.map(c=>'<details class="tool-category"><summary><span>'+c.name+'</span><span class="category-count" aria-hidden="true">'+c.items.length+'</span></summary><div class="category-links'+(c.groups?' grouped-menu':'')+'">'+groupedLinks(c)+'</div></details>').join('')+'</section>';
const steps='<section class="landing-section steps-section"><h2>'+lr(12)+'</h2><ol>'+[13,15,17].map((n,i)=>'<li><span aria-hidden="true">0'+(i+1)+'</span><h3>'+lr(n)+'</h3><p>'+lr(n+1)+'</p></li>').join('')+'</ol></section>';
const examples='<section class="landing-section"><div class="section-heading"><h2>'+lr(19)+'</h2><p>'+lr(20)+'</p></div><div class="landing-examples">'+[['jpg-to-pdf',21,'JPG → PDF'],['image-compressor',22,'IMAGE'],['compress-pdf',23,'PDF']].map(([slug,n,badge])=>'<a href="/'+slug+'"><span class="example-type" aria-hidden="true">'+badge+'</span><h3>'+lr(n)+'</h3><span aria-hidden="true">↗</span></a>').join('')+'</div></section>';
let home=shell(landingRows[0][0],landingRows[1][0],'');home=home.replace('<body>','<body class="landing">').replace(/<main>[\s\S]*?<\/main>/,'<main>'+hero+quickHtml+browse+steps+examples+'</main>');
await writeFile(out+'/index.html',home);
for(const t of tools){
 const engine=t.type==='pdfcompress'?'pdf-compressor':t.type==='html'?'html-to-pdf':t.type==='gif'?'gif-maker':['heic','pdfedit'].includes(t.type)?'file-tools':t.type==='compressor'?'image-compressor':t.type==='convert'?'app':t.type==='qr'?'qr':'image-editor';
 let html=await readFile((['pdfcompress','html','gif','compressor','heic','pdfedit'].includes(t.type)?'web/':'extension/')+(engine==='app'?'index':engine)+'.html','utf8');
 html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escape(t.title)+' | Paper Switch</title>');
 html=html.replace('<head>','<head><base href="/assets/">').replace('</head>',meta(t.title,t.description)+'</head>');
 html=html.replace('<body>','<body class="dedicated" data-engine="'+engine+'" data-tool="'+t.slug+'"'+(t.mode?' data-tool-mode="'+t.mode+'"':'')+'>');
 html=html.replace(/<header>[\s\S]*?<\/header>/,header);
 html=html.replace(/<h1>[\s\S]*?<\/h1>/,'<h1>'+escape(t.title)+'</h1>').replace(/<p class="intro">[\s\S]*?<\/p>/,'<p class="intro">'+escape(t.description)+'</p>');
 html=html.replace('<main>','<main><nav class="breadcrumbs"><a href="/">All tools</a><span aria-hidden="true">/</span><span>'+escape(t.title)+'</span></nav>');
 if(t.slug==='qr-generator'||t.slug==='wifi-qr')html=html.replace('id="read"','id="read" hidden');
 if(t.slug==='wifi-qr'){html=html.replace('Enter a link or text to get started.','Enter a network name and password, or choose an open network.').replace('id="wifi-fields" hidden','id="wifi-fields"').replace('id="qr-text-fields"','id="qr-text-fields" hidden');}
 if(t.type==='heic'){html=html.replace('Choose PDF','Choose HEIC photos').replace('accept=".pdf"','accept=".heic,.heif" multiple').replace('id="ft-pdf"','id="ft-pdf" hidden').replace('PDF: up to 50 MB and 100 pages. Password-protected files are not supported.',t.note);}
 if(t.slug==='qr-reader')html=html.replace('id="create"','id="create" hidden');
 if(t.type==='image'){
  html=html.replace('<div class="qr-settings"><label><input id="image-remove"','<div class="qr-settings" hidden><label><input id="image-remove"');
  html=html.replace(/<p>Click the original image[\s\S]*?<\/p><p>For solid backgrounds[\s\S]*?<\/p>/,'');
 }
 const steps=t.type==='pdfcompress'?pdfCompressRows.slice(21,24).map(r=>r[0]):t.type==='html'?htmlRows.slice(23,26).map(r=>r[0]):t.type==='gif'?gifRows.slice(24,27).map(r=>r[0]):guideSteps(t)||(t.type==='compressor'?['Choose an image, set a target size and compress.']:t.type==='convert'?(t.slug==='merge-pdf'?['Arrange your PDFs, merge and download.']:['Select your '+label(t.input)+' files.','Review the options and convert.','Download your results.'])
 :t.slug==='qr-generator'?['Enter text, create a QR code and download the PNG.']:t.slug==='qr-reader'?['Choose a QR image and copy its contents.']:['Select an image, set dimensions and download the PNG.']);
 const preferred=t.type==='pdfcompress'?['merge-pdf','split-pdf','extract-pdf-pages']:t.input==='pdf'&&t.type!=='heic'?['compress-pdf','merge-pdf','extract-pdf-pages','split-pdf']:t.type==='heic'?['image-compressor','jpg-to-pdf','image-resizer']:t.type==='pdfedit'?['merge-pdf','extract-pdf-pages','split-pdf','rotate-pdf']:t.type==='qr'?['wifi-qr','qr-generator','qr-reader']:t.slug==='image-compressor'?['image-resizer','jpg-to-pdf','heic-to-jpg']:[];
 const reverse=tools.find(x=>t.input&&x.input===t.output&&x.output===t.input&&x.slug!==t.slug);
 const related=[...new Set([...preferred,...(reverse?[reverse.slug]:[]),...tools.filter(x=>t.input&&x.input===t.input).map(x=>x.slug),'image-compressor','image-resizer'])].filter(slug=>slug!==t.slug).slice(0,4).map(slug=>tools.find(t=>t.slug===slug));
 html=html.replace('</main>',practicalGuide(t.slug)+'<noscript><p>Enable JavaScript to use this tool.</p></noscript><section class="guide"><h2>How it works</h2><ol>'+steps.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ol><h2>Output and limitations</h2><p>'+escape(t.note)+'</p>'+(t.type==='convert'?'<p>Up to 20 files · 50 MB each · 100 MB total. PDF inputs: up to 100 pages per file. Password-protected PDFs are not supported.</p>':'')+'<p>Selected files are processed in your browser. Download the results before closing this page.</p></section><section class="related"><h2>Continue with a related task</h2><div>'+related.map(link).join('')+'</div></section></main>');
 html=html.replace(/<footer>[\s\S]*?<\/footer>/,footer);
 if(!html.includes('<footer'))html=html.replace('</body>',footer+'</body>');
 html=html.replace(/<script type="module" src="[^"]+"><\/script>/,'<script type="module" src="/site.js"></script>');
 await writeFile(out+'/'+t.slug+'.html',html);
}
const pages={
 about:['About Paper Switch','Simple tools for everyday files.','<p>Convert documents and images, merge PDFs, create and read QR codes, and resize images. Each tool runs in your browser.</p>'],
 contact:['Contact','Questions or feedback?','<h2>Email</h2><p><a translate="no" href="mailto:glsrhfo17@gmail.com">glsrhfo17@gmail.com</a></p><p>Include the tool name, browser and error message. Please do not send confidential files.</p>'],
 privacy:['Privacy','How files and preferences are handled.','<h2>Files and preferences</h2><p>Selected files and QR contents are not uploaded to a conversion server. Your language preference is saved in this browser and can be removed by clearing site data.</p><h2>Hosting and advertising</h2><p>Cloudflare hosts this website. Google and its partners may use cookies and process information such as IP addresses, browser details and ad interactions to deliver and measure ads, depending on your settings and applicable consent choices.</p><p><a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information</a></p><p>For privacy questions, use the contact page. Emails are handled separately by the email provider.</p><a href="/contact">Contact</a>']
};
for(const [slug,[title,description,body]] of Object.entries(pages))await writeFile(out+'/'+slug+'.html',shell(title,description,'<section class="guide info-page">'+body+'</section>'));
await writeFile(out+'/404.html',shell('Page not found','Choose a tool from the home page.','<a href="/">All tools</a>',false));
await writeFile(out+'/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#28684f"/><path d="M7 11h18l-5-5M25 21H7l5 5" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
await writeFile(out+'/_headers','/assets/*\n  X-Robots-Tag: noindex\n');
console.log('Built '+tools.length+' tools with shared navigation and four-language UI.');

await import('./build-seo.mjs');
await import('./build-source-distribution.mjs');
await import('./build-license-notices.mjs');
