# Paper Switch 사이트 점검 및 개선 보고서

기준일: 2026-09-22. 이번 작업은 로컬 코드 개선이다. DNS·Cloudflare 배포·AdSense 설정·저장소 공개 설정을 변경하지 않았다. 로그인·회원가입을 추가하지 않았다. 승인 가능성을 높이는 방향으로 개선했으며 Google의 승인을 보장하지 않는다.

## 1. 현재 사이트 구조

대표 URL은 https://paperswitch.saerokbit.com 이다. 실제 공개 루트 https://saerokbit.com/ 은 대표 주소로 301 이동한다. [전체 경로/목적/엔진 및 소스 목록](SITE-ROUTES.md)을 함께 제공한다.

| 항목 | 코드 및 확인 결과 |
|---|---|
| 페이지 | 기존 204개에서 이용 안내 4개 언어를 더해 208개. 기능 47개는 그대로 |
| 기술 구조 | 정적 HTML 생성 + 브라우저 ES modules + Cloudflare Worker/Assets |
| 변환 | MuPDF WASM, jsPDF/svg2pdf, Canvas, HEIC 디코더, Tesseract OCR, GIF/QR 라이브러리 |
| 회원 기능 | 로그인·회원가입·계정 DB·결제 화면 없음. 계속 추가하지 않음 |
| API/서버 | Worker는 정적 자산 제공·색인 헤더·리디렉션. 문서 변환 API 없음 |
| 처리 | File/ArrayBuffer를 브라우저에서 읽어 Canvas/Worker로 처리; Blob 링크로 저장 |
| 저장 | 자체 localStorage는 paper-switch-language. 문서 DB/서버 파일 기록 없음. OCR cacheMethod는 none |
| 외부 통신 | Google 광고 스크립트, Cloudflare 호스팅. OCR 데이터·글꼴·WASM은 자체 자산 경로 |
| Analytics | 직접 관리하는 소스에서 GA/gtag/GTM/별도 analytics 설치를 찾지 못함. 계정 측 주입 설정은 별도 확인 |
| 광고 | adsbygoogle.js 공통 head 1회. 수동 광고 슬롯·가짜 다운로드 광고·자체 팝업 없음. 자동 광고 배치는 계정 설정 범위 |
| 안내 | About/Contact/Privacy/Terms를 모든 언어 footer에서 연결 |
| FAQ | 출력 형식·용도별 기존 FAQ 유지; 중복 컨테이너 통합. 모든 도구에 불필요한 동일 FAQ를 강제하지 않음 |
| SEO | 정적 title/description, canonical, hreflang, OG, 추가한 Twitter 카드, favicon, 언어별 sitemap |
| 구조화 데이터 | 실제 WebSite 및 BreadcrumbList 유지. 확인되지 않은 리뷰·평점·회사 정보·FAQ rich result 약속은 추가하지 않음 |

## 2. AdSense 관점의 핵심 문제와 우선순위

| 우선순위 | 수정 전 | 처리 및 남은 범위 |
|---|---|---|
| P0 | Privacy에 파일 처리와 광고/호스팅/이메일/저장 차이가 충분하지 않음 | 실제 코드에 따라 구분. 고정 삭제 기간·익명성·완전 보안 보장 없음 |
| P0 | 일본어 PDF→TXT의 OCR select가 320px에서 밖으로 나옴 | 선택 요소의 min-width/max-width/width 수정, 전체 다국어 모바일 재검증 |
| P0 | TXT→PDF 한국어에 깨진 문자, HEIC 설명에 존재하지 않는 페이지 선택 단계 | 깨진 문구 수정, HEIC는 사진 선택→변환/저장 흐름으로 정정 |
| P0 운영 확인 | 광고 동의 메시지/CMP 게시 상태를 코드로 확인할 수 없음 | 계정 접근 없이 완료로 표시하지 않음. 적용 지역 광고 운영 전 certified CMP 설정 확인 |
| P1 | 일부 일반 형식 변환 페이지는 형식명만 바뀌는 설명 중심 | 원본·출력 형식 특성, 선택한 PDF 페이지 제한, 출력 용량과 품질 한계를 추가 |
| P1 | 서비스 이용 안내 없음, 문의 답변 경로 불명확 | 4개 언어 이용 안내, 이메일 답변 방식 추가. 회사/주소/응답 SLA를 만들지 않음 |
| P1 | Twitter 메타와 이미지 alt 번역 동기화 누락 | 정적 및 런타임 언어 전환에 반영 |
| P1 | 별칭 도메인+비정규 경로가 Worker에서 추가 리디렉션 유발 가능 | Worker에서 호스트와 경로를 함께 정규화. Cloudflare의 별도 HTTP 리디렉션은 운영 설정 확인 대상 |
| P1 | 모든 일반 변환 진입 시 PDF 생성/OCR 코드 로드 | 필요한 변환 시점에 동적 로딩. 비압축 자산 약 1,809,068바이트 초기 로드 지연 |
| P2 | 모든 도구에 실제 샘플이 있는 것은 아님 | 핵심 5개 기존 실측 예시 유지. 추가 예시는 실제 변환 측정 후 확장 권장 |

