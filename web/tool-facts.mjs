export const factRows=[
  [
    "Before you choose a file",
    "파일을 선택하기 전에",
    "ファイルを選ぶ前に",
    "选择文件之前"
  ],
  [
    "Input",
    "입력",
    "入力",
    "输入"
  ],
  [
    "Output",
    "결과",
    "出力",
    "输出"
  ],
  [
    "Processing limits",
    "처리 제한",
    "処理の制限",
    "处理限制"
  ],
  [
    "PDF documents; page-based outputs follow the selected page range.",
    "PDF 문서. 페이지별 변환은 선택한 페이지 범위를 따릅니다.",
    "PDF文書。ページ単位の変換は選択した範囲に従います。",
    "PDF文档；按页转换遵循所选页范围。"
  ],
  [
    "SVG artwork with embedded resources. External references, scripts and HTML inside SVG are rejected.",
    "리소스를 내부에 포함한 SVG 그림. 외부 참조, 스크립트, SVG 내부 HTML은 허용하지 않습니다.",
    "リソースを埋め込んだSVG。外部参照、スクリプト、SVG内のHTMLは拒否します。",
    "含内嵌资源的SVG。拒绝外部引用、脚本及SVG中的HTML。"
  ],
  [
    "TIFF, including multiple pages. Each source page is processed, up to 100 pages.",
    "여러 페이지가 포함된 TIFF도 지원합니다. 원본의 각 페이지를 최대 100페이지까지 처리합니다.",
    "複数ページのTIFFに対応し、各ページを最大100ページまで処理します。",
    "支持多页TIFF，逐页处理，最多100页。"
  ],
  [
    "WEBP images. Animated input is treated as a still image, not preserved as an animation.",
    "WEBP 이미지. 움직이는 입력은 정지 이미지로 처리하며 애니메이션을 유지하지 않습니다.",
    "WEBP画像。アニメーション入力は静止画として処理し、動きは保持しません。",
    "WEBP图片。动态输入按静态图片处理，不保留动画。"
  ],
  [
    "UTF-8 text files. Tables and images are not reconstructed from plain text.",
    "UTF-8 텍스트 파일. 일반 텍스트에서 표나 이미지를 재구성하지 않습니다.",
    "UTF-8テキスト。プレーンテキストから表や画像を再構成しません。",
    "UTF-8文本。不会从纯文本重建表格或图片。"
  ],
  [
    "SVG output. Raster inputs remain embedded images, not traced vector paths. PDF paths are retained where supported and text may become outlines.",
    "SVG 결과. 래스터 입력은 벡터 경로로 추적하지 않고 이미지로 포함합니다. PDF 경로는 지원되는 범위에서 유지하며 글자는 윤곽선이 될 수 있습니다.",
    "SVG出力。ラスター入力はトレースせず画像として埋め込みます。PDFのパスは対応範囲で保持し、文字はアウトラインになる場合があります。",
    "SVG输出。位图输入嵌入为图片，不描摹矢量路径。尽可能保留PDF路径，文字可能成为轮廓。"
  ],
  [
    "UTF-8 text with page separators. Check OCR language and recognition errors; the PDF layout is not reproduced.",
    "페이지 구분이 포함된 UTF-8 텍스트. OCR 언어와 오인식을 확인하세요. PDF 배치는 재현하지 않습니다.",
    "ページ区切り付きUTF-8テキスト。OCR言語と誤認識を確認してください。PDFの配置は再現しません。",
    "带分页符的UTF-8文本。请检查OCR语言及识别错误，不重建PDF布局。"
  ],
  [
    "Separate PDFs or one combined PDF in file-list order. Review the page order and appearance after download.",
    "파일별 PDF 또는 파일 목록 순서로 합친 PDF. 다운로드 후 페이지 순서와 모양을 확인하세요.",
    "個別PDF、またはファイル一覧順に結合したPDF。保存後にページ順と見た目を確認してください。",
    "独立PDF或按文件列表顺序合成的PDF。下载后请检查页序和外观。"
  ],
  [
    "PNG preserves the rendered pixels without JPG-style quality compression. Converting an already blurred JPG to PNG does not restore detail.",
    "PNG는 JPG 방식의 손실 압축 없이 렌더링한 픽셀을 저장합니다. 이미 흐릿한 JPG를 PNG로 바꿔도 세부 정보가 복원되지 않습니다.",
    "PNGはJPG式の品質圧縮なしで描画ピクセルを保存します。ぼやけたJPGをPNGにしても細部は復元しません。",
    "PNG无JPG式质量压缩地保存渲染像素。模糊JPG转PNG无法恢复细节。"
  ],
  [
    "JPG is suitable when the receiving service requires JPEG. Check small text and edges for compression artifacts; transparency is not retained.",
    "제출처에서 JPEG를 요구할 때 JPG를 사용하세요. 작은 글자와 경계의 압축 흔적을 확인하세요. 투명 배경은 유지되지 않습니다.",
    "提出先がJPEGを要求する場合に適しています。小さな文字や輪郭の圧縮ノイズを確認してください。透明部分は保持しません。",
    "适合接收方要求JPEG时使用。检查小字及边缘的压缩失真，不保留透明背景。"
  ],
  [
    "WEBP output uses browser encoding. Check that your destination accepts WEBP; a smaller file than the original is not guaranteed.",
    "브라우저 인코더로 WEBP를 만듭니다. 제출처가 WEBP를 지원하는지 확인하세요. 원본보다 작은 파일을 보장하지 않습니다.",
    "ブラウザでWEBPにエンコードします。提出先の対応を確認してください。原本より小さくなる保証はありません。",
    "使用浏览器编码生成WEBP。请确认接收方支持，不保证比原文件更小。"
  ],
  [
    "Uncompressed TIFF output can be much larger than JPG or WEBP. Use it only when the receiving application needs TIFF.",
    "압축하지 않은 TIFF 결과는 JPG나 WEBP보다 훨씬 클 수 있습니다. 받는 프로그램이 TIFF를 필요로 할 때 사용하세요.",
    "非圧縮TIFFはJPGやWEBPより大きくなる場合があります。提出先がTIFFを必要とする場合に使ってください。",
    "未压缩TIFF可能远大于JPG或WEBP。仅在接收应用需要TIFF时使用。"
  ],
  [
    "Up to 20 files, 50 MB per file and 100 MB total input. Total output is limited to 150 MB. Large image decoding also depends on device memory.",
    "최대 20개, 파일당 50 MB, 입력 합계 100 MB. 결과 합계는 150 MB로 제한합니다. 큰 이미지 해독은 기기 메모리의 영향도 받습니다.",
    "最大20ファイル、1件50 MB、入力合計100 MB。出力合計は150 MBまでです。大きな画像の読み込みは端末メモリにも依存します。",
    "最多20个文件，单个50 MB，输入合计100 MB，输出合计150 MB。大型图片解码也取决于设备内存。"
  ],
  [
    "Convert up to 100 selected PDF pages per file. A larger PDF needs a page range. Lower raster resolution if rendering exceeds 24 million pixels or 16,000 pixels on one side.",
    "PDF 파일마다 선택한 최대 100페이지를 변환합니다. 더 긴 PDF는 페이지 범위를 입력하세요. 렌더링이 2,400만 픽셀 또는 한 변 16,000픽셀을 넘으면 이미지 해상도를 낮추세요.",
    "PDFごとに選択した最大100ページを変換します。それ以上は範囲を指定してください。描画が2400万画素または一辺16000pxを超える場合は解像度を下げてください。",
    "每个PDF转换最多100个所选页面。更长PDF需指定页范围。渲染超过2400万像素或单边16000像素时请降低分辨率。"
  ]
];
export const factContent={
  "title": "Before you choose a file",
  "input": "Input",
  "output": "Output",
  "limits": "Processing limits",
  "formats": {
    "pdf": "PDF documents; page-based outputs follow the selected page range.",
    "svg": "SVG artwork with embedded resources. External references, scripts and HTML inside SVG are rejected.",
    "tiff": "TIFF, including multiple pages. Each source page is processed, up to 100 pages.",
    "webp": "WEBP images. Animated input is treated as a still image, not preserved as an animation.",
    "txt": "UTF-8 text files. Tables and images are not reconstructed from plain text."
  },
  "outputs": {
    "svg": "SVG output. Raster inputs remain embedded images, not traced vector paths. PDF paths are retained where supported and text may become outlines.",
    "txt": "UTF-8 text with page separators. Check OCR language and recognition errors; the PDF layout is not reproduced.",
    "pdf": "Separate PDFs or one combined PDF in file-list order. Review the page order and appearance after download.",
    "png": "PNG preserves the rendered pixels without JPG-style quality compression. Converting an already blurred JPG to PNG does not restore detail.",
    "jpg": "JPG is suitable when the receiving service requires JPEG. Check small text and edges for compression artifacts; transparency is not retained.",
    "webp": "WEBP output uses browser encoding. Check that your destination accepts WEBP; a smaller file than the original is not guaranteed.",
    "tiff": "Uncompressed TIFF output can be much larger than JPG or WEBP. Use it only when the receiving application needs TIFF."
  },
  "batch": "Up to 20 files, 50 MB per file and 100 MB total input. Total output is limited to 150 MB. Large image decoding also depends on device memory.",
  "range": "Convert up to 100 selected PDF pages per file. A larger PDF needs a page range. Lower raster resolution if rendering exceeds 24 million pixels or 16,000 pixels on one side."
};
