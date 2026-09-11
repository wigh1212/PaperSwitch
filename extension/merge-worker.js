import {mergePDFs} from './conversion/merge-pdf.js';
self.onmessage=({data})=>{
  try{
    const bytes=mergePDFs(data.inputs,index=>self.postMessage({type:'progress',index}));
    self.postMessage({type:'done',entries:{'merged.pdf':bytes}},[bytes.buffer]);
  }catch(error){self.postMessage({type:'error',message:error.message});}
};
self.postMessage({type:'ready'});
