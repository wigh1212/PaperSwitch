import {pdfCompressRows} from './pdf-compress-copy.mjs';
import {htmlRows} from './html-copy.mjs';
import {gifRows} from './gif-copy.mjs';
import {growthTools} from './growth-copy.mjs';
import {compressorRows} from './compressor-copy.mjs';
import {modes} from '../extension/conversions.js';
export const formats=['pdf','heic','png','svg','jpg','webp','tiff','txt','html'];
export const label=f=>f==='webp'?'WEBP':f.toUpperCase();
const unique=new Map();
for(const [mode,config] of Object.entries(modes)){
 if(config.operation)continue;
 const slug=config.input+'-to-'+config.output;
 if(unique.has(slug))continue;
 const {input,output}=config;
 let note=input==='txt'?'UTF-8 text is wrapped on A4 pages. Up to 200,000 characters and 100 pages. Tables and images are not reconstructed.'
 :input==='pdf'&&output==='txt'?'Text is saved as UTF-8. Pages without text use OCR in the selected language. Check recognition errors; original layout is not retained.'
 :input==='pdf'&&output==='svg'?'Vector shapes are retained where supported. Text may become outlines; scanned pages remain images.'
 :output==='svg'?'Images are embedded in SVG; this does not trace outlines or create editable vector shapes.'
 :input==='svg'?'External SVG images and scripts are rejected. Complex filters and unavailable fonts may render differently.'
 :output==='pdf'?'Choose separate PDFs or combine files in list order. Transparency becomes white. Image text is not converted to editable text.'
 :input==='pdf'?'Raster output uses a white background and cannot preserve selectable text or editable vectors. Choose a resolution suited to your needs.'
 :input==='tiff'||output==='tiff'?'TIFF pages are processed individually. Uncompressed TIFF output can be large.'
 :'Keep original pixel dimensions. Transparency becomes white, and animated WEBP uses its first frame. Re-encoding cannot recover lost detail.';
 unique.set(slug,{slug,mode,input,output,title:label(input)+' to '+label(output),description:'Convert '+label(input)+' files to '+label(output)+' in your browser.',note,type:'convert'});
}
export const tools=[{slug:"compress-pdf",type:"pdfcompress",input:"pdf",title:pdfCompressRows[3][0],description:pdfCompressRows[1][0],note:pdfCompressRows[2][0]},{slug:"html-to-pdf",input:"html",output:"pdf",type:"html",title:"HTML to PDF",description:htmlRows[1][0],note:htmlRows[2][0]},{slug:"gif-maker",type:"gif",title:gifRows[3][0],description:gifRows[1][0],note:gifRows[2][0]},...growthTools,{slug:"image-compressor",type:"compressor",title:compressorRows[0][0],description:compressorRows[1][0],note:compressorRows[2][0]},...unique.values(),{slug:'merge-pdf',mode:'pdf-merge',input:'pdf',output:'pdf',type:'convert',title:'Merge PDF',description:'Combine PDF documents in your chosen order.',note:'All pages are merged. Bookmarks and digital signatures are not preserved.'},
{slug:'qr-generator',type:'qr',title:'QR Code Generator',description:'Create a QR code from text or a link.',note:'Up to 1,000 UTF-8 bytes. Test the downloaded QR code before printing.'},
{slug:'qr-reader',type:'qr',title:'QR Code Reader',description:'Read a QR code from an image.',note:'PNG, JPG or WEBP up to 10 MB. One QR per image; extracted links are not opened automatically.'},
{slug:'image-resizer',type:'image',title:'Image Resizer',description:'Set image width and height in pixels.',note:'Keep aspect ratio enabled to avoid stretching. Enlarging an image does not recover lost detail.'}];
