# 낮은 가치 콘텐츠 거절 후 편집 — 2026-10-03

확인한 실제 거절 사유: 사용자가 답변한 '가치가 별로 없는 콘텐츠'. 전달된 블로그 평가는 다른 주제를 다루는 개인 의견이며, Paper Switch에 대한 Google의 개별 판정 근거로 간주하지 않았다.

## 변경
- 일반 형식 변환 32개(4개 언어 128페이지)의 '무료 온라인 변환기'형 제목과 반복 도입부를 짧게 정리했다.
- 주요 변환은 투명도, 출력 성격, 글자 선택 여부 등 실제 차이를 설명하고 일반 변환의 똑같은 사용 사례 문단을 제거했다.
- 직접 생성한 640×400 시험 그림을 기존 localConversionService로 변환했다. 사용자 파일·스톡 이미지·생성형 이미지나 꾸며낸 체험담을 사용하지 않았다.
- PNG→JPG: 16,412→14,690바이트, 모서리 alpha 0→255 및 RGB 흰색 확인.
- JPG→PNG: 14,690→50,695바이트, 해독한 모든 RGBA 픽셀 일치. 용량 증가가 품질 복구를 뜻하지 않는 예시.
- PNG→WEBP: 16,412→6,366바이트, 현재 형식 변환기의 흰 배경 처리를 공개. 투명도 유지가 필요하면 실제 그 기능이 있는 Image Compressor로 연결.
- 세 페이지에 원본·결과 미리보기, 다운로드, 측정 JSON을 제공했다. 브라우저/입력에 따라 결과가 다름을 명시했다.
- 이 세 페이지의 비교 설명과 중복되는 일반 형식 정보·주의사항·FAQ를 제거했다.
- 페이지를 늘리거나 도구를 제거하지 않았다. 기존 47개 도구와 208개 canonical 경로를 유지했다. 로그인과 회원가입도 추가하지 않았다.

## 재현
scripts/generate-raster-examples.mjs를 PLAYWRIGHT_MODULE 설정과 로컬 미리보기 실행 후 사용한다. 시험 원본은 Canvas 도형/문자로 생성하고 실제 서비스 모듈로 변환하며 픽셀을 검사한다. web/examples/raster-measurements.json에 측정 환경과 값이 있다. 측정 대상은 해당 샘플 하나이며 일반적인 압축률/화질 보장으로 사용하지 않는다.

## 검증 및 운영
208개 정적 경로 감사와 20개 단위 테스트, 다국어 홈/SEO 및 기존 실측 가이드 검사, 신규 3개 비교의 4개 언어/다운로드/모바일 검사를 수행했다. 변환 알고리즘을 변경하지 않았다. 라이선스 소스 묶음은 새 빌드로 갱신했다. 아직 배포하지 않았으며, 로컬 변경만으로 재심사를 요청해서는 안 된다.

## 해석의 한계
Google 공개 기준은 고유한 가치·정확성·사용 경험을 강조한다. 전달된 글의 1,000~1,500자, 20~30개 글, 카테고리당 5개는 이 작업에서 확인한 공식 승인 최소 기준이 아니다. 생성형 AI 사용 자체와 사용자 가치 없는 대량 생산도 구분해야 한다. 사람이 썼다고 가장하거나 문장에 일부러 흠을 넣는 조치는 하지 않았다. 이번 편집이 거절의 모든 원인을 해결하거나 승인을 보장하는 것은 아니다. 계정의 CMP와 실제 광고 배치 등 기존 보고서의 운영 확인 사항은 남는다.

공식 참고:
- https://support.google.com/adsense/answer/7299563?hl=ko
- https://developers.google.com/search/docs/fundamentals/using-gen-ai-content

## 홈 화면 추가 편집
장식용 문서 그래픽을 실제 PNG/JPG 비교로 교체했다. 획일적인 3단계 소개를 제거하고 용량/픽셀 크기, PDF 추출/분할 선택 안내를 넣었다. 카드의 반복 부제도 숨겨 시각적 중복을 줄였다. 변경은 4개 언어에 반영했다.


## Homepage layout and optional advertising placement
- Replaced repeating cards with a compact tool index, category directory, and a distinct white reading surface for actual conversion examples.
- A single optional display unit sits between the directory/help section and the examples, outside tool controls.
- Set Cloudflare build environment variable ADSENSE_HOME_SLOT to the real 10-digit display ad-unit ID to enable it. Without it, no placeholder or ad request is rendered. The publisher ID is not a slot ID.
- Labels are translated into all four languages. Fixed responsive sizes reserve space (728x90, 468x60, 320x100, or 250x250) and language changes do not refresh ads.
- Existing Auto ads remain controlled by the AdSense account; use its preview/excluded areas to keep ads out of navigation and conversion controls and avoid duplicating this placement. No live ad serving or approval is claimed.

Homepage refinement: retained the slogan, replaced long quick-action labels with six localized icon links in one tool panel, shortened the introduction, and moved comparison examples and selection guidance into an accessible native disclosure. All 47 tools remain linked. Verified four languages, 320/390/768/1280 widths, keyboard and no-JavaScript disclosure access; existing UI/SEO and unit checks pass.
