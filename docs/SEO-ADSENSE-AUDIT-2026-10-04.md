# PaperSwitch SEO·크롤링·AdSense 점검 및 수정 보고서

점검일: 2026-10-04 (한국 시간)
대표 사이트: https://paperswitch.saerokbit.com/
범위: 직접 관리하는 web/extension/src/scripts/tests, 패키지·Cloudflare 설정, 생성 HTML, 공개 HTTP 응답. 외부 의존성의 전체 소스 보안 감사나 Google 계정 내부 검사는 아니다. 이번 수정은 로컬에 반영했으며 배포·푸시·Search Console 제출·AdSense 재검토 요청은 하지 않았다.

## 1. 발견한 문제

- **개발 광고 실행:** 공통 HTML의 AdSense 코드가 로컬 및 workers.dev 미리보기에도 포함됐다. 운영 사이트용 코드와 개발 테스트를 분리할 필요가 있었다.
- **검사 범위의 빈틈:** 기존 정적 감사는 hreflang 개수와 일부 canonical만 확인했다. 대응 언어 URL, 전체 사이트맵 일치, 검색 페이지의 nofollow/none, 홈에서의 링크 도달 가능성을 추가로 확인할 필요가 있었다. 이는 검사의 부족이며, 현재 운영 페이지의 해당 설정이 틀렸다는 뜻은 아니다.
- **경로 정의 중복:** Worker와 SEO 빌드가 같은 페이지 목록을 각각 선언해 향후 도구 추가 시 누락될 여지가 있었다.
- **일부 변환 설명의 구체성 부족:** SVG PNG/JPG/PDF, TIFF PDF/PNG, WEBP PNG 설명이 출력 형식 중심의 일반 문구를 사용했다. 실제 배율·페이지·투명도 동작을 구분할 필요가 있었다.
- **예시 부족:** SVG PNG에서 배율 선택 결과를 직접 내려받아 비교할 수 없었다.
- **접속되지 않는 별칭:** 이 환경에서 www.saerokbit.com 및 www.paperswitch.saerokbit.com을 조회할 때 ENOTFOUND가 발생했다. 코드의 www 리디렉션은 있지만 DNS에서 접속하지 못하면 Worker까지 도달하지 않는다. 주 도메인은 정상이며 이 별칭들은 canonical이나 사이트맵에 포함하지 않는다.

현재 공개 208개 페이지는 200 응답, 자기 자신을 가리키는 canonical, 올바른 언어별 hreflang을 반환했다. 임의의 없는 URL은 실제 404/noindex였다. robots와 ads.txt 누락은 재현되지 않았다. Search Console의 미색인 사유 및 AdSense의 낮은 가치 판단을 특정 코드 한 곳의 문제로 확정하지 않는다.

## 2. 실제 수정한 파일

| 파일 | 수정 내용 |
|---|---|
| web/routes.mjs | 52개 기본 경로 정의를 공유 |
| web/worker.js | 공유 경로 사용, 비공개 미리보기 HTML에서 표시용 광고 제거 |
| web/preview-ads.mjs | 직접 생성한 광고 표시만 제거하는 공통 함수 |
| scripts/preview-web.mjs | 로컬 광고 제외, noindex 및 no-store 응답 |
| scripts/build-web.mjs | 광고 태그 식별, 실제 SVG 예시 삽입, 홈의 접힌 비교 이미지 지연 로딩 |
| scripts/build-seo.mjs | 공유 경로 및 새 예시의 정적 다국어 번역 연결 |
| web/site.js | SVG PNG 페이지에서만 예시 번역 모듈 로딩 |
| web/editorial-copy.mjs | 도구 6개의 소개·검색 설명을 4개 언어로 구체화 |
| web/vector-example-copy.mjs | 배율·투명도·입력 문제 안내 번역 |
| scripts/vector-example.mjs | 실제 파일과 측정값을 보여주는 예시 HTML |
| scripts/generate-vector-example.mjs | 실제 변환 서비스로 예시를 재생성하는 절차 |
| web/examples/vector-scale.svg, vector-scale-1x.png, vector-scale-3x.png, vector-measurements.json | 직접 만든 SVG, 실제 출력 2개 및 측정값 |
| web/site.css | 해당 예시의 작은 화면 배치 |
| tests/site-audit.mjs | 정확한 hreflang/사이트맵/canonical, 지시문, 링크 도달성, 의미 구조, 광고 중복 검사 |
| tests/worker-indexing.test.mjs | 미리보기 광고 제외 및 URL 정규화 회귀 검사 |
| tests/vector-example.test.mjs | 실제 PNG 헤더·크기·다운로드 파일·다국어 본문 검사 |
| scripts/check-live-seo.mjs | 운영 208페이지와 robots·사이트맵·404·리디렉션 검사 |
| scripts/check-syntax.mjs | 직접 관리하는 JavaScript 문법 검사 |
| package.json | seo:check, seo:live, check:syntax 명령 추가 |

