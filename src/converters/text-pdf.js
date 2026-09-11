import {jsPDF} from 'jspdf';
import {registerKoreanFont} from './fonts.js';
export async function txtToPDF(bytes) {
  let text;
  try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new Error('TXT는 UTF-8 인코딩으로 저장한 뒤 선택해 주세요.');}
  if(!text.trim())throw new Error('내용이 없는 TXT입니다.');
  if(text.length>200000)throw new Error('TXT는 20만 글자까지 지원합니다. 파일을 나누어 주세요.');
  const pdf=new jsPDF({unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});
  await registerKoreanFont(pdf,{querySelector:()=>true});pdf.setFont('NanumMyeongjoBold','normal');pdf.setFontSize(11);
  let y=45,pages=1;
  const newPage=()=>{if(++pages>100)throw new Error('TXT 결과는 최대 100페이지까지 지원합니다.');pdf.addPage();y=45;};
  for(const paragraph of text.replace(/\r\n?/g,'\n').replace(/\t/g,'    ').split('\n')) {
    if(paragraph==='\f'){newPage();continue;}
    const lines=pdf.splitTextToSize(paragraph,505);
    for(const line of lines.length?lines:['']){if(y>797)newPage();pdf.text(line,45,y);y+=17;}
  }
  return new Uint8Array(pdf.output('arraybuffer'));
}
