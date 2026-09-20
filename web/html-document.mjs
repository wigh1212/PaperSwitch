import {parse,serialize} from 'parse5';
const allowed=new Set('html head body title style div span p h1 h2 h3 h4 h5 h6 br hr strong b em i u s small sub sup blockquote pre code ul ol li dl dt dd table caption colgroup col thead tbody tfoot tr th td img a section article header footer main aside figure figcaption address time'.split(' '));
const attrs=new Set('class id style title alt width height colspan rowspan scope lang dir start reversed type'.split(' '));
export function createPrintDocument(source,{size='A4',orientation='portrait',margin='15'}={}){
 if(!source.trim()||new TextEncoder().encode(source).length>2*1024*1024)throw Error('size');
 const doc=parse(source);function clean(node){node.childNodes=(node.childNodes||[]).filter(n=>n.nodeName==='#text'||n.nodeName==='#documentType'||allowed.has(n.tagName));for(const n of node.childNodes){if(n.attrs)n.attrs=n.attrs.filter(a=>attrs.has(a.name)||(n.tagName==='img'&&a.name==='src'&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(a.value)));clean(n);}}
 clean(doc);const html=doc.childNodes.find(n=>n.tagName==='html'),head=html.childNodes.find(n=>n.tagName==='head');
 const paper=size==='Letter'?'Letter':'A4',dir=orientation==='landscape'?'landscape':'portrait',gap=['0','10','15'].includes(String(margin))?margin:'15';
 const security='<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src data:; font-src data:; base-uri &#39;none&#39;; form-action &#39;none&#39;">';
 const styles='<style>html{color:#111;background:white}body{font-family:Arial,sans-serif;line-height:1.5;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{border-collapse:collapse}th,td{padding:6px}a{pointer-events:none}@page{size:'+paper+' '+dir+';margin:'+gap+'mm}@media screen{body{padding:'+gap+'mm;margin:0}}@media print{body{margin:0}thead{display:table-header-group}tr,img{break-inside:avoid}}</style>';
 const output=serialize(doc);return output.replace('<head>','<head>'+security).replace('</head>',styles+'</head>');
}