낮은 가치 콘텐츠 거절이 위의 어느 한 항목 때문이라고 확정하지 않았다. 단순히 글자 수나 페이지 수를 늘리지 않고 사용자 판단에 필요한 정보로 개선했다.

## 3. 실제 수정한 파일

변경 범위는 아래 표의 소스와 테스트, 본 보고서 및 경로 목록이다. 의존성을 추가하지 않았다.

## 4. 파일별 수정 전후

| 파일 | 변경 |
|---|---|
| web/service-content.mjs (신규) | 4개 언어 개인정보·이용 안내·문의 답변 방식 |
| web/tool-facts.mjs (신규) | 원본/출력의 실질적 차이와 처리 제한 문구 |
| scripts/build-web.mjs | 정책 페이지·footer·형식 정보·404 복귀 링크 생성 |
| scripts/build-seo.mjs | Terms 경로/사이트맵 연결, FAQ 통합, alt/title 번역, Twitter metadata |
| web/site.js | 새 콘텐츠의 런타임 번역 등록 |
| extension/i18n.js | alt와 Twitter metadata 언어 동기화 |
| web/copy.mjs | 깨진 한국어 텍스트 수정 |
| web/ux-copy.mjs | HEIC의 잘못된 사용 단계 수정 |
| web/site.css | 도구 정보·정책 표시 및 모바일 OCR 너비 수정 |
| web/worker.js | Terms 정규 경로, 별칭 호스트/경로 동시 정규화 |
| extension/services/conversion-service.js | PDF 생성 번들을 필요한 작업에서 동적 import |
| extension/services/pdf-worker-client.js | OCR 실제 실행 시 Tesseract import, 취소 상태 확인 |
| tests/site-audit.mjs (신규) | 208개 경로, 고유 메타, 파일/내부 링크, 정책 연결, 번역 인코딩, 404 검증 |
| tests/web-site-audit.mjs (신규) | 156개 비영어 페이지 320px 렌더링/입력 요소/런타임 오류 검사 |
| tests/web-browser.mjs | 현재 메뉴/검색용 제목에 맞춰 기존 변환 회귀 테스트 갱신 |
| tests/sitemaps.test.mjs, tests/web-ui-seo.mjs, tests/web-seo.mjs | Terms를 실제 경로 집합에 포함 |
| tests/worker-indexing.test.mjs | 별칭 도메인과 .html 경로 동시 정규화 검증 |
| package.json | 사이트 감사 테스트 실행 명령 추가 |

## 5. 아직 수정하지 않은 문제

- AdSense 계정의 CMP/Privacy & messaging 게시 여부, 광고 기술 제공자 목록과 실제 자동 광고 배치: 계정 접근 없음. 사이트 문구로 동의 완료를 가장하지 않았다.
- 운영자의 법적 실명·주소·관할·로그와 이메일 보관 정책: 사용자에게 제공받지 않은 값을 만들지 않았다. 현재 공개 문의 주소는 사용자가 제공한 glsrhfo17@gmail.com이며 수신함 전달/응답 가능성은 메일 발송 없이 확인할 수 없다.
- MuPDF/HEIC 원본 소스와 배포 바이너리의 정확한 native 빌드 대응: 기존 [라이선스 점검](LICENSING-STATUS.md)의 미해결 항목 유지. 소스와 고지를 제공하는 것을 법률 검증 완료로 표현하지 않는다.
- 전체 브라우저/실기기·Google 심사 봇·지역별 광고 결과는 로컬 Chrome 테스트만으로 확정할 수 없다.
- 실제 Search Console 미색인 사유/직접 조치는 계정 보고서로 확인해야 한다.

## 6. 추가로 권장하는 콘텐츠

기존 5개 도구의 실측 예시를 기준으로, PDF 병합·분할은 페이지 순서가 보이는 자체 제작 3페이지 예시, SVG는 외부 참조 실패와 임베딩 예시, QR은 최종 인쇄 크기에서 실제 스캔한 결과를 추가하는 것이 유용하다. 검증하지 않은 테스트 결과·가짜 사용자 후기·일률적인 긴 FAQ는 추가하지 않는다. 비슷한 키워드용 별도 페이지를 만들 필요는 없다.

## 7. 기술적인 문제와 검증

