import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  let file=resolve(root,'.'+decodeURIComponent(path));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  if(path==='/')file=resolve(root,'index.html');
  else if(!extname(file))file+='.html';
  const bytes=await readFile(file);
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.wasm':'application/wasm','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');
  res.end(bytes);
 }catch{res.writeHead(404);res.end(await readFile(resolve(root,'404.html')));}
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'));

