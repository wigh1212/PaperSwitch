# SEO 점검 및 개선 기록 — 2026-09-13

대상: https://saerokbit.com/
이번 변경은 로컬 프로젝트에 적용했습니다. 배포된 사이트가 변경되었다는 뜻은 아닙니다.

## 배포 사이트에서 확인한 내용

- 홈과 PDF → JPG 페이지가 HTTP 200을 반환했습니다.
- 대표 주소가 saerokbit.com으로 지정되어 있었습니다.
- sitemap.xml과 robots.txt가 HTTP 200을 반환했습니다.
- ads.txt의 게시자 ID가 pub-6110796878581495로 일치했습니다.
- 존재하지 않는 주소는 HTTP 404를 반환했습니다.
- /ko/pdf-to-jpg는 404였습니다. 언어 변경은 같은 주소의 화면 번역에만 적용되어 있었습니다.
- 언어별 대체 페이지를 표시하는 hreflang이 없었습니다.
- robots.txt가 /assets/를 차단하여 페이지 렌더링에 필요한 스타일과 스크립트도 검색 로봇이 가져오지 못하는 구조였습니다.
- 홈의 검색 제목은 도구 기능을 설명하기보다 표어 중심이었습니다.
- 도구 설명이 짧고 관련 링크가 주로 동일한 입력 형식에 한정되어 있었습니다.

## 로컬 코드에서 개선한 내용

- 기존 영어 주소를 유지합니다. 한국어 /ko/, 일본어 /ja/, 중국어 /zh-cn/를 추가했습니다.
- 40개 페이지를 4개 언어의 완성된 HTML로 생성합니다. 총 160개이며, 페이지 수를 늘리기 위한 내용 복제 대신 실제 번역된 페이지입니다.
- JavaScript를 실행하지 않아도 언어별 제목, 설명, 사용법 및 FAQ를 읽을 수 있습니다.
- 각 페이지에 자신의 canonical, 4개 언어 hreflang과 x-default를 넣었습니다.
- 언어별 내부 링크와 하단 언어 링크를 연결했습니다.
- sitemap.xml에 160개 주소와 언어별 관계를 포함했습니다.
- 검색 로봇의 CSS/JavaScript 접근을 허용했습니다. 이전 화면 사본과 오류 페이지는 noindex로 처리합니다.
- 기본 도메인은 https://saerokbit.com으로 고정했습니다. www 및 HTTP는 기본 도메인으로 이동합니다.
- workers.dev 등 대체 호스트는 noindex로 처리하고 검색 로봇 접근을 차단합니다.
- 홈의 검색 제목과 설명을 PDF·이미지 변환 및 QR 도구 중심으로 개선했습니다.
- 해당되는 도구에 화질, 투명도, 텍스트 선택, OCR, 이미지 합치기, SVG, QR, 크기 변경 안내를 추가했습니다.
- 관련 도구에 역방향 변환도 포함되도록 개선했습니다.
- 사이트 및 탐색 경로 구조화 데이터를 추가했습니다. 별점·리뷰·리치 결과 노출을 주장하지 않습니다.
- 광고 코드는 모든 언어의 일반 페이지에 한 번씩 유지됩니다. 404에는 넣지 않습니다.
- 언어 선택 시 주소와 메타데이터가 바뀌며, 진행 중인 파일 선택은 유지합니다.

## 확인한 검사

- 160개 HTML의 언어, 제목, 대표 주소, hreflang, 내부 링크, 광고 코드, 구조화 데이터 및 HTTP 200.
- 사이트맵 160개 주소, robots.txt, ads.txt, 리디렉션, 404 및 noindex.
- JavaScript를 끈 상태에서 4개 언어의 본문과 FAQ 표시.
- 언어 왕복 전환, 뒤로 가기, 파일명과 선택 유지, 실제 PDF → JPG 변환.
- 한국어 홈과 모바일 도구 화면의 레이아웃.
- 기존 핵심 테스트 7개.

## 배포 후 할 일

1. 변경사항을 커밋·푸시하고 Cloudflare에서 빌드 pnpm run build, 배포 npx wrangler deploy로 반영합니다.
2. /ko/pdf-to-jpg, /ja/pdf-to-jpg, /zh-cn/pdf-to-jpg, /sitemap.xml, /robots.txt를 실제 사이트에서 다시 확인합니다.
3. Search Console에서 도메인 소유권을 확인하고 https://saerokbit.com/sitemap.xml을 제출합니다.
4. 대표 도구의 URL 검사에서 크롤링 가능 여부와 Google이 선택한 대표 주소를 확인합니다.
5. 실제 검색어·노출·클릭 데이터를 보고 우선순위가 높은 도구부터 사용 예시와 설명을 보강합니다.
6. 광고가 게재되는 실제 환경의 Core Web Vitals를 확인합니다. 이번 검사는 광고 노출을 차단한 기능 검증이며 광고 포함 성능 측정은 아닙니다.

검색 순위, 색인 완료, Search Console 등록 여부와 실제 방문자 수는 이번 코드 검사만으로 확인할 수 없습니다.

## 기준 자료

- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

