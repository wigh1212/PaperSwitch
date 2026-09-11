export async function mergeDocuments(files,{signal,onProgress}={}){
  const inputs=[];
  for(const file of files){signal?.throwIfAborted();inputs.push(await file.arrayBuffer());}
  signal?.throwIfAborted();
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('../merge-worker.js',import.meta.url),{type:'module'});
    const finish=(error,result)=>{worker.terminate();signal?.removeEventListener('abort',cancel);error?reject(error):resolve(result);};
    const cancel=()=>finish(new DOMException('Cancelled','AbortError'));
    signal?.addEventListener('abort',cancel,{once:true});
    worker.onerror=()=>finish(new Error('Could not start the conversion engine. Reload and try again.'));
    worker.onmessage=({data})=>{
      if(data.type==='ready')worker.postMessage({inputs},inputs);
      if(data.type==='progress')onProgress?.(data.index);
      if(data.type==='done')finish(null,data.entries);
      if(data.type==='error')finish(new Error(data.message));
    };
  });
}