- 입력 검사는 도구별로 확장자/크기/디코더/일부 매직바이트를 사용한다. MIME/악성코드 검사가 모든 입력에 동일하게 적용되는 것은 아니다. 바이러스 검사 또는 완전한 악성 파일 차단을 제공한다고 쓰지 않는다.
- SVG는 script/foreignObject/event/external resource를 거부하고 HTML은 허용 요소만 보존하며 sandbox와 CSP로 스크립트·외부 요청을 제한한다. 이것이 모든 라이브러리 취약점에 대한 보증은 아니다.
- 이미지 픽셀 제한 중 일부는 decode 이후 검사한다. 매우 큰/손상된 압축 입력은 디코딩 중 메모리 부담을 일으킬 수 있어 원시 헤더 크기 사전 확인과 의존성 업데이트는 향후 보강 항목이다.
- 변환 API가 없으므로 서버 변환 rate limit도 없다. 호스팅 WAF/rate limiting 설정은 이 저장소에서 확인되지 않는다.
- 404는 실제 공개 응답 404/noindex 확인. 로컬 Node 미리보기는 Worker의 리디렉션/헤더를 그대로 구현하지 않아 단위 테스트와 공개 응답을 별도로 검증했다.
- 전체 build, 정적 감사, 실제 변환/다운로드, 편집, 압축, QR, HEIC, GIF, HTML→PDF 테스트를 수행했다. 광고 스크립트는 로컬 브라우저 테스트에서 차단하여 도구 자체 동작을 분리 확인했다.
- 초기 대형 라이브러리 지연 로딩과 스캔 PDF OCR 결과를 확인했다. 실제 사용자 CWV/LCP/INP/CLS 또는 네트워크 압축 후 절감치는 측정하지 않았다.

## 8. SEO 문제

공개 메인/한국어 이미지 압축은 HTTP 200, 올바른 paperswitch.saerokbit.com canonical, noindex 없음. 양 도메인의 ads.txt는 200/text/plain/제공받은 게시자 ID였다. 루트 robots는 Allow이고, 루트 홈은 대표 서비스로 301 이동했다. /ko/about/은 정규 /ko/about으로 이동하며 HTTP→HTTPS는 별도 Cloudflare 계층 때문에 추가 단계가 남을 수 있다. DNS나 외부 규칙을 변경하지 않았다.

모든 기본 페이지는 하나의 H1, 언어별 고유 title/description, 5개 hreflang(4개 언어+x-default), OG/Twitter를 제공한다. Terms 4개를 언어별/통합 사이트맵에 추가했다. 가짜 lastmod나 별점은 추가하지 않았다. sitemap이 정상이어도 개별 페이지 색인은 보장되지 않는다.

## 9. Privacy/Terms 관련 문제

Privacy는 브라우저 처리와 사이트 접속/광고/메일 처리를 분리하고, localStorage 키, 다운로드/캐시, 서버 재다운로드 기능 부재, Google 광고 개인화 관리 링크, Cloudflare 정책 링크를 설명한다. Terms는 사용 권한, 결과 검토, 원본 보관, 서비스 중단 가능성, 소프트웨어와 문서 권리 구분 및 문의를 담은 최소 운영 안내다. 관할별 모든 법적 요구 충족을 인증하는 문서가 아니다. Google 광고 코드를 사용하는 사실은 광고 홍보 문구가 아니라 개인정보 안내에 필요한 실제 동작으로 기재했다.

## 10. 모바일 UX 문제

320px 한국어·일본어·중국어 156페이지의 문서 너비와 화면에 보이는 입력 요소를 검사했다. 일본어 PDF→TXT OCR select 넘침을 수정한 뒤 통과했다. 공통 메뉴는 키보드 Enter/Escape와 320/390px에서 확인했다. 정책 페이지의 실제 스크린샷도 확인했다. 네이티브 iOS/Safari 파일 선택과 실제 광고 삽입 후 배치는 별도 확인해야 한다.

## 11. 배포 전후 확인 목록

- [ ] 변경 diff 확인 후 기존 Cloudflare 방식으로 배포한다. 이번 작업에서 배포하지 않았다.
- [ ] /ko/privacy, /ko/terms, /about, /contact 및 모든 언어 footer 연결을 운영에서 확인한다.
- [ ] 실제 받은 편지함으로 사용자 문의를 받을 수 있는지 운영자가 확인한다.
- [ ] AdSense Privacy & messaging에서 적용 지역의 Google 인증 CMP와 광고 기술 제공자 설정을 확인한다.
- [ ] 자동 광고가 업로드/변환/다운로드를 가리거나 오인시키지 않도록 모바일 실제 표시를 확인한다.
- [ ] 두 도메인의 ads.txt, robots, 대표 canonical과 신규 Terms 사이트맵 항목을 확인한다.
- [ ] 소스/라이선스 파일 다운로드와 기존 버전 원본 보존을 확인한다.
- [ ] 실제 모바일 Safari/Android에서 PDF·이미지 업로드, 결과 저장을 확인한다.
- [ ] Search Console 실시간 검사와 AdSense 진단을 별도로 확인하고, 수정 내용이 공개된 뒤 재검토를 요청한다.

## 공식 기준

- https://support.google.com/adsense/answer/7299563?hl=ko — 고유 콘텐츠와 탐색/사용 경험
- https://support.google.com/adsense/answer/12176698?hl=ko — 사이트 접근·콘텐츠·정책과 재검토
- https://support.google.com/adsense/answer/1348695 — 광고 쿠키 관련 필수 안내
- https://support.google.com/adsense/answer/13554020 — 적용 지역 동의 관리 요구
- https://developers.google.com/search/docs/essentials/spam-policies — doorway/대량 콘텐츠 관련 정책

이 기준을 근거로 개선했으며 심사 내부 점수나 승인 확률을 추정하지 않았다.
