import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {tools,formats,label} from '../web/tools.mjs';
const out='dist',escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await mkdir(out,{recursive:true});
await cp('web/ads.txt',out+'/ads.txt');
await cp('extension',out+'/assets',{recursive:true,filter:path=>!path.endsWith('manifest.json')&&!path.endsWith('background.js')});
for(const file of ['site.css','site.js','copy.mjs'])await cp('web/'+file,out+'/'+(file==='copy.mjs'?'copy.js':file));
const menuLabel=t=>t.slug.includes('-to-')?label(t.input)+' → '+label(t.output):escape(t.title);
const link=t=>'<a href="/'+t.slug+'">'+menuLabel(t)+'</a>';
const logo='<a class="brand" href="/" translate="no" aria-label="Paper Switch"><img src="/favicon.svg" width="34" height="34" alt=""><span>Paper Switch</span></a>';
const menu='<nav class="format-nav" aria-label="Main navigation">'+formats.map(f=>'<details class="format-menu"><summary>'+label(f)+'</summary><div class="dropdown">'+tools.filter(t=>t.input===f).map(link).join('')+'</div></details>').join('')+'<details class="format-menu"><summary>Tools</summary><div class="dropdown">'+tools.filter(t=>t.type!=='convert').map(link).join('')+'</div></details></nav>';
const header='<header class="site-header">'+logo+menu+'<label class="language-control"><span class="sr-only">Language</span><select id="language" aria-label="Language"><option value="en">English</option><option value="ko">한국어</option><option value="ja">日本語</option><option value="zh-CN">简体中文</option></select></label></header>';
const footer='<footer class="site-footer"><span translate="no">Paper Switch</span><nav><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav><small translate="no">MuPDF · AGPL-3.0-or-later</small></footer>';
const adSenseScript="<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6110796878581495\" crossorigin=\"anonymous\"></script>";
const meta=(title,description,ads=true)=>'<meta name="description" content="'+escape(description)+'"><meta property="og:title" content="'+escape(title)+'"><meta property="og:description" content="'+escape(description)+'"><meta property="og:type" content="website"><link rel="stylesheet" href="/site.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml">'+(ads?adSenseScript:'');
const shell=(title,description,body,ads=true)=>'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+' | Paper Switch</title><link rel="stylesheet" href="/assets/style.css">'+meta(title,description,ads)+'</head><body>'+header+'<main><h1>'+escape(title)+'</h1><p class="intro">'+escape(description)+'</p>'+body+'</main>'+footer+'<script type="module" src="/site.js"></script></body></html>';
const tabs='<div class="format-tabs" role="tablist" aria-label="Source format">'+formats.map((f,i)=>'<button type="button" role="tab" id="choose-'+f+'" aria-controls="group-'+f+'" aria-selected="'+!i+'" tabindex="'+(i?-1:0)+'" data-source="'+f+'">'+label(f)+'</button>').join('')+'</div>';
const groups=formats.map((f,i)=>'<section class="format-group" id="group-'+f+'" role="tabpanel" aria-labelledby="choose-'+f+'"'+(i?' hidden':'')+'><h2>Convert from '+label(f)+'</h2><div class="conversion-list">'+tools.filter(t=>t.input===f).map(t=>'<a class="conversion-link" href="/'+t.slug+'"><span>'+menuLabel(t)+'</span><span aria-hidden="true">↗</span></a>').join('')+'</div></section>').join('');
const utilities='<section class="utilities-strip"><h2>More tools</h2><div>'+tools.filter(t=>t.type!=='convert').map(link).join('')+'</div></section>';
await writeFile(out+'/index.html',shell('Convert a file. Keep creating.','Choose your file format to get started.','<section class="tool-picker">'+tabs+groups+'</section>'+utilities+'<p class="privacy-line">No uploads. No account needed.</p>'));
for(const t of tools){
 const engine=t.type==='convert'?'app':t.type==='qr'?'qr':'image-editor';
 let html=await readFile('extension/'+(engine==='app'?'index':engine)+'.html','utf8');
 html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escape(t.title)+' | Paper Switch</title>');
 html=html.replace('<head>','<head><base href="/assets/">').replace('</head>',meta(t.title,t.description)+'</head>');
 html=html.replace('<body>','<body class="dedicated" data-engine="'+engine+'" data-tool="'+t.slug+'"'+(t.mode?' data-tool-mode="'+t.mode+'"':'')+'>');
 html=html.replace(/<header>[\s\S]*?<\/header>/,header);
 html=html.replace(/<h1>[\s\S]*?<\/h1>/,'<h1>'+escape(t.title)+'</h1>').replace(/<p class="intro">[\s\S]*?<\/p>/,'<p class="intro">'+escape(t.description)+'</p>');
 html=html.replace('<main>','<main><nav class="breadcrumbs"><a href="/">All tools</a><span aria-hidden="true">/</span><span>'+escape(t.title)+'</span></nav>');
 if(t.slug==='qr-generator')html=html.replace('id="read"','id="read" hidden');
 if(t.slug==='qr-reader')html=html.replace('id="create"','id="create" hidden');
 if(t.type==='image'){
  html=html.replace('<div class="qr-settings"><label><input id="image-remove"','<div class="qr-settings" hidden><label><input id="image-remove"');
  html=html.replace(/<p>Click the original image[\s\S]*?<\/p><p>For solid backgrounds[\s\S]*?<\/p>/,'');
 }
 const steps=t.type==='convert'?(t.slug==='merge-pdf'?['Arrange your PDFs, merge and download.']:['Select your '+label(t.input)+' files.','Review the options and convert.','Download your results.'])
 :t.slug==='qr-generator'?['Enter text, create a QR code and download the PNG.']:t.slug==='qr-reader'?['Choose a QR image and copy its contents.']:['Select an image, set dimensions and download the PNG.'];
 const related=tools.filter(x=>x.slug!==t.slug&&(t.type==='convert'?(x.input===t.input||(x.input===t.output&&x.output===t.input)||x.slug==='pdf-to-txt'):x.type!=='convert')).slice(0,4);
 html=html.replace('</main>','<noscript><p>Enable JavaScript to use this tool.</p></noscript><section class="guide"><h2>How it works</h2><ol>'+steps.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ol><h2>Output and limitations</h2><p>'+escape(t.note)+'</p>'+(t.type==='convert'?'<p>Up to 20 files · 50 MB each · 100 MB total. PDF inputs: up to 100 pages per file. Password-protected PDFs are not supported.</p>':'')+'<p>Selected files are processed in your browser. Download the results before closing this page.</p></section><section class="related"><h2>Related tools</h2><div>'+related.map(link).join('')+'</div></section></main>');
 html=html.replace(/<footer>[\s\S]*?<\/footer>/,footer);
 if(!html.includes('<footer'))html=html.replace('</body>',footer+'</body>');
 html=html.replace(/<script type="module" src="[^"]+"><\/script>/,'<script type="module" src="/site.js"></script>');
 await writeFile(out+'/'+t.slug+'.html',html);
}
const pages={
 about:['About Paper Switch','Simple tools for everyday files.','<p>Convert documents and images, merge PDFs, create and read QR codes, and resize images. Each tool runs in your browser.</p>'],
 contact:['Contact','Questions or feedback?','<h2>Email</h2><p><a translate="no" href="mailto:glsrhfo17@gmail.com">glsrhfo17@gmail.com</a></p><p>Include the tool name, browser and error message. Please do not send confidential files.</p>'],
 privacy:['Privacy','How files and preferences are handled.','<h2>Files and preferences</h2><p>Selected files and QR contents are not uploaded to a conversion server. Your language preference is saved in this browser and can be removed by clearing site data.</p><h2>Hosting and advertising</h2><p>Cloudflare hosts this website. Google AdSense is integrated to display advertising. Google and its partners may use cookies and process information such as IP addresses, browser details and ad interactions to deliver and measure ads, depending on your settings and applicable consent choices.</p><p><a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information</a></p><p>For privacy questions, use the contact page. Emails are handled separately by the email provider.</p><a href="/contact">Contact</a>']
};
for(const [slug,[title,description,body]] of Object.entries(pages))await writeFile(out+'/'+slug+'.html',shell(title,description,'<section class="guide info-page">'+body+'</section>'));
await writeFile(out+'/404.html',shell('Page not found','Choose a tool from the home page.','<a href="/">All tools</a>',false));
await writeFile(out+'/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#28684f"/><path d="M7 11h18l-5-5M25 21H7l5 5" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
await writeFile(out+'/_headers','/assets/*\n  X-Robots-Tag: noindex\n');
console.log('Built '+tools.length+' tools with shared navigation and four-language UI.');

await import('./build-seo.mjs');
