export function compressPDF(mupdf,input){
 const bytes=new Uint8Array(input);if(!bytes.length||bytes.length>50*1048576)throw Error('limit');
 let doc,check,buffer;
 try{doc=mupdf.Document.openDocument(bytes,'application/pdf');
 if(doc.needsPassword()||!doc.getTrailer().get('Encrypt').isNull())throw Error('protected');
 const pages=doc.countPages();if(pages<1||pages>100||doc.countObjects()>100000)throw Error('limit');if(doc.wasRepaired())throw Error('invalid');
 for(let i=1;i<doc.countObjects();i++){const obj=doc.newIndirect(i);try{if(obj.get('FT').asName()==='Sig'||obj.get('Type').asName()==='Sig'||!obj.get('ByteRange').isNull())throw Error('signed');}finally{obj.destroy();}}
 // Lossless stream compression only: never render pages into images or resample pixels.
 buffer=doc.saveToBuffer('garbage=deduplicate,compress=yes,compress-images=yes,compress-fonts=yes');
 const candidate=new Uint8Array(buffer.asUint8Array());check=mupdf.Document.openDocument(candidate,'application/pdf');
 if(check.wasRepaired()||check.countPages()!==pages)throw Error('invalid');
 for(let i=0;i<pages;i++){const a=doc.loadPage(i),b=check.loadPage(i);let at,bt;try{if(JSON.stringify(a.getBounds())!==JSON.stringify(b.getBounds()))throw Error('invalid');at=a.toStructuredText();bt=b.toStructuredText();if(at.asText()!==bt.asText())throw Error('invalid');}finally{at?.destroy();bt?.destroy();a.destroy();b.destroy();}}
 const smaller=candidate.length<bytes.length;return {bytes:smaller?candidate:bytes,smaller,pages,originalSize:bytes.length};
 }finally{check?.destroy();buffer?.destroy();doc?.destroy();}
}