## 3. 수정 내용과 기존 구조 유지

React/Vite CSR 앱이 아니라 기존 JavaScript 변환 UI를 도구별 HTML로 생성하는 구조다. title, description, H1, 본문, canonical, hreflang, 내부 링크, JSON-LD는 빌드 결과에 이미 존재한다. Cloudflare Worker가 호스트와 URL을 정규화하고 정적 자산을 제공한다. 프레임워크 변경은 필요하지 않았다.

회원가입 없는 흐름, 47개 도구, 간결한 홈, 한국어·영어·일본어·중국어, 기존 변환 엔진을 유지했다. 검색용 페이지를 늘리지 않았다. 길이를 채우기 위한 글이나 가짜 후기·테스트 이력은 추가하지 않았다.

SVG PNG 예시는 320 x 160 원본을 실제 변환 서비스로 처리했다. 1배 PNG는 320 x 160 / 5,953바이트, 3배 PNG는 960 x 480 / 29,083바이트였다. 픽셀 수는 9배지만 용량은 9배가 아니며 두 결과 모두 여백이 흰색이라는 점을 설명한다. 해당 브라우저와 샘플의 측정값으로 한정했고 다운로드로 확인할 수 있다.

## 4. Google 크롤링·색인 측면에서 개선된 점

- 앞으로 페이지가 추가될 때 Worker와 SEO 빌드가 같은 경로 목록을 사용한다.
- 개수뿐 아니라 각 hreflang의 실제 대응 주소와 x-default를 검사한다.
- canonical URL 집합과 사이트맵 URL 집합의 누락·중복을 검사한다.
- 모든 208개 언어별 페이지가 홈에서 실제 a href 연결을 따라 도달 가능한지 검사한다.
- 기본 언어/언어별 홈의 슬래시, .html, /en/ 별칭, 호스트 변경은 기존 301 정책을 유지하고 회귀 검사한다.
- 공개 HTTP 검사 스크립트는 Google 색인 결과를 조회하거나 순위를 스크래핑하지 않는다. 응답 코드·정적 HTML만 확인한다.

새 명령:

```text
pnpm run seo:check
pnpm run seo:live
pnpm run check:syntax
```

공개 점검 기록은 test-results/live-seo.json, 추가 호스트/헤더 점검은 test-results/live-seo-before.json에 남는다. 이 파일들은 배포 소스 공개 묶음에 포함하지 않는다.

## 5. AdSense 심사 측면에서 개선된 점

사용자가 변환 전에 판단할 수 있는 배율·투명도·TIFF 페이지 처리 정보를 보강했다. 개발 화면의 광고 실행을 없애 실제 운영용 광고와 구분했다. 기존 광고는 도구 버튼을 흉내 내지 않으며, 수동 광고 슬롯은 실제 광고 단위 ID를 설정할 때만 생성한다. 광고 승인·자동 광고 배치·동의 메시지는 계정 설정 범위이므로 이번 코드 변경만으로 완료라고 할 수 없다.

About, Contact, Privacy, Terms는 기존 4개 언어 페이지와 모든 페이지 하단 링크를 확인했다. 브라우저 내 파일 처리와 Cloudflare 접속/Google 광고/이메일 처리를 구분하는 개인정보 안내를 유지했다. GA/gtag/GTM은 직접 관리하는 코드에 없으며 Cloudflare 대시보드에서 별도로 주입하는 기능은 확인하지 못했다. 실제 운영자 실명·주소·보관 기간을 만들지 않았다.

