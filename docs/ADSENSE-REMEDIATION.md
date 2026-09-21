# 2026-09-22 콘텐츠 및 ads.txt 개선

## 확인된 문제
- 운영 saerokbit.com/ads.txt와 paperswitch.saerokbit.com/ads.txt는 모두 HTTP 200, text/plain, 올바른 게시자 ID를 반환했다.
- 루트 saerokbit.com/robots.txt가 Disallow: / 로 모든 크롤링을 차단했다. 루트의 ads.txt에도 noindex 응답 헤더가 붙었다. robots 차단은 수집에 지장을 줄 수 있지만 AdSense 미발견 표시의 단일 원인으로 확정할 수 없다.
- 루트 도메인이 서비스와 같은 HTML을 제공하고 있었다. 서비스 대표 주소는 paperswitch.saerokbit.com이다.
- 제공된 정책 도움말 이미지만으로 Search Console 직접 조치가 실제 발생했다고 판단할 수 없다. AdSense의 낮은 가치 콘텐츠 거절과 검색 직접 조치는 별도로 확인해야 한다.

## 이번 변경
- JPG→PDF, PDF→JPG, PDF 압축, 이미지 압축, HEIC→JPG의 5개 기존 페이지에 실제 측정 결과, 설정 선택법, 실패 원인, 한계를 4개 언어로 제공했다.
- 4개 도구의 입력과 출력 예시는 직접 제작한 보고서다. 공개 샘플 다운로드로 결과를 재검토할 수 있다.
- HEIC는 libheif 공개 예제를 실제 엔진으로 변환한 측정값과 원본 출처 링크를 제공한다. 사진 파일을 재배포하거나 자체 제작 사진이라고 주장하지 않는다.
- PDF 압축 예시는 일부러 내부 압축 없이 저장한 문서임을 밝힌다. 일반적인 압축률로 오인하지 않도록 안내한다.
- 새 키워드 페이지, 검색용 숨김 문구, 사용자를 다른 도구로만 보내는 중간 페이지를 추가하지 않았다. 페이지 수는 기존 204개 그대로다.
- 루트와 www 루트의 일반 URL은 서비스 대표 주소로 301 이동한다. ads.txt는 정확한 기존 내용을 직접 제공하고 robots.txt에서 수집을 허용한다. 별도 미리보기 호스트는 기존 차단을 유지한다.

## 검증
- 20개 언어별 가이드 본문, 실제 파일 크기, 다운로드, 언어 전환, 모바일 폭 검사 통과.
- 실제 공개 PDF 샘플 3페이지의 원본/압축 결과를 렌더링해 픽셀 일치 확인.
- 전체 204페이지 제목·대표 주소·언어 링크·내부 링크·사이트맵 검사 통과.
- 16개 단위 테스트 통과. 루트 ads.txt, robots, 리디렉션 테스트 포함.
- 예시 생성은 scripts/generate-content-examples.mjs, HEIC 측정은 scripts/measure-heic-example.mjs 순서로 실행. 로컬 미리보기와 PLAYWRIGHT_MODULE 필요. HEIC 입력은 기존 test-results/sample.heic를 사용한다.

## 배포 후 남은 확인
- 아직 배포하지 않았다. 이 Worker가 실제 루트 도메인에도 연결돼 있어야 루트 수정이 적용된다. 별도 Worker라면 루트에도 같은 ads.txt/robots/리디렉션 설정을 반영해야 한다.
- https://saerokbit.com/ads.txt 의 200 응답과 게시자 줄, /robots.txt의 접근 허용, 일반 페이지 301을 확인한다.
- 콘텐츠 변경이 운영 사이트에 반영된 것을 확인한 뒤 AdSense에서 재검토한다. ads.txt와 콘텐츠 거절은 서로 다른 항목이다.
- Google 재수집과 승인 여부는 보장할 수 없다. 이번 작업은 핵심 5개 도구 보강이며 나머지 도구에 동일한 수준의 실제 예시가 모두 추가된 것은 아니다.

공식 참고:
- https://support.google.com/adsense/answer/7679060
- https://support.google.com/adsense/answer/7299563
- https://developers.google.com/search/docs/essentials/spam-policies
