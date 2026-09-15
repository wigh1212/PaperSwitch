export const seoRows=[
['PDF and Image Converter & QR Tools','PDF·이미지 변환 및 QR 도구','PDF・画像変換とQRツール','PDF与图片转换及二维码工具'],
['Convert PDFs and images, merge documents, create or read QR codes, and resize images in your browser. No file uploads or account required.','브라우저에서 PDF·이미지 변환, PDF 합치기, QR 코드 생성·읽기, 이미지 크기 변경을 이용하세요. 파일 업로드와 회원가입이 필요 없습니다.','ブラウザーでPDF・画像変換、PDF結合、QRコード作成・読取、画像サイズ変更。ファイルのアップロードや登録は不要です。','在浏览器中转换PDF和图片、合并文档、生成或识别二维码并调整图片尺寸，无需上传文件或注册。'],
['Common questions','자주 묻는 질문','よくある質問','常见问题'],
['Choose a language','언어 선택','言語を選択','选择语言'],
['How can I make the page images sharper?','페이지 이미지를 더 선명하게 만들려면 어떻게 하나요?','ページ画像を鮮明にするには？','如何让页面图片更清晰？'],
['Choose a higher image resolution before converting. More pixels can make small text easier to read, but increase file size and memory use. Enlarging a low-resolution scan cannot recover missing detail.','변환 전에 이미지 해상도를 높이세요. 픽셀이 늘면 작은 글자를 읽기 쉬워질 수 있지만 파일 크기와 메모리 사용량도 증가합니다. 저해상도 스캔을 확대해도 손실된 정보는 복원되지 않습니다.','変換前に解像度を上げてください。画素数を増やすと小さな文字が読みやすくなる場合がありますが、ファイルサイズとメモリー使用量も増えます。低解像度のスキャンを拡大しても失われた細部は復元されません。','转换前选择更高分辨率。增加像素可能使小字更易读，但也会增加文件大小和内存占用。放大低分辨率扫描件无法恢复缺失细节。'],
['Can I still select text after converting?','변환 후에도 글자를 선택할 수 있나요?','変換後も文字を選択できますか？','转换后还能选择文字吗？'],
['An image output contains pixels rather than selectable text. Keep the original PDF when you need to search or copy text. Use PDF to TXT when the goal is text extraction.','이미지 결과에는 선택 가능한 글자 대신 픽셀이 들어 있습니다. 검색하거나 글자를 복사해야 한다면 원본 PDF를 보관하세요. 텍스트 추출이 목적이라면 PDF → TXT를 이용하세요.','画像出力は選択できる文字ではなく画素です。検索やコピーが必要なら元のPDFを保管してください。文字の抽出にはPDF → TXTを使ってください。','图片输出由像素组成，不含可选文字。如需搜索或复制文字，请保留原PDF。提取文字请使用PDF → TXT。'],
['Does PNG improve the quality of a JPG or WEBP?','PNG로 바꾸면 JPG나 WEBP의 화질이 좋아지나요?','PNGにするとJPGやWEBPの画質は改善しますか？','转为PNG能提高JPG或WEBP的画质吗？'],
['PNG avoids further lossy compression at export, but it cannot restore detail already missing from the source. The PNG may be larger even when it looks the same.','PNG는 저장 시 추가 손실 압축을 피하지만 원본에서 이미 사라진 정보를 복원하지는 못합니다. 보이는 모습이 같아도 PNG 파일은 더 클 수 있습니다.','PNG出力では追加の非可逆圧縮を避けられますが、元の画像で失われた情報は復元できません。見た目が同じでもファイルが大きくなる場合があります。','PNG导出可避免进一步有损压缩，但无法恢复源文件已丢失的信息。即使外观相同，PNG文件也可能更大。'],
['What happens to transparent areas?','투명 영역은 어떻게 되나요?','透明部分はどうなりますか？','透明区域会怎样？'],
['These image conversion tools flatten transparent areas onto a white background. Check logos and cut-out images after conversion, and keep the original when transparency is important.','이 이미지 변환 도구는 투명 영역을 흰색 배경으로 저장합니다. 로고나 배경이 제거된 이미지는 변환 후 확인하고, 투명도가 중요하면 원본을 보관하세요.','この画像変換ツールは透明部分を白背景に合成します。ロゴや切り抜き画像は変換後に確認し、透明度が必要なら元のファイルを保管してください。','这些图片转换工具会将透明区域合成白色背景。转换后请检查标志和抠图，若透明度很重要，请保留原文件。'],
['Is a scanned PDF converted into editable vectors?','스캔 PDF도 편집 가능한 벡터로 바뀌나요?','スキャンPDFも編集可能なベクターになりますか？','扫描PDF会变成可编辑矢量吗？'],
['A scanned page remains an image inside the SVG. Existing vector shapes can be preserved, but this tool does not trace a photograph into paths. PDF text may become outlines.','스캔 페이지는 SVG 안에서도 이미지로 남습니다. 기존 벡터 도형은 유지할 수 있지만 사진의 윤곽선을 벡터 경로로 추적하지는 않습니다. PDF 글자는 윤곽선으로 바뀔 수 있습니다.','スキャンページはSVG内でも画像のままです。既存のベクター形状は保持できますが、写真の輪郭をパスに変換するものではありません。PDFの文字がアウトラインになる場合があります。','扫描页面在SVG中仍为图片。可保留原有矢量形状，但不会将照片描摹成路径。PDF文字可能转换为轮廓。'],
['Can I convert a scanned document to text?','스캔 문서도 텍스트로 변환할 수 있나요?','スキャン文書から文字を抽出できますか？','可以从扫描文档提取文字吗？'],
['PDF to TXT can run OCR on pages without text. Select the document language, or choose OCR every page if extraction is incomplete. Review names, numbers and formatting because recognition can make mistakes.','PDF → TXT는 글자가 없는 페이지에 OCR을 실행할 수 있습니다. 문서 언어를 선택하고, 추출이 불완전하면 모든 페이지 OCR을 사용하세요. 오인식이 있을 수 있으므로 이름·숫자·서식을 확인하세요.','PDF → TXTは文字のないページをOCR処理できます。文書の言語を選び、抽出が不完全な場合は全ページOCRを選んでください。誤認識があるため名前・数字・書式を確認してください。','PDF → TXT可对无文字页面执行OCR。请选择文档语言；提取不完整时可选择所有页面OCR。识别可能出错，请核对姓名、数字和格式。'],
['Can multiple images become one PDF?','여러 이미지를 하나의 PDF로 만들 수 있나요?','複数の画像を1つのPDFにできますか？','多张图片能合成一个PDF吗？'],
['Select One PDF in the output options, arrange the files using Move up and Move down, then convert. Separate files creates an individual PDF for each input instead.','출력 옵션에서 하나의 PDF를 선택하고 위로·아래로 버튼으로 파일 순서를 정한 뒤 변환하세요. 개별 파일을 선택하면 입력마다 별도의 PDF를 만듭니다.','出力設定で1つのPDFを選び、上下ボタンでファイルを並べて変換します。個別ファイルを選ぶと入力ごとにPDFを作成します。','在输出选项中选择一个PDF，用上下按钮排列文件后转换。选择独立文件则会为每个输入生成单独PDF。'],
['Will merging change the page order?','합치면 페이지 순서가 바뀌나요?','結合でページ順は変わりますか？','合并会改变页序吗？'],
['The merged document follows the file order shown in the queue, keeping each file’s pages together. Reorder the queue before merging and check the downloaded document.','합친 문서는 대기열의 파일 순서를 따르며 각 파일의 페이지는 함께 유지됩니다. 합치기 전에 순서를 정하고 다운로드한 문서를 확인하세요.','結合文書は一覧のファイル順に従い、各ファイル内のページはまとめて保持されます。結合前に並べ替え、ダウンロード後に確認してください。','合并文档遵循队列文件顺序，每个文件的页面保持在一起。请在合并前排序，并检查下载的文档。'],
['Does image to SVG trace the picture?','이미지 → SVG는 그림의 윤곽선을 추적하나요?','画像からSVGへの変換で輪郭をトレースしますか？','图片转SVG会描摹轮廓吗？'],
['The original image is embedded inside an SVG container. It remains a raster image, so enlarging it does not create new detail or editable vector paths.','원본 이미지를 SVG 파일 안에 포함합니다. 여전히 래스터 이미지이므로 확대해도 새 세부 정보나 편집 가능한 벡터 경로가 생기지 않습니다.','元の画像をSVG内に埋め込みます。ラスター画像のままなので、拡大しても新しい細部や編集可能なベクターパスは生成されません。','原图片会嵌入SVG容器中，仍是栅格图片。放大不会产生新细节或可编辑矢量路径。'],
['Why can an SVG look different after conversion?','SVG가 변환 후 다르게 보이는 이유는 무엇인가요?','変換後にSVGの見た目が変わるのはなぜですか？','为什么SVG转换后外观不同？'],
['SVG files can depend on fonts, filters or external resources. External images and scripts are rejected, and unsupported styles or missing fonts may change the result. Compare it with the original before using it.','SVG는 글꼴·필터·외부 리소스에 의존할 수 있습니다. 외부 이미지와 스크립트는 허용하지 않으며 지원되지 않는 스타일이나 없는 글꼴은 결과를 바꿀 수 있습니다. 사용 전에 원본과 비교하세요.','SVGはフォント・フィルター・外部リソースに依存する場合があります。外部画像とスクリプトは拒否され、未対応のスタイルや不足したフォントで結果が変わることがあります。使用前に原本と比較してください。','SVG可能依赖字体、滤镜或外部资源。外部图片和脚本不被允许，不支持的样式或缺失字体可能影响结果。使用前请与原图比较。'],
['How can I check a QR code before printing?','인쇄 전에 QR 코드를 어떻게 확인하나요?','印刷前にQRコードを確認するには？','打印前如何检查二维码？'],
['Download the PNG and scan it with a phone at the intended display size. A short message, strong contrast and a small logo make scanning easier. Verify the decoded destination or text.','PNG를 다운로드하고 실제 사용할 크기로 휴대전화에서 스캔하세요. 짧은 내용·강한 대비·작은 로고가 인식을 돕습니다. 읽힌 주소나 내용을 확인하세요.','PNGをダウンロードし、実際に使うサイズでスマートフォンから読み取ってください。短い内容・高いコントラスト・小さなロゴは読み取りを助けます。読み取ったURLや内容を確認してください。','下载PNG，并按实际展示尺寸用手机扫描。简短内容、高对比度和小标志更易识别。请核对识别出的地址或文字。'],
['Does the QR reader open links automatically?','QR 읽기는 링크를 자동으로 여나요?','QR読取はリンクを自動で開きますか？','二维码识别会自动打开链接吗？'],
['The decoded content is displayed as text. You can copy it and review the destination before opening a link yourself. Use a clear image containing one QR code.','인식된 내용은 텍스트로 표시됩니다. 직접 링크를 열기 전에 복사하고 주소를 확인할 수 있습니다. QR 코드 하나가 선명하게 보이는 이미지를 사용하세요.','読み取った内容は文字で表示されます。コピーし、リンク先を確認してから自分で開けます。QRコードが1つだけ鮮明に写った画像を使用してください。','识别内容以文字显示。您可复制并检查目标地址，再自行打开。请使用仅含一个清晰二维码的图片。'],
['How do I resize without stretching?','이미지가 늘어나지 않게 크기를 바꾸려면 어떻게 하나요?','画像を変形させずにサイズ変更するには？','如何调整尺寸而不拉伸？'],
['Keep aspect ratio enabled and change either width or height; the other dimension follows automatically. The resized file is saved as PNG. Increasing dimensions does not restore detail missing from the source.','비율 유지를 켜고 가로 또는 세로 중 하나를 바꾸면 나머지 값이 자동으로 맞춰집니다. 결과는 PNG로 저장됩니다. 크기를 늘려도 원본에 없는 정보는 복원되지 않습니다.','縦横比を維持したまま幅か高さを変更すると、もう一方が自動で調整されます。結果はPNG保存です。拡大しても元の画像にない細部は復元できません。','开启保持宽高比，修改宽度或高度，另一个尺寸会自动调整。结果保存为PNG。放大无法恢复源图中缺失的细节。']
];
export function faqsFor(t){
 if(['pdfedit','heic'].includes(t.type))return [];
 if(t.slug==='wifi-qr')return [10];
 if(t.slug==='merge-pdf')return [7];
 if(t.slug==='qr-generator')return [10];
 if(t.slug==='qr-reader')return [11];
 if(t.slug==='image-resizer')return [12];
 if(t.input==='pdf'&&t.output==='txt')return [5];
 if(t.input==='pdf'&&t.output==='svg')return [4];
 if(t.input==='pdf')return [0,1];
 if(t.output==='svg')return [8];
 if(t.input==='svg')return [9,...(t.output==='pdf'?[]:[3])];
 if(t.output==='pdf'&&t.input!=='txt')return [6];
 if(t.output==='png')return [2,3];
 if(['jpg','webp'].includes(t.output))return [3];
 return [];
}
export const faqPairs=[
[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19],[20,21],[22,23],[24,25],[26,27],[28,29]
].map(([q,a])=>[seoRows[q][0],seoRows[a][0]]);
