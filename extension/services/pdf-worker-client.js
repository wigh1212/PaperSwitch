import {resolveOCRLanguage} from '../ocr-languages.js';
export function convertDocument(bytes,file,config,options,signal,onProgress){
  return new Promise((resolve,reject)=>{
    let ocr=null,settled=false;
    const worker=new Worker(new URL('../worker.js',import.meta.url),{type:'module'});
    const finish=(error,result)=>{
      if(settled)return;settled=true;worker.terminate();ocr?.terminate();ocr=null;
      signal?.removeEventListener('abort',cancel);error?reject(error):resolve(result);
    };
    const cancel=()=>finish(new DOMException('Cancelled','AbortError'));
    if(signal?.aborted){cancel();return;}signal?.addEventListener('abort',cancel,{once:true});
    worker.onerror=()=>finish(new Error('Could not start the conversion engine. Reload and try again.'));
    worker.onmessage=async({data})=>{
      if(settled)return;
      if(data.type==='ready')worker.postMessage({bytes,name:file.name,format:config.output,input:config.input,...options},[bytes]);
      if(data.type==='progress')onProgress?.({kind:'pages',current:data.current,total:data.total});
      if(data.type==='error')finish(new Error(data.message));
      if(data.type==='done')finish(null,data.entries);
      if(data.type==='ocr'){
        try{
          onProgress?.({kind:'ocr',page:data.page,progress:0});
          if(!ocr){
            const {default:Tesseract}=await import('../vendor/ocr/tesseract.esm.min.js');
            if(settled)return;
            const ready=await Tesseract.createWorker(resolveOCRLanguage(options.ocrLanguage),1,{
              workerPath:new URL('../vendor/ocr/worker.min.js',import.meta.url).href,
              corePath:new URL('../vendor/ocr/core',import.meta.url).href,
              langPath:new URL('../vendor/ocr/lang',import.meta.url).href,
              workerBlobURL:false,gzip:false,cacheMethod:'none',
              logger:message=>{if(!settled)onProgress?.({kind:'ocr',page:data.page,progress:message.progress||0});}
            });
            if(settled){await ready.terminate();return;}ocr=ready;
            await ocr.setParameters({tessedit_pageseg_mode:'6'});
          }
          const result=await ocr.recognize(data.image);
          if(!settled)worker.postMessage({type:'ocr-result',text:result.data.text});
        }catch(error){if(!settled)finish(new Error(`OCR failed: ${error.message}`));}
      }
    };
  });
}
