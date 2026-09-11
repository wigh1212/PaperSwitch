let nanumFont;
export async function registerKoreanFont(pdf, svg) {
  if(!svg.querySelector('text'))return;
  if(!nanumFont) nanumFont=(async()=>{
    const response=await fetch(new URL('../fonts/NanumMyeongjo-Bold.ttf',import.meta.url));
    if(!response.ok)throw new Error('한글 폰트를 불러오지 못했습니다. 확장 프로그램을 새로고침해 주세요.');
    const bytes=await response.arrayBuffer();
    const face=new FontFace('NanumMyeongjoBold',bytes);
    await face.load();document.fonts.add(face);
    let binary='';const array=new Uint8Array(bytes);
    for(let i=0;i<array.length;i+=8192)binary+=String.fromCharCode(...array.subarray(i,i+8192));
    return btoa(binary);
  })().catch(error=>{nanumFont=null;throw error;});
  pdf.addFileToVFS('NanumMyeongjo-Bold.ttf',await nanumFont);
  pdf.addFont('NanumMyeongjo-Bold.ttf','NanumMyeongjoBold','normal');
  pdf.addFont('NanumMyeongjo-Bold.ttf','NanumMyeongjoBold','bold');
}
