import mupdf from '../vendor/mupdf/mupdf.js';

// Copy page objects directly so text, vectors and page dimensions survive.
export function mergePDFs(inputs,onProgress=()=>{}){
  const output=new mupdf.PDFDocument();
  try{
    for(let index=0;index<inputs.length;index++){
      let source;
      try{
        source=mupdf.Document.openDocument(inputs[index],'application/pdf');
        if(source.needsPassword())throw new Error('Password-protected PDFs cannot be merged.');
        const count=source.countPages();
        if(!count||count>100)throw new Error('Each PDF must contain 1 to 100 pages.');
        for(let page=0;page<count;page++)output.graftPage(-1,source,page);
        onProgress(index);
      }finally{source?.destroy();}
    }
    const buffer=output.saveToBuffer('compress');
    try{
      if(buffer.asUint8Array().byteLength>150*1048576)throw new Error('Total output exceeds 150 MB. Convert fewer files at a time.');
      return new Uint8Array(buffer.asUint8Array());
    }finally{buffer.destroy();}
  }finally{output.destroy();}
}
