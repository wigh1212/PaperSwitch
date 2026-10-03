const descriptions={
  "png-to-jpg": [
    "Turn a PNG into a JPG for an upload form. Transparent areas become white; compare the edges in the example below.",
    "PNG를 JPG만 받는 업로드 양식에 맞춥니다. 투명 영역은 흰색으로 바뀝니다. 아래 예시에서 경계와 배경의 차이를 확인하세요.",
    "JPGのみ受け付けるフォーム向けにPNGを変換します。透明部分は白になります。下の例で輪郭と背景を確認できます。",
    "将PNG转为上传表单要求的JPG。透明区域变白，可在下方示例中对比边缘和背景。"
  ],
  "jpg-to-png": [
    "Save a JPG as PNG when another app requires it. Pixel dimensions stay the same, but lost detail and transparency do not return.",
    "PNG가 필요한 프로그램에 사용할 JPG를 변환합니다. 픽셀 크기는 유지되지만 손실된 디테일이나 투명 배경이 복원되지는 않습니다.",
    "PNGを必要とするアプリ向けにJPGを保存します。ピクセル寸法は同じですが、失われた細部や透明部分は戻りません。",
    "将JPG保存为应用所需的PNG。像素尺寸不变，但不会恢复丢失的细节或透明背景。"
  ],
  "png-to-webp": [
    "Convert PNG to WEBP and compare file sizes. This converter flattens transparent areas onto white; use Image Compressor if you need to retain transparency.",
    "PNG를 WEBP로 바꾸고 용량을 비교합니다. 이 변환기는 투명 영역을 흰색으로 채웁니다. 투명도를 유지하려면 이미지 용량 줄이기를 이용하세요.",
    "PNGをWEBPに変換して容量を比較します。この変換では透明部分が白になります。透明度を保つには画像圧縮ツールを使ってください。",
    "将PNG转换为WEBP并比较大小。此转换器将透明区域填为白色；如需保留透明度，请使用图片压缩工具。"
  ],
  "webp-to-jpg": [
    "Open a downloaded WEBP image in software that needs JPEG. Transparency becomes white and animated files produce a still image.",
    "JPEG가 필요한 프로그램에서 내려받은 WEBP 이미지를 사용할 때 변환하세요. 투명 영역은 흰색으로, 움직이는 파일은 정지 이미지로 저장됩니다.",
    "JPEGが必要なソフトでダウンロード済みWEBPを使うための変換です。透明部分は白になり、動画は静止画になります。",
    "将下载的WEBP转换为软件所需的JPEG。透明区域变白，动画文件输出为静态图片。"
  ],
  "jpg-to-webp": [
    "Make a WEBP copy of a JPG for a website that accepts WEBP. Compare the downloaded size and fine details before replacing the original.",
    "WEBP를 지원하는 웹사이트에 쓸 JPG 사본을 만듭니다. 원본을 교체하기 전에 다운로드한 파일의 용량과 작은 디테일을 비교하세요.",
    "WEBP対応サイトで使うJPGのコピーを作ります。原本を置き換える前に容量と細部を比較してください。",
    "为支持WEBP的网站创建JPG副本。替换原文件前，请比较下载后的大小和细节。"
  ],
  "pdf-to-txt": [
    "Extract selectable PDF text or run OCR on scanned pages. The output is plain text; columns, tables and page layout are not reconstructed.",
    "PDF의 선택 가능한 글자를 추출하거나 스캔 페이지를 OCR로 읽습니다. 결과는 일반 텍스트이며 단, 표와 페이지 배치는 재구성하지 않습니다.",
    "PDF内の文字を抽出、またはスキャンページをOCRで読み取ります。結果はプレーンテキストで、段組み、表、ページ配置は再現しません。",
    "提取PDF可选文字或对扫描页进行OCR。输出为纯文本，不重建分栏、表格或页面布局。"
  ],
  "svg-to-pdf": [
    "Save SVG artwork as a PDF. Vector shapes are kept where supported; external resources are blocked and complex effects can render differently.",
    "SVG 그림을 PDF로 저장합니다. 지원되는 벡터 도형은 유지하지만 외부 리소스는 차단하며 복잡한 효과는 다르게 표시될 수 있습니다.",
    "SVGをPDFに保存します。対応するベクター形状を保持しますが、外部リソースは拒否し、複雑な効果は表示が異なる場合があります。",
    "将SVG保存为PDF。尽可能保留矢量形状，但会阻止外部资源，复杂效果可能显示不同。"
  ],
  "jpg-to-pdf": [
    "Put receipt photos or photographed pages into one PDF. Arrange the files before combining; the text in a photo remains an image.",
    "영수증 사진이나 촬영한 문서를 하나의 PDF로 모읍니다. 합치기 전에 파일 순서를 정하세요. 사진 속 글자는 이미지로 남습니다.",
    "領収書や撮影した文書を1つのPDFにまとめます。結合前に順番を確認してください。写真内の文字は画像のままです。",
    "将收据照片或拍摄的文档整理为一个PDF。合并前排列文件，照片中的文字仍为图片。"
  ],
  "pdf-to-jpg": [
    "Save selected PDF pages as JPG images for slides or attachments. Choose the page range and resolution; the downloaded images no longer contain selectable text.",
    "PDF에서 필요한 페이지를 발표 자료나 첨부용 JPG로 저장합니다. 페이지 범위와 해상도를 선택하세요. 결과 이미지에서는 글자를 선택할 수 없습니다.",
    "PDFの必要なページをスライドや添付用のJPGに保存します。範囲と解像度を選べます。結果の画像では文字を選択できません。",
    "将所需PDF页面保存为幻灯片或附件用JPG。可选页范围和分辨率，结果图片不含可选文字。"
  ],
  "png-to-pdf": [
    "Package PNG screenshots in a PDF. Transparent areas turn white and each image becomes a page; review small text after saving.",
    "PNG 화면 캡처를 PDF로 묶습니다. 투명 영역은 흰색으로 바뀌고 이미지마다 페이지가 만들어집니다. 저장 후 작은 글자가 읽히는지 확인하세요.",
    "PNGスクリーンショットをPDFにまとめます。透明部分は白になり、画像ごとにページを作ります。保存後に小さな文字を確認してください。",
    "将PNG截图整理为PDF。透明区域变白，每张图片成为一页，请在保存后检查小字。"
  ],
  "pdf-to-png": [
    "Export PDF pages as PNG for diagrams and screenshots. PNG avoids JPG-style encoding loss but can create larger files.",
    "PDF 페이지를 도표나 화면 자료에 쓸 PNG로 저장합니다. JPG 방식의 인코딩 손실을 피할 수 있지만 파일이 커질 수 있습니다.",
    "PDFページを図表や画面資料向けのPNGに保存します。JPG式の圧縮劣化を避けられますが、容量は大きくなる場合があります。",
    "将PDF页面导出为图表或截图用PNG。可避免JPG式编码损失，但文件可能更大。"
  ],
  "pdf-to-svg": [
    "Export PDF pages to SVG for a graphics workflow. Supported paths remain vectors; scanned page images do not become editable drawings.",
    "그래픽 작업에 쓸 PDF 페이지를 SVG로 내보냅니다. 지원되는 경로는 벡터로 남지만 스캔 이미지를 편집 가능한 도형으로 바꾸지는 않습니다.",
    "PDFページをグラフィック作業向けSVGに出力します。対応パスはベクターのままですが、スキャン画像は編集可能な図形にはなりません。",
    "将PDF页面导出为图形工作流用SVG。支持的路径保留为矢量，扫描图片不会成为可编辑图形。"
  ],
  "txt-to-pdf": [
    "Lay out UTF-8 text on A4 PDF pages. Line wrapping is automatic; plain text does not contain the tables or images of the original document.",
    "UTF-8 텍스트를 A4 PDF에 배치합니다. 줄은 자동으로 바뀌며 일반 텍스트에는 원래 문서의 표나 이미지가 포함되지 않습니다.",
    "UTF-8テキストをA4 PDFに配置します。自動改行されます。プレーンテキストには元文書の表や画像は含まれません。",
    "将UTF-8文字排入A4 PDF并自动换行。纯文本不含原文档的表格或图片。"
  ]
};
const tails={
  "png": [
    "Save {a} as PNG. Check the rendered pixels rather than expecting the conversion to restore lost detail.",
    "{a}를 PNG로 저장합니다. 변환으로 손실된 정보가 복구되지는 않으므로 결과 픽셀을 확인하세요.",
    "{a}をPNGに保存します。失われた細部の復元はできないため、出力の画質を確認してください。",
    "将{a}保存为PNG。转换无法恢复丢失的细节，请检查渲染结果。"
  ],
  "jpg": [
    "Save {a} as JPG. The output is a still image with a white background; check text and edges before sharing.",
    "{a}를 JPG로 저장합니다. 흰 배경의 정지 이미지가 되므로 공유 전에 글자와 경계를 확인하세요.",
    "{a}をJPGに保存します。白背景の静止画になるため、共有前に文字や輪郭を確認してください。",
    "将{a}保存为JPG。输出为白色背景的静态图片，分享前请检查文字和边缘。"
  ],
  "webp": [
    "Save {a} as WEBP. Check support in the receiving application and compare the result with the original.",
    "{a}를 WEBP로 저장합니다. 받는 프로그램의 지원 여부를 확인하고 결과를 원본과 비교하세요.",
    "{a}をWEBPに保存します。受け取り側の対応を確認し、原本と比較してください。",
    "将{a}保存为WEBP。请确认接收应用支持并与原文件比较。"
  ],
  "svg": [
    "Place {a} pixels inside an SVG file. This is image embedding, not automatic tracing into editable vector paths.",
    "{a}의 픽셀 이미지를 SVG 파일 안에 넣습니다. 편집 가능한 벡터 경로를 자동으로 추적하는 기능은 아닙니다.",
    "{a}のピクセル画像をSVG内に埋め込みます。編集可能なベクターパスへの自動トレースではありません。",
    "将{a}像素图片嵌入SVG文件，不会自动描摹为可编辑矢量路径。"
  ],
  "tiff": [
    "Create uncompressed TIFF from {a}. Output can be large; use this format when the receiving application requires TIFF.",
    "{a}를 압축하지 않은 TIFF로 저장합니다. 결과가 클 수 있으므로 받는 프로그램이 TIFF를 요구할 때 사용하세요.",
    "{a}を非圧縮TIFFで保存します。容量が大きくなるため、提出先がTIFFを必要とする場合に使ってください。",
    "将{a}保存为未压缩TIFF。输出可能很大，适合接收应用要求TIFF时使用。"
  ],
  "pdf": [
    "Save {a} in a PDF document. Choose separate outputs or combine files in the order shown in the list.",
    "{a}를 PDF 문서에 담습니다. 파일별로 저장하거나 목록에 표시된 순서로 합칠 수 있습니다.",
    "{a}をPDFに保存します。個別に保存するか、一覧に表示された順序で結合できます。",
    "将{a}保存为PDF文档。可单独保存或按列表顺序合并。"
  ]
};
export function editorialCopy(t){if(t.type!=='convert'||t.slug==='merge-pdf')return null;const a=t.input.toUpperCase(),b=t.output.toUpperCase();return {title:[a+' to '+b,a+' '+b+' 변환',a+'から'+b+'への変換',a+'转'+b],description:descriptions[t.slug]||tails[t.output].map(s=>s.replaceAll('{a}',a)),use:descriptions[t.slug]||tails[t.output].map(s=>s.replaceAll('{a}',a)),how:['How to convert','변환 순서','変換手順','转换步骤']};}
