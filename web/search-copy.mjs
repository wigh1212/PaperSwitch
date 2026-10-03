import {editorialCopy} from './editorial-copy.mjs';
import {pdfCompressRows} from './pdf-compress-copy.mjs';
import {htmlRows} from './html-copy.mjs';
import {gifRows} from './gif-copy.mjs';
import {growthEntries} from './growth-copy.mjs';
import {compressorRows} from './compressor-copy.mjs';
// Four columns: English, Korean, Japanese, Simplified Chinese.
export function searchCopy(t){
 const editorial=editorialCopy(t);if(editorial)return editorial;
 if(t.type==="pdfcompress")return {title:pdfCompressRows[0],description:pdfCompressRows[1],use:pdfCompressRows[28],how:["How it works","사용 방법","使い方","使用方法"]};
 if(t.type==="html")return {title:htmlRows[0],description:htmlRows[1],use:htmlRows[26],how:["How it works","사용 방법","使い方","使用方法"]};
 if(t.type==="gif")return {title:gifRows[0],description:gifRows[1],use:gifRows[30],how:["How it works","사용 방법","使い方","使用方法"]};
 if(t.slug==='image-compressor')return {title:compressorRows[16],description:compressorRows[1],use:compressorRows[17],how:compressorRows[9]};
 const entry=growthEntries.find(e=>e[0]===t.slug);if(entry)return {title:entry.slice(1,5),description:entry.slice(5,9),use:entry.slice(5,9),how:['How it works','사용 방법','使い方','使用方法']};
 const a=t.input?.toUpperCase(),b=t.output?.toUpperCase();
 let title,description,use;
 {
  const special={
   'merge-pdf':[
    ['Merge PDF – Combine PDF Files Free Online','PDF 합치기 – 여러 PDF 파일 무료 병합','PDF 結合 – 複数のPDFを無料でまとめる','PDF合并 – 免费在线合并多个PDF'],
    ['Combine PDF files in your chosen order for free. Reorder the file list and download one PDF. Files are processed in your browser.','여러 PDF 파일을 원하는 순서로 무료 병합하세요. 파일 목록의 순서를 정하고 하나의 PDF로 다운로드할 수 있습니다. 브라우저에서 파일을 처리합니다.','複数のPDFを好きな順番で無料結合。ファイル一覧を並べ替え、1つのPDFとしてダウンロードできます。処理はブラウザー内で行います。','免费按所选顺序合并多个PDF。调整文件列表顺序后下载一个PDF，文件在浏览器中处理。'],
    ['Combine a report and its attachments into one document. Check file order before merging; bookmarks and digital signatures are not preserved.','보고서와 첨부 자료를 한 문서로 모을 때 사용하세요. 병합 전에 파일 순서를 확인하세요. 북마크와 디지털 서명은 유지되지 않습니다.','レポートと添付資料を1つの文書にまとめられます。結合前にファイル順を確認してください。しおりと電子署名は保持されません。','适合将报告与附件整理成一个文档。合并前请检查文件顺序；书签和数字签名不会保留。']],
   'qr-generator':[
    ['Free QR Code Generator – Create a QR Code Online','QR 코드 만들기 – 무료 QR 코드 생성기','QRコード作成 – 無料オンライン生成ツール','二维码生成器 – 免费在线制作二维码'],
    ['Create a QR code from a link or text and download it as PNG. No signup required. Test the saved QR code before sharing or printing.','링크나 텍스트로 QR 코드를 만들고 PNG로 다운로드하세요. 회원가입 없이 이용할 수 있습니다. 공유하거나 인쇄하기 전에 인식 여부를 확인하세요.','リンクや文字からQRコードを作成しPNGで保存。登録は不要です。共有や印刷の前に読み取れることを確認してください。','将链接或文字生成二维码并下载为PNG，无需注册。分享或打印前请测试能否识别。'],
    ['Share a website address on printed material without asking people to type it. Scan the final image with a phone to check the destination.','인쇄물에서 웹사이트 주소를 직접 입력하는 대신 QR 코드로 안내할 수 있습니다. 최종 이미지를 휴대전화로 읽어 연결 주소를 확인하세요.','印刷物にQRコードを載せると、URLを入力せずに案内できます。完成画像をスマートフォンで読み取り、リンク先を確認してください。','在印刷材料上用二维码提供网站地址，省去手动输入。请用手机扫描最终图片并核对目标地址。']],
   'qr-reader':[
    ['QR Code Reader – Read QR Codes from Images Free','QR 코드 읽기 – 이미지 QR 코드 무료 인식','QRコード読み取り – 画像から無料で読み取る','二维码识别 – 免费读取图片中的二维码'],
    ['Read a QR code from a PNG, JPG or WEBP image. View and copy the decoded text in your browser; links do not open automatically.','PNG, JPG, WEBP 이미지의 QR 코드를 인식하세요. 브라우저에서 내용을 확인하고 복사할 수 있으며 링크는 자동으로 열리지 않습니다.','PNG・JPG・WEBP画像のQRコードを読み取ります。ブラウザーで内容を確認してコピーできます。リンクは自動で開きません。','识别PNG、JPG或WEBP图片中的二维码。在浏览器中查看并复制内容，链接不会自动打开。'],
    ['Read a saved QR screenshot when using another camera is inconvenient. Use an image with one clear QR code and inspect the decoded address.','다른 카메라를 사용하기 어려울 때 저장된 QR 스크린샷을 읽을 수 있습니다. QR 코드 하나가 선명한 이미지를 선택하고 인식된 주소를 확인하세요.','別のカメラを使いにくいとき、保存したQRコードのスクリーンショットを読み取れます。鮮明なコードが1つ写った画像を使い、読み取ったURLを確認してください。','不方便使用另一台相机时，可识别已保存的二维码截图。请选择只含一个清晰二维码的图片，并检查识别出的地址。']],
   'image-resizer':[
    ['Free Image Resizer – Change Image Width and Height','이미지 크기 조절 – 사진 가로·세로 무료 변경','画像サイズ変更 – 幅と高さを無料で調整','图片尺寸调整 – 免费修改图片宽度和高度'],
    ['Resize an image in pixels, keep its aspect ratio and download a PNG. Process the image in your browser without creating an account.','사진의 가로·세로 픽셀 크기를 조절하고 PNG로 저장하세요. 비율을 유지할 수 있으며 회원가입 없이 브라우저에서 처리합니다.','画像の幅と高さをピクセルで変更し、縦横比を維持してPNG保存できます。登録不要でブラウザー内で処理します。','按像素调整图片宽高，保持宽高比并下载PNG。无需注册，图片在浏览器中处理。'],
    ['Adjust an image to the pixel dimensions required by a website or document. This changes dimensions; it does not guarantee a target file size in KB.','웹사이트나 문서에서 요구하는 픽셀 크기에 맞출 때 사용하세요. 가로·세로를 조절하는 기능이며 특정 KB 용량을 보장하지는 않습니다.','ウェブサイトや文書に必要なピクセル寸法に調整できます。寸法を変更する機能で、指定KB以下のファイルサイズを保証するものではありません。','适合调整为网站或文档要求的像素尺寸。此功能修改宽高，不保证达到指定KB文件大小。']]
  };
  [title,description,use]=special[t.slug];
 }
 const how=['How to use '+t.title,t.title+' 사용 방법',t.title+'の使い方',t.title+'使用方法'];
 if(a&&b&&t.slug!=='merge-pdf'){
  how[1]=a+'를 '+b+'로 변환하는 방법';how[2]=a+'を'+b+'に変換する方法';how[3]=a+'转'+b+'的方法';
 }else{how[1]=title[1].split(' – ')[0]+' 사용 방법';how[2]=title[2].split(' – ')[0]+'の使い方';how[3]=title[3].split(' – ')[0]+'使用方法';}
 return {title,description,use,how};
}
export function searchRows(tools){return tools.flatMap(t=>[...Object.values(searchCopy(t)),searchCopy(t).title.map(value=>value.split(' – ')[0])]);}
