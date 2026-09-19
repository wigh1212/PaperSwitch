# 사이트맵 및 색인 점검

## 운영 사이트 확인 결과
https://paperswitch.saerokbit.com/sitemap.xml 에 포함된 192개 고유 URL을 전부 요청했습니다.
모두 HTTP 200이며 noindex 헤더·메타태그, 리디렉션, canonical 불일치는 발견되지 않았습니다.
이 점검은 일반 HTTP 요청 기준이며 Googlebot의 실제 수집·색인 완료를 증명하지 않습니다.
사용자가 보고한 미색인 47개의 정확한 URL과 제외 사유는 아직 확인되지 않았습니다.

## 변경 사항
- /sitemap-index.xml: 언어별 사이트맵 4개를 안내하는 인덱스.
- /sitemap-en.xml, /sitemap-ko.xml, /sitemap-ja.xml, /sitemap-zh-cn.xml: 각 48개 URL.
- /sitemap.xml: 기존에 제출한 전체 192개 URL 목록을 유지.
- 모든 페이지에 4개 언어와 x-default 연결을 유지.
- 빌드 시 실제 HTML 존재, canonical 일치, noindex 제외, 언어 연결 및 중복 URL 검증.
- 정확한 페이지별 변경 이력이 없으므로 임의의 lastmod 날짜는 넣지 않음.

## 배포 후
1. Search Console에서 현재 주소 속성을 선택합니다.
2. Sitemaps에서 https://paperswitch.saerokbit.com/sitemap-index.xml 을 제출합니다. 기존 sitemap.xml은 삭제할 필요 없습니다.
3. 페이지 색인 보고서에서 미색인 사유 행을 열고 예시 URL을 확인합니다. 가능하면 CSV를 내보내 원인별로 비교합니다.
4. 중요한 실제 페이지 1~2개를 URL 검사 → 실제 URL 테스트로 확인하고 색인 생성을 요청합니다.

사이트맵 분리는 언어별 진단을 돕기 위한 것이며 색인을 보장하거나 미색인 47개를 자동 해결하는 것은 아닙니다.
Google 안내: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
