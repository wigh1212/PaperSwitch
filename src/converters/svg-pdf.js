import {jsPDF} from 'jspdf';
import 'svg2pdf.js/dist/svg2pdf.es.js';
import {registerKoreanFont} from './fonts.js';
import {resolveSVGStyles} from '../../extension/conversion/svg-styles.js';
export async function svgToPDF(svg) {
  const unit = value => {
    const m=(value || '').trim().match(/^(\d*\.?\d+)\s*(px|pt|mm|cm|in)?$/i);
    if(!m)return null;
    return Number(m[1])*({px:1,pt:96/72,mm:96/25.4,cm:96/2.54,in:96}[m[2]?.toLowerCase()||'px']);
  };
  const view=(svg.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);
  const ratio=view.length===4 && view[2]>0 && view[3]>0 ? view[2]/view[3] : null;
  let w=unit(svg.getAttribute('width')),h=unit(svg.getAttribute('height'));
  if(!w && h && ratio) w=h*ratio;
  if(!h && w && ratio) h=w/ratio;
  w=w|| (ratio?view[2]:300); h=h || (ratio?view[3]:150);
  if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0||w>19000||h>19000)throw new Error('SVG 크기가 지원 범위를 벗어납니다.');
  const pdf=new jsPDF({orientation:w>h?'landscape':'portrait',unit:'pt',format:[w*.75,h*.75],compress:true,putOnlyUsedFonts:true});
  await registerKoreanFont(pdf,svg);
  const normalized=resolveSVGStyles(svg,w,h);
  await pdf.svg(normalized,{x:0,y:0,width:w*.75,height:h*.75});
  return new Uint8Array(pdf.output('arraybuffer'));
}
