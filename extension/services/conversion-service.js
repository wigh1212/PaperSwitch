import {validateSVG} from '../validate-svg.js';
import {svgToImage,imageToSVG} from '../svg-image.js';
import {baseName} from '../core.js';
import {convertDocument} from './pdf-worker-client.js';
import {mergeDocuments} from './merge-service.js';
import {convertRaster} from '../conversion/raster.js';

// The UI depends on this interface only. A future remote provider can implement
// the same convert() contract without importing DOM controls or payment code.
export const localConversionService={
  merge:mergeDocuments,
  async convert(file,config,options,{signal,onProgress}={}){
    signal?.throwIfAborted();const bytes=await file.arrayBuffer();signal?.throwIfAborted();
    if(['pdf','tiff'].includes(config.input))return convertDocument(bytes,file,config,options,signal,onProgress);
    let result;
    if(config.output==='svg')result=await imageToSVG(bytes,config.input);
    else if(config.input==='svg'){
      const svg=validateSVG(bytes);
      result=config.output==='pdf'?await (await import('../vendor/svg-to-pdf.js')).svgToPDF(svg):await svgToImage(svg,config.output,options.scale);
    }else if(config.input==='txt')result=await (await import('../vendor/svg-to-pdf.js')).txtToPDF(bytes);
    else if(config.output==='pdf')result=await (await import('../vendor/svg-to-pdf.js')).webpToPDF(bytes,config.input);
    else result=await convertRaster(bytes,config.input,config.output);
    signal?.throwIfAborted();return {[`${baseName(file.name)}.${config.output}`]:result};
  }
};
