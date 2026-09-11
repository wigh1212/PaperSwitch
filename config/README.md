# 의존성 관리

- **package.json**: 모든 직접 라이브러리 버전의 기준. 범위(^/~) 없이 정확한 버전으로 고정합니다.
- **pnpm-lock.yaml**: 하위 의존성까지 고정하는 자동 생성 파일. 직접 수정하지 않습니다.
- **assets.json**: npm 외의 폰트·OCR 데이터 출처와 SHA-256 검증값.
- **scripts/build.mjs**: 검증 후 설치된 패키지를 extension/vendor에 복사하거나 묶습니다. vendor 파일은 직접 수정하지 않습니다.

업데이트: package.json 버전 수정 → pnpm install → pnpm build → 테스트 → package.json과 pnpm-lock.yaml 함께 저장.
외부 데이터 변경: 출처·라이선스 확인 → 파일 교체 → assets.json 검증값 갱신 → 빌드·테스트.
build는 설치된 버전이나 데이터가 목록과 다르면 실패합니다. MuPDF의 AGPL 조건은 이 구조 변경으로 달라지지 않습니다.
