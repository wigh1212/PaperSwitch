export function validateSVG(bytes) {
  const source = new TextDecoder().decode(bytes);
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('DOCTYPE 또는 외부 엔티티가 포함된 SVG는 지원하지 않습니다.');
  const doc = new DOMParser().parseFromString(source,'image/svg+xml');
  if(doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') throw new Error('올바른 SVG 파일이 아닙니다.');
  for(const el of doc.querySelectorAll('*')) {
    if(['script','foreignobject'].includes(el.localName.toLowerCase())) throw new Error('스크립트나 HTML이 포함된 SVG는 지원하지 않습니다.');
    for(const attr of el.attributes) {
      if(/^on/i.test(attr.name)) throw new Error('이벤트 스크립트가 포함된 SVG는 지원하지 않습니다.');
      if(attr.localName==='href' && !/^(#|data:image\/(png|jpeg|webp);base64,)/i.test(attr.value.trim())) throw new Error('외부 파일 참조를 SVG 안에 포함한 뒤 다시 선택해 주세요.');
    }
  }
  if(/@import/i.test(source)) throw new Error('외부 CSS는 지원하지 않습니다.');
  for(const match of source.matchAll(/url\(([^)]*)\)/gi)) {
    if(!match[1].trim().replace(/^['"]|['"]$/g,'').startsWith('#')) throw new Error('외부 리소스 또는 CSS 이미지 참조가 있는 SVG는 지원하지 않습니다.');
  }
  return doc.documentElement;
}

