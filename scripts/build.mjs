import { mkdir, copyFile, readFile, readdir } from 'node:fs/promises';
import {build} from 'esbuild';
import './check-dependencies.mjs';
await mkdir('extension/vendor/mupdf', {recursive:true});
for(const name of ['mupdf.js','mupdf-wasm.js','mupdf-wasm.wasm']) await copyFile(`node_modules/mupdf/dist/${name}`,`extension/vendor/mupdf/${name}`);
await copyFile('node_modules/fflate/esm/browser.js','extension/vendor/fflate.js');
await copyFile('node_modules/fflate/LICENSE','extension/vendor/fflate-LICENSE');
for(const name of ['mupdf','jspdf','svg2pdf.js']) await copyFile(`node_modules/${name}/LICENSE`,`extension/vendor/${name}-LICENSE`);
await build({entryPoints:['src/pdf-converters.js'],outfile:'extension/vendor/svg-to-pdf.js',bundle:true,format:'esm',platform:'browser',legalComments:'eof',plugins:[{
  name:'svg-styles-without-inline-injection',
  setup(build) {
    build.onLoad({filter:/svg2pdf\.es\.js$/},async({path})=>{
      const source=await readFile(path,'utf8');
      // Parse local SVG CSS as data. Upstream inserts a <style> in an HTML
      // document, which extension CSP blocks and silently turns fills black.
      const original=/var style = styleDoc\.createElement\('style'\);\s*style\.textContent = sheetText;\s*styleDoc\.body\.appendChild\(style\);\s*var sheet = style\.sheet;/g;
      if([...source.matchAll(original)].length!==1)throw new Error('svg2pdf CSS parser changed; review the CSP compatibility patch.');
      return {contents:source.replace(original,'var sheet = new CSSStyleSheet(); sheet.replaceSync(sheetText);'),loader:'js'};
    });
  }
}]});
console.log('Ready: load the extension folder in Chrome.');
await mkdir('extension/vendor/ocr/core',{recursive:true});
for(const name of ['tesseract.esm.min.js','worker.min.js','worker.min.js.LICENSE.txt','tesseract.min.js.LICENSE.txt'])await copyFile(`node_modules/tesseract.js/dist/${name}`,`extension/vendor/ocr/${name}`);
await copyFile('node_modules/tesseract.js/LICENSE.md','extension/vendor/ocr/LICENSE');
for(const name of await readdir('node_modules/tesseract.js-core'))if(name.endsWith('.wasm')||name.endsWith('.wasm.js')||name==='LICENSE')await copyFile(`node_modules/tesseract.js-core/${name}`,`extension/vendor/ocr/core/${name}`);


await build({entryPoints:['src/qr-vendor.js'],outfile:'extension/vendor/qr.js',bundle:true,format:'esm',platform:'browser',minify:true});
for(const name of ['qrcode','jsqr'])await copyFile('node_modules/'+name+'/LICENSE','extension/vendor/'+name+'-LICENSE');
