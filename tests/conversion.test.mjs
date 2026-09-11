import test from 'node:test';
import assert from 'node:assert/strict';
import mupdf from '../extension/vendor/mupdf/mupdf.js';
import {jsPDF} from 'jspdf';
import {parsePages, renderPage, baseName} from '../extension/core.js';
import {zipSync, unzipSync} from '../extension/vendor/fflate.js';
test('page selection handles ordering, duplicates, invalid and excessive ranges',()=>{
  assert.deepEqual(parsePages('3, 1-2, 2',3),[0,1,2]);
  assert.deepEqual(parsePages('',2),[0,1]);
  for(const s of ['0','4','3-1','x','1,','1-1000']) assert.throws(()=>parsePages(s,3));
  assert.throws(()=>parsePages('',101));
  assert.equal(baseName('../test.pdf'),'.._test');
});
test('PDF to SVG retains vector shapes and a valid archive',()=>{
  const fixture=new jsPDF({unit:'pt',format:[320,180],orientation:'landscape'});
  fixture.setFillColor('#28684f');fixture.rect(10,10,200,100,'F');
  const source=mupdf.Document.openDocument(fixture.output('arraybuffer'),'application/pdf');
  const page=source.loadPage(0);
  const pdfBytes=renderPage(mupdf,page,'pdf');
  assert.equal(new TextDecoder().decode(pdfBytes.slice(0,5)),'%PDF-');
  const pdf=mupdf.Document.openDocument(pdfBytes,'application/pdf');
  assert.equal(pdf.countPages(),1);
  const converted=pdf.loadPage(0);
  assert.deepEqual(converted.getBounds(),page.getBounds());
  const svgBytes=renderPage(mupdf,converted,'svg');
  const result=new TextDecoder().decode(svgBytes);
  assert.match(result,/<svg/);assert.match(result,/<path/);assert.doesNotMatch(result,/<image/);
  const a=page.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);
  const b=converted.toPixmap(mupdf.Matrix.identity,mupdf.ColorSpace.DeviceRGB,false,true);
  assert.deepEqual(a.getPixels(),b.getPixels());
  const packed=zipSync({'page-1.svg':svgBytes,'page-2.svg':svgBytes});
  assert.equal(Object.keys(unzipSync(packed)).length,2);
  a.destroy();b.destroy();converted.destroy();pdf.destroy();page.destroy();source.destroy();
});
test('broken document fails without a successful output',()=>{
  assert.throws(()=>mupdf.Document.openDocument(new TextEncoder().encode('broken'),'application/pdf'));
});