고유하고 유용한 콘텐츠와 쉬운 탐색이 Google의 안내 방향이다. 이번 수정이 낮은 가치 콘텐츠 거절 사유를 모두 해소하거나 승인을 보장한다고 표현하지 않는다. [AdSense 사이트 준비 안내](https://support.google.com/adsense/answer/7299563?hl=ko)

## 6. sitemap / robots / canonical / hreflang 상태

| 항목 | 확인 상태 |
|---|---|
| 정규 도메인 | https://paperswitch.saerokbit.com |
| 정규 홈 | /, /ko/, /ja/, /zh-cn/ |
| 도구·안내 페이지 | 끝 슬래시 없는 경로 |
| sitemap.xml | canonical 208개, 중복·누락 없음 |
| sitemap-index.xml | 언어별 4개 사이트맵 연결 |
| robots.txt | Allow: /, 두 사이트맵 위치 명시, JS/CSS 차단 없음 |
| canonical | 각 언어 페이지 자신을 참조, 파라미터 없는 URL |
| hreflang | en, ko, ja, zh-CN, x-default. 같은 도구끼리 연결 |
| noindex | 공개 검색 페이지에는 없음. 미리보기·자산·404에는 의도적으로 유지 |
| ads.txt | 루트 도메인과 서비스 도메인에서 200, text/plain, pub-6110796878581495 확인 |
| lastmod | 미기재 유지. 페이지별 실제 수정일 기록이 없어 빌드 시간을 수정일로 넣지 않음 |
| 구조화 데이터 | WebSite/BreadcrumbList 유지. 가짜 평점·보이지 않는 FAQ는 추가하지 않음 |

lastmod는 검증 가능한 실질적 수정일이 있을 때 유효하다. 사이트맵 제출은 크롤링·색인 보장이 아니다. [Google 사이트맵 안내](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## 7. 아직 사람이 직접 해야 하는 작업

- 변경 사항을 Cloudflare에 배포하고 공개 주소에서 다시 seo:live를 실행한다. 로컬 수정은 아직 운영 반영 전이다.
- www 별칭을 사용할 계획이라면 Cloudflare DNS와 해당 호스트의 라우팅/인증서를 확인한다. 사용하지 않는 별칭을 사이트맵에 추가할 필요는 없다.
- AdSense의 자동 광고 미리보기에서 메뉴·파일 선택·변환·다운로드 주변을 확인하고 필요한 영역을 제외한다.
- EEA·영국·스위스 광고 운영에 해당하는 Google 인증 CMP 게시 상태를 확인한다. 코드만으로 설정 완료를 확인할 수 없다. [Google 동의 관리 요건](https://support.google.com/adsense/answer/13554020?hl=ko)
- 공개 문의 이메일로 실제 수신·응답이 가능한지 운영자가 확인한다. 이번 작업에서 메일을 보내지 않았다.
- 기존 docs/LICENSING-STATUS.md의 MuPDF native 빌드 대응 확인 과제는 남아 있다. 소스·라이선스 고지와 다운로드는 유지하며 완전한 법률 검증으로 표현하지 않는다.

## 8. Search Console에서 할 작업

1. https://paperswitch.saerokbit.com/ 속성 또는 이를 포함하는 도메인 속성을 선택한다.
2. Sitemaps에서 https://paperswitch.saerokbit.com/sitemap-index.xml을 제출하고 처리 상태를 확인한다. 기존 sitemap.xml도 유효하므로 급하게 삭제할 필요가 없다.
3. 배포 후 /ko/svg-to-png, /ko/image-compressor, /ko/webp-to-jpg 등 대표 페이지를 실시간 검사한다. 페이지 가져오기, 색인 허용, 사용자 선언 canonical과 Google 선택 canonical을 비교한다.
4. 변경한 주요 페이지에 색인 생성을 요청한다. 동일 URL을 반복 요청하는 것으로 처리 속도가 빨라지지는 않는다. [재크롤링 요청 안내](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
5. 미색인 목록의 정확한 사유와 예시 URL을 내려받는다. '발견됨', '크롤링됨', '중복', '소프트 404'는 후속 대응이 다르다. 공개 HTML 검사만으로 이 분류를 확인할 수 없다.

## 9. AdSense 재심사 전 확인할 작업과 검증 결과

- 이번 변경이 실제 운영 주소에 배포됐는지 확인한다.
- SVG 예시 원본과 결과, 이미지 압축과 PDF 등 주요 도구의 다운로드를 실제 기기에서도 확인한다.
- 사이트 상태의 낮은 가치 콘텐츠 사유, ads.txt 상태, 동의 설정과 모바일 자동 광고 위치를 확인한다.
- 사이트 변경이 공개된 뒤 재검토를 신청한다. 특정 글자 수·글 개수·방문자 수를 승인 기준으로 단정하지 않는다.

검증: 잠금 파일을 유지한 의존성 설치, 전체 build, SEO 정적/라우팅 검사, JavaScript 문법 검사, 23개 단위 테스트 통과. 운영 사이트는 208개 페이지와 리디렉션·404·사이트맵 등을 합한 222개 검사 통과. 모바일 및 실제 변환 브라우저 검증 결과는 아래 추가 기록에 남긴다.

별도의 스타일 lint 도구는 기존 프로젝트에 없다. check:syntax는 112개 직접 관리 JavaScript 모듈의 문법 검사이며 ESLint나 전체 보안 감사로 대신 표시하지 않는다. 실제 사용자 Core Web Vitals 데이터는 측정하지 않았다. 변환 라이브러리의 기존 지연 로딩을 유지하고 새 예시 번역 모듈은 SVG PNG에서만 로딩하며 이미지는 크기와 지연 로딩을 지정했다.

## 10. 추가로 추천하는 콘텐츠

다음은 별도 글을 대량 생성하기보다 해당 도구 안에 실제 파일로 추가하면 유용하다.

- PDF 합치기: 페이지에 번호가 적힌 자체 제작 PDF 두 개와 파일 순서를 바꾼 결과 비교.
- PDF TXT: 같은 문장을 텍스트 PDF와 스캔 PDF로 만든 뒤 OCR 오인식 위치를 실제 측정한 예시.
- QR: 최종 인쇄 크기와 여백을 바꾼 실제 스캔 기록. 검증하지 않은 성공률은 쓰지 않는다.

정보를 접어 제공하는 일반적인 UI는 Google이 설명하는 숨겨진 텍스트 남용과 구분된다. 실제 사용자가 펼쳐 볼 수 있는 기존 안내와 원본 다운로드를 유지했다. [Google 검색 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies)

## 최종 체크리스트

완료 표시는 공개 사이트 또는 로컬 빌드에서 확인한 기술 항목이며, Google의 색인·광고 승인을 의미하지 않는다. 새 수정의 운영 배포는 별도다.

- [x] robots.txt 정상
- [x] sitemap.xml 정상
- [x] canonical 정상
- [x] hreflang 정상
- [x] 공개 검색 페이지에 noindex 문제 없음
- [x] 주요 페이지 HTTP 200 — 공개 208페이지
- [x] 없는 페이지 HTTP 404 — 공개 임의 경로 및 Worker 검사
- [x] 각 도구 unique title
- [x] 각 도구 unique description
- [x] 각 도구 H1
- [x] 내부 링크 정상
- [x] About
- [x] Contact
- [x] Privacy Policy
- [x] Terms
- [x] ads.txt
- [x] AdSense 코드 중복 검사 및 개발 미리보기 제외
- [x] 모바일 UI — 자동 광고 실제 표시/모든 실기기 보장은 제외
- [x] build 성공
- [ ] lint 성공 — 기존 lint 미설정. 대신 check:syntax 통과
- [x] SEO 검사 성공
- [ ] 이번 변경 운영 배포
- [ ] Search Console 실제 미색인 사유 확인
- [ ] AdSense 동의 설정·자동 광고 확인 및 재검토 요청

최종 브라우저 확인: 홈 4개 언어·키보드 탐색·320/390px 및 JavaScript 미사용 화면, 비영어 156페이지 320px, 실제 일반 변환 32종·PDF 합치기·QR 생성/읽기·리사이즈 통과. 기존 20개 언어별 실측 안내와 3종 래스터 비교의 4개 언어·다운로드 검사 통과. 새 SVG 예시의 4개 언어·파일 다운로드·언어 전환·390px 화면 통과. 광고 차단 도구를 쓰지 않은 로컬 검증에서도 Google 광고 네트워크 요청은 0건이며 홈에서 SVG 예시 전용 모듈을 불러오지 않음을 확인했다. 실제 광고 계정 설정과 모든 기기의 동작을 검증했다는 뜻은 아니다.
