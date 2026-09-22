# 실제 페이지 및 소스 목록

2026-09-22 코드 기준. 도구 47개 + 홈/소개/문의/개인정보/이용 안내 5개 = 52개 기본 경로. 각 경로에 영어(접두어 없음), 한국어 /ko, 일본어 /ja, 중국어 /zh-cn를 적용하여 총 208개 canonical HTML을 생성한다. 404, 라이선스/소스 파일은 사이트맵에서 제외한다.

| 경로 | 목적 | 엔진 분류 | 입력 → 출력 |
|---|---|---|---|
| /compress-pdf | PDF 용량 줄이기 | pdfcompress | pdf → PDF |
| /html-to-pdf | HTML PDF 변환 | html | html → pdf |
| /gif-maker | GIF 만들기 | gif | 도구별 입력 → GIF |
| /split-pdf | PDF 나누기 | pdfedit | pdf → PDF |
| /extract-pdf-pages | PDF 페이지 추출 | pdfedit | pdf → PDF |
| /delete-pdf-pages | PDF 페이지 삭제 | pdfedit | pdf → PDF |
| /rotate-pdf | PDF 회전 | pdfedit | pdf → PDF |
| /heic-to-jpg | HEIC JPG 변환 | heic | heic → jpg |
| /heic-to-png | HEIC PNG 변환 | heic | heic → png |
| /wifi-qr | 와이파이 QR 만들기 | qr | 도구별 입력 → PNG |
| /image-compressor | 이미지 용량 줄이기 | compressor | 도구별 입력 → JPG/PNG/WEBP |
| /pdf-to-svg | PDF SVG 변환 | convert | pdf → svg |
| /svg-to-pdf | SVG PDF 변환 | convert | svg → pdf |
| /pdf-to-webp | PDF WEBP 변환 | convert | pdf → webp |
| /webp-to-pdf | WEBP PDF 변환 | convert | webp → pdf |
| /pdf-to-jpg | PDF JPG 변환 | convert | pdf → jpg |
| /jpg-to-pdf | JPG PDF 변환 | convert | jpg → pdf |
| /pdf-to-png | PDF PNG 변환 | convert | pdf → png |
| /png-to-pdf | PNG PDF 변환 | convert | png → pdf |
| /pdf-to-txt | PDF 텍스트 추출 | convert | pdf → txt |
| /txt-to-pdf | TXT PDF 변환 | convert | txt → pdf |
| /pdf-to-tiff | PDF TIFF 변환 | convert | pdf → tiff |
| /tiff-to-pdf | TIFF PDF 변환 | convert | tiff → pdf |
| /svg-to-png | SVG PNG 변환 | convert | svg → png |
| /svg-to-jpg | SVG JPG 변환 | convert | svg → jpg |
| /svg-to-webp | SVG WEBP 변환 | convert | svg → webp |
| /svg-to-tiff | SVG TIFF 변환 | convert | svg → tiff |
| /png-to-svg | PNG SVG 변환 | convert | png → svg |
| /jpg-to-svg | JPG SVG 변환 | convert | jpg → svg |
| /webp-to-svg | WEBP SVG 변환 | convert | webp → svg |
| /tiff-to-svg | TIFF SVG 변환 | convert | tiff → svg |
| /jpg-to-png | JPG PNG 변환 | convert | jpg → png |
| /png-to-jpg | PNG JPG 변환 | convert | png → jpg |
| /jpg-to-webp | JPG WEBP 변환 | convert | jpg → webp |
| /webp-to-jpg | WEBP JPG 변환 | convert | webp → jpg |
| /jpg-to-tiff | JPG TIFF 변환 | convert | jpg → tiff |
| /tiff-to-jpg | TIFF JPG 변환 | convert | tiff → jpg |
| /png-to-webp | PNG WEBP 변환 | convert | png → webp |
| /webp-to-png | WEBP PNG 변환 | convert | webp → png |
| /png-to-tiff | PNG TIFF 변환 | convert | png → tiff |
| /tiff-to-png | TIFF PNG 변환 | convert | tiff → png |
| /webp-to-tiff | WEBP TIFF 변환 | convert | webp → tiff |
| /tiff-to-webp | TIFF WEBP 변환 | convert | tiff → webp |
| /merge-pdf | PDF 합치기 | convert | pdf → pdf |
| /qr-generator | QR 코드 만들기 | qr | 도구별 입력 → PNG |
| /qr-reader | QR 코드 읽기 | qr | 도구별 입력 → 텍스트 |
| /image-resizer | 이미지 크기 조절 | image | 도구별 입력 → PNG |

