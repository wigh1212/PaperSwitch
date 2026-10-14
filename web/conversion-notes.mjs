export const conversionNoteRows=[
 ['Pixel dimensions are kept. Transparent areas become white. Changing the format does not recover detail already lost in the original.','픽셀 크기는 유지합니다. 투명 영역은 흰색이 됩니다. 형식을 바꿔도 원본에서 이미 손실된 세부 정보는 복원되지 않습니다.','ピクセル寸法を保持し、透明部分は白になります。形式を変えても原本で失われた細部は復元しません。','保持像素尺寸，透明区域变白。改变格式不会恢复原图中已丢失的细节。'],
 ['Animated WEBP is saved as a still image from its first frame. Pixel dimensions are kept and transparent areas become white.','움직이는 WEBP는 첫 프레임의 정지 이미지로 저장합니다. 픽셀 크기는 유지하고 투명 영역은 흰색으로 바뀝니다.','アニメーションWEBPは最初のフレームの静止画として保存します。ピクセル寸法を保持し、透明部分は白になります。','动态WEBP保存为首帧静态图片，保持像素尺寸，透明区域变白。'],
 ['One image is created per TIFF page. All pages are processed, up to 100 pages; choose a format accepted by the receiving application.','TIFF 페이지마다 이미지 하나를 만듭니다. 최대 100페이지까지 전체 페이지를 처리합니다. 결과를 사용할 프로그램에서 받는 형식을 선택하세요.','TIFFの各ページから画像を1つ作成し、最大100ページまで全ページを処理します。利用先に対応した形式を選んでください。','每个TIFF页面生成一张图片，处理全部页面，最多100页。请选择接收应用支持的格式。'],
 ['The output is uncompressed TIFF and can be much larger than the original. Transparent areas become white; use TIFF when the receiving application requires it.','결과는 무압축 TIFF이므로 원본보다 훨씬 커질 수 있습니다. 투명 영역은 흰색이 됩니다. 결과를 받을 프로그램에서 TIFF를 요구할 때 사용하세요.','出力は非圧縮TIFFで、原本より大きくなる場合があります。透明部分は白になります。利用先がTIFFを要求するときに使ってください。','输出为未压缩TIFF，可能远大于原文件。透明区域变白，请在接收应用要求TIFF时使用。'],
 ['The output is uncompressed TIFF and can be large. Animated WEBP contributes only its first frame; transparent areas become white.','결과는 무압축 TIFF이므로 용량이 클 수 있습니다. 움직이는 WEBP는 첫 프레임만 사용하고 투명 영역은 흰색이 됩니다.','出力は非圧縮TIFFで容量が大きくなる場合があります。アニメーションWEBPの最初のフレームのみを使い、透明部分は白になります。','输出为未压缩TIFF，文件可能较大。动态WEBP仅使用首帧，透明区域变白。'],
 ['The image is embedded inside SVG. This does not trace vector paths or make the image an editable drawing.','이미지를 SVG 안에 포함합니다. 벡터 경로를 추적하거나 편집 가능한 도형으로 만드는 기능이 아닙니다.','画像をSVG内に埋め込みます。ベクターパスのトレースや編集可能な図形への変換は行いません。','将图片嵌入SVG，不描摹矢量路径，也不会生成可编辑图形。'],
 ['One SVG is created per TIFF page, with the page image embedded inside. The images do not become editable vector paths.','TIFF 페이지마다 해당 이미지를 포함한 SVG 하나를 만듭니다. 이미지가 편집 가능한 벡터 경로로 바뀌지는 않습니다.','TIFFの各ページの画像を埋め込んだSVGを1つずつ作成します。編集可能なベクターパスにはなりません。','每个TIFF页面生成一个内嵌该页图片的SVG。图片不会变成可编辑矢量路径。'],
 ['The first frame of WEBP is embedded inside SVG. Animation and editable vector paths are not created.','WEBP의 첫 프레임을 SVG 안에 포함합니다. 애니메이션을 유지하거나 편집 가능한 벡터 경로를 만들지 않습니다.','WEBPの最初のフレームをSVG内に埋め込みます。アニメーションは保持せず、編集可能なベクターパスは作成しません。','将WEBP首帧嵌入SVG，不保留动画，也不生成可编辑矢量路径。'],
 ['All pages of a TIFF become PDF pages. Choose separate PDFs for each file or combine the files in list order.','TIFF의 모든 페이지를 PDF 페이지로 만듭니다. 파일별 PDF를 만들거나 파일 목록 순서로 합칠 수 있습니다.','TIFFの全ページをPDFのページにします。ファイル別PDF、または一覧順に結合したPDFを選べます。','将TIFF全部页面转为PDF页面，可为每个文件单独生成PDF或按列表顺序合并。'],
 ['Choose separate PDFs or combine the images in list order. Transparent areas become white; image text remains an image without OCR.','파일별 PDF를 만들거나 목록 순서로 이미지를 합칩니다. 투명 영역은 흰색이 되고 이미지 속 글자는 OCR 없이 이미지로 남습니다.','個別PDF、または一覧順に画像を結合します。透明部分は白になり、画像内の文字はOCRせず画像のままです。','可单独生成PDF或按列表顺序合并图片。透明区域变白，不执行OCR，图片中的文字仍为图片。'],
 ['WEBP contributes its first frame to the PDF. Transparent areas become white. Choose separate PDFs or combine files in list order; animation is not retained.','WEBP의 첫 프레임을 PDF에 담습니다. 투명 영역은 흰색이 됩니다. 파일별 PDF 또는 목록 순서로 합친 PDF를 선택할 수 있으며 애니메이션은 유지하지 않습니다.','WEBPの最初のフレームをPDFにし、透明部分は白になります。個別PDFまたは一覧順の結合を選べます。アニメーションは保持しません。','将WEBP首帧放入PDF，透明区域变白。可单独生成PDF或按列表顺序合并，不保留动画。']
];
export function conversionNote(input,output){
 const index=output==='svg'?(input==='tiff'?6:input==='webp'?7:5)
  :output==='pdf'?(input==='tiff'?8:input==='webp'?10:9)
  :output==='tiff'?(input==='webp'?4:3)
  :input==='tiff'?2:input==='webp'?1:0;
 return conversionNoteRows[index][0];
}
