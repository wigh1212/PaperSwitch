import {zipSync} from '../vendor/fflate.js';
const mimeTypes={pdf:'application/pdf',svg:'image/svg+xml',webp:'image/webp',jpg:'image/jpeg',png:'image/png',txt:'text/plain;charset=utf-8',tiff:'image/tiff'};
export class DownloadService {
  #urls=[];
  clear(){this.#urls.forEach(url=>URL.revokeObjectURL(url));this.#urls=[];}
  #file(bytes,name,mime){const url=URL.createObjectURL(new Blob([bytes],{type:mime}));this.#urls.push(url);return {name,url,size:bytes.byteLength};}
  prepare(entries,format){
    const names=Object.keys(entries);if(!names.length)return null;
    const files=names.map(name=>this.#file(entries[name],name,mimeTypes[format]));
    const main=names.length===1?files[0]:this.#file(zipSync(entries,{level:0}),`paper-switch-${format}.zip`,'application/zip');
    return {files,main};
  }
}
