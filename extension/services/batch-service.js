import {MAX_BYTES} from '../core.js';
export const limits=Object.freeze({files:20,inputBytes:100*1048576,outputBytes:150*1048576});
export function validateBatch(files){
  if(files.length>limits.files)throw new Error('Select up to 20 files at a time.');
  if(files.reduce((sum,file)=>sum+file.size,0)>limits.inputBytes)throw new Error('Selected files must total 100 MB or less.');
}
function validateFile(file,config){
  const extension=config.input==='jpg'?/\.jpe?g$/i:config.input==='tiff'?/\.tiff?$/i:new RegExp(`\\.${config.input}$`,'i');
  if(!extension.test(file.name))throw new Error(`This is not a ${config.input.toUpperCase()} file.`);
  if(!file.size||file.size>MAX_BYTES)throw new Error('Only nonempty files up to 50 MB are supported.');
}
export async function runBatch({files,config,options,service,access,signal,onEvent=()=>{}}){
  validateBatch(files);signal?.throwIfAborted();
  // Entitlement validation lives at this boundary. Production authorization
  // must be enforced by the server, never by this local client hook alone.
  await access.authorize({conversion:config,files:files.map(({name,size})=>({name,size}))},signal);
  if(config.operation==='merge'){
    if(files.length<2)throw new Error('Select at least two PDFs to merge.');
    files.forEach(file=>validateFile(file,config));
    files.forEach((file,index)=>onEvent({type:'start',index,name:file.name}));
    let entries;
    try{entries=await service.merge(files,{signal,onProgress:index=>onEvent({type:'progress',index,current:1,total:1})});}
    catch(error){
      if(!signal?.aborted)files.forEach((file,index)=>onEvent({type:'error',index,message:error.message}));
      throw error;
    }
    signal?.throwIfAborted();
    files.forEach((file,index)=>onEvent({type:'done',index,count:1}));
    return {entries,success:files.length,failed:0};
  }
  const entries=Object.create(null);let success=0,failed=0,total=0;
  for(let index=0;index<files.length;index++){
    signal?.throwIfAborted();const file=files[index];onEvent({type:'start',index,name:file.name});
    try{
      validateFile(file,config);
      const output=await service.convert(file,config,options,{signal,onProgress:progress=>onEvent({type:'progress',index,...progress})});
      signal?.throwIfAborted();
      const size=Object.values(output).reduce((sum,bytes)=>sum+bytes.byteLength,0);
      if(total+size>limits.outputBytes)throw new Error('Total output exceeds 150 MB. Convert fewer files at a time.');
      total+=size;
      for(const [name,bytes] of Object.entries(output))entries[files.length>1?`${String(index+1).padStart(2,'0')}-${name}`:name]=bytes;
      success++;onEvent({type:'done',index,count:Object.keys(output).length});
    }catch(error){
      if(signal?.aborted||error.name==='AbortError')throw error;
      failed++;onEvent({type:'error',index,message:error.message});
    }
  }
  if(config.output==='pdf'&&options?.pdfOutput==='combined'){
    // Never silently omit failed inputs from a combined document.
    if(failed)throw new Error('Some files failed. Fix them and try again to create one complete PDF.');
    signal?.throwIfAborted();
    if(Object.keys(entries).length>1){
      onEvent({type:'merging'});
      const parts=Object.entries(entries).map(([name,bytes])=>({name,arrayBuffer:async()=>bytes.slice().buffer}));
      const combined=await service.merge(parts,{signal});
      signal?.throwIfAborted();
      return {entries:combined,success,failed};
    }
  }
  return {entries,success,failed};
}
