export const MAX_BYTES = 50 * 1024 * 1024;
export function parsePages(value, count) {
  if (!value.trim()) {
    if (count > 100) throw new Error('100페이지까지 선택할 수 있어요. 페이지 범위를 입력해 주세요.');
    return Array.from({length:count}, (_, i) => i);
  }
  const chosen = new Set();
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('페이지는 1, 3-5처럼 입력해 주세요.');
    const start = Number(match[1]), end = Number(match[2] || match[1]);
    if (start < 1 || end < start || end > count) throw new Error(`페이지 범위는 1~${count} 안에서 입력해 주세요.`);
    if (end - start >= 100) throw new Error('한 번에 100페이지까지 변환할 수 있어요.');
    for (let p=start; p<=end; p++) chosen.add(p-1);
    if (chosen.size > 100) throw new Error('한 번에 100페이지까지 변환할 수 있어요.');
  }
  return [...chosen].sort((a,b) => a-b);
}
export function baseName(name) { return name.replace(/\.[^.]+$/, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0,120) || 'converted'; }
export function renderPage(mupdf, page, format) {
  let buffer, writer, device;
  try {
    buffer = new mupdf.Buffer();
    writer = new mupdf.DocumentWriter(buffer, format, format === 'svg' ? 'text=path' : '');
    device = writer.beginPage(page.getBounds());
    page.run(device, mupdf.Matrix.identity);
    device.close();
    writer.endPage();
    writer.close();
    return new Uint8Array(buffer.asUint8Array());
  } finally { device?.destroy(); writer?.destroy(); buffer?.destroy(); }
}
