# Paper Switch 광고 및 색인 점검

2026년 10월 6일 공개 사이트 HTTP/HTML과 로컬 생성 결과를 확인했습니다. 공개 사이트와 로컬 수정본은 서로 다른 상태입니다. 이번 수정은 아직 배포하지 않았습니다.

## 지금 수정한 사항

- 한국어를 기본 언어로 변경했습니다. 대표 주소 `/` 및 접두사 없는 도구 주소는 한국어, 영어는 `/en/`입니다. 일본어 `/ja/`, 중국어 `/zh-cn/`는 유지합니다.
- 기존 `/ko/…`는 해당 한국어 대표 주소로 301 연결하며 쿼리를 보존합니다. 영어의 기존 접두사 없는 주소는 한국어로 바뀌므로, 영어 링크를 공유하는 곳은 `/en/…`로 갱신해야 합니다.
- canonical, hreflang, x-default, 언어별 사이트맵과 브라우저의 언어 전환 경로가 새 주소 규칙을 함께 사용합니다.
- 상단의 도구 화면은 유지하고 사용법과 예제를 아래에 배치했습니다. JavaScript가 없어도 안내는 HTML에서 읽을 수 있습니다.
- `<base href="/assets/">`가 있는 도구에서 `#tool-guide` 링크가 `/assets/`로 이동하지 않도록 언어별 페이지 경로를 포함했습니다.
- 공개 사이트의 페이지별 점검 결과를 저장하는 `scripts/audit-public-site.mjs`와 기본 언어·안내 링크 검사를 추가했습니다.

## 공개 사이트에서 확인한 사항

현재 공개 사이트는 여전히 영어 기본 구조입니다. 공개 사이트맵에 있는 208개 URL 모두 HTTP 200, 자기 주소 canonical, 설명 메타 태그, H1 하나가 있으며 HTTP 및 HTML robots에서 noindex가 발견되지 않았습니다. JSON-LD도 파싱되었습니다. 원본 결과는 `test-results/public-site-audit.json`에 있습니다.

| 항목 | 확인 결과 |
| --- | --- |
| 광고 스크립트 | 공개 208개 페이지 전체에 `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6110796878581495` 포함 |
| 수동 광고 슬롯 | 검사한 HTML에는 `data-ad-slot` 없음. 자동 광고 설정과 실제 광고 표시 여부는 계정 및 브라우저 확인 필요 |
| Privacy | Google 광고 코드 로드 안내를 유지해야 함. 실제 스크립트 포함 상태와 일치 |
| ads.txt | HTTP 200. `google.com, pub-6110796878581495, DIRECT, f08c47fec0942fa0` |
| robots.txt | HTTP 200. 전체 크롤링 허용 및 사이트맵 두 경로 안내 |
| 사이트맵 | sitemap.xml과 sitemap-index.xml HTTP 200. 로컬 검사는 4개 언어 사이트맵과 canonical 일치까지 확인 |
| 구조화 데이터 | 홈 WebSite, 나머지 BreadcrumbList. 도구 기능 설명과 사용법은 실제 HTML에 유지 |
| 404 | 실제 HTTP 404, HTTP noindex, 광고 코드 없음 |
| assets/index.html | HTTP 307, HTTP noindex, 응답에 광고 코드 없음 |
| 실제 Google 색인 | 공개 HTML 검사로 확인할 수 없음. Search Console URL 검사 필요 |

광고 스크립트가 존재하는 것과 광고 노출·애드센스 승인 상태는 별개입니다. 계정의 자동 광고 설정, 사이트 심사 상태, ads.txt 승인 상태는 이번 점검으로 확인하지 못했습니다.

## 유지할 사항

광고 연결 코드를 이유 없이 제거하지 않습니다. Google은 이 코드를 사이트 연결 방법으로 안내합니다. 파일을 브라우저에서 처리하는 기능, 실제 결과 예제, 개인정보처리방침, 연락처, 이용 안내, 언어별 링크도 유지합니다. 미리보기와 404의 noindex를 제거하거나 정적 리소스를 robots.txt로 막지 않습니다.

## 배포 후 재신청 전에 확인할 URL

- https://paperswitch.saerokbit.com/ — JavaScript 없이도 한국어 제목과 도구 링크가 있는지
- https://paperswitch.saerokbit.com/en/ — 영어 홈 및 영어 도구 링크가 정상인지
- https://paperswitch.saerokbit.com/ko/ — `/`로 한 번만 301 연결되는지
- https://paperswitch.saerokbit.com/jpg-to-pdf — 파일 선택·변환·다운로드와 안내 링크
- https://paperswitch.saerokbit.com/pdf-to-jpg — 결과 예제와 제약사항
- https://paperswitch.saerokbit.com/compress-pdf — 실제 압축 결과와 용량 설명
- https://paperswitch.saerokbit.com/privacy — 광고·파일 처리 안내
- https://paperswitch.saerokbit.com/about 및 /contact 및 /terms — 한국어 내용과 이동 링크
- https://paperswitch.saerokbit.com/ads.txt 및 https://saerokbit.com/ads.txt — AdSense에 등록한 도메인의 게시자 ID가 계정과 같은지
- https://paperswitch.saerokbit.com/robots.txt 및 /sitemap-index.xml 및 /sitemap.xml — 접근 가능하고 새 주소만 포함하는지
- https://paperswitch.saerokbit.com/missing-audit-page — 404 및 noindex 유지

배포 후 `node scripts/check-live-seo.mjs`로 새 한국어 주소 규칙까지 검사할 수 있습니다. Search Console에서는 대표 홈과 주요 도구의 URL 검사, Google이 선택한 canonical, 마지막 크롤링 결과를 확인하고 새 사이트맵을 제출합니다. 계정 접근 없이 색인 성공이나 재심사 승인 여부를 추정하지 않습니다.

참고: [Google 사이트 연결 안내](https://support.google.com/adsense/answer/7584263?hl=en), [ads.txt 크롤링 안내](https://support.google.com/adsense/answer/7679060?hl=en), [Search Console 점검 안내](https://developers.google.com/search/docs/monitor-debug/search-console-start?hl=en).