| 안내 경로 | 역할 |
|---|---|
| / | 도구 탐색 랜딩 |
| /about | 목적, 처리 방식, 예시, 운영 문의 |
| /contact | 제공받은 이메일로 문의 |
| /privacy | 파일/저장/외부 서비스/이메일 처리 |
| /terms | 서비스 이용 및 결과 확인 안내 |
| /404.html | 홈 및 주요 도구 복귀, 광고 없음 |
| /assets/licenses/index.html | 제3자 고지, noindex |
| /assets/source/index.html | 동일 빌드 소스 및 라이브러리 원본, noindex |

## 직접 관리하는 소스 목록

의존성 vendor와 바이너리 예시를 제외한 파일 목록이다. 런타임 흐름은 UI → 브라우저 서비스 → Worker/Canvas/WASM → Blob 다운로드로 추적했고, 빌드·다국어·배포 라우팅도 조사했다. 이 목록이 모든 제3자 바이너리의 보안 검증을 의미하지는 않는다.

- extension/app.js
- extension/background.js
- extension/batch.css
- extension/bootstrap.js
- extension/conversion/merge-pdf.js
- extension/conversion/raster.js
- extension/conversion/svg-styles.js
- extension/conversions.js
- extension/core.js
- extension/i18n.js
- extension/image-editor.html
- extension/image-editor.js
- extension/index.html
- extension/locales.js
- extension/manifest.json
- extension/merge-worker.js
- extension/navigation.css
- extension/navigation.js
- extension/ocr-languages.js
- extension/qr-frame-copy.js
- extension/qr.css
- extension/qr.html
- extension/qr.js
- extension/services/access-service.js
- extension/services/batch-service.js
- extension/services/conversion-service.js
- extension/services/download-service.js
- extension/services/image-edit-service.js
- extension/services/merge-service.js
- extension/services/pdf-worker-client.js
- extension/services/qr-frame-service.js
- extension/services/qr-service.js
- extension/services/wifi-service.js
- extension/style.css
- extension/svg-image.js
- extension/tiff.js
- extension/validate-svg.js
- extension/worker.js
- scripts/build-license-notices.mjs
- scripts/build-seo.mjs
- scripts/build-source-distribution.mjs
- scripts/build-web.mjs
- scripts/build.mjs
- scripts/check-dependencies.mjs
- scripts/generate-content-examples.mjs
- scripts/measure-heic-example.mjs
- scripts/practical-guides.mjs
- scripts/preview-web.mjs
- scripts/sitemaps.mjs
- src/converters/fonts.js
- src/converters/image-pdf.js
- src/converters/svg-pdf.js
- src/converters/text-pdf.js
- src/pdf-converters.js
- src/qr-vendor.js
- tests/browser.mjs
- tests/conversion.test.mjs
- tests/image-editor-browser.mjs
- tests/navigation-browser.mjs
- tests/pdf-compress.test.mjs
- tests/qr-browser.mjs
- tests/services.test.mjs
- tests/site-audit.mjs
- tests/sitemaps.test.mjs
- tests/source-distribution.test.mjs
- tests/web-browser.mjs
- tests/web-compressor.mjs
- tests/web-gif.mjs
- tests/web-growth.mjs
- tests/web-html-pdf.mjs
- tests/web-locales.mjs
- tests/web-pdf-compress.mjs
- tests/web-practical-guides.mjs
- tests/web-routing.mjs
- tests/web-seo.mjs
- tests/web-site-audit.mjs
- tests/web-ui-seo.mjs
- tests/worker-indexing.test.mjs
- web/compressor-copy.mjs
- web/copy.mjs
- web/file-tools.html
- web/file-tools.js
- web/gif-copy.mjs
- web/gif-maker.html
- web/gif-maker.js
- web/gif-worker.js
- web/growth-copy.mjs
- web/heic-worker.js
- web/html-copy.mjs
- web/html-document.mjs
- web/html-export.js
- web/html-to-pdf.html
- web/html-to-pdf.js
- web/image-compressor.html
- web/image-compressor.js
- web/landing-copy.mjs
- web/pdf-compress-copy.mjs
- web/pdf-compress-core.mjs
- web/pdf-compress-worker.js
- web/pdf-compressor.html
- web/pdf-compressor.js
- web/pdf-edit-worker.js
- web/practical-guides.mjs
- web/search-copy.mjs
- web/seo-config.mjs
- web/seo-copy.mjs
- web/service-content.mjs
- web/site.css
- web/site.js
- web/tool-facts.mjs
- web/tools.mjs
- web/ux-copy.mjs
- web/worker.js
