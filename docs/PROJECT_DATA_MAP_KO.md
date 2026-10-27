# LESOUL AI Random Fitting — 프로젝트·데이터 인수인계 지도

- 조사 시각: 2026-10-27 09:40 (Asia/Shanghai)
- 기준 커밋: `171cba183e2eeb0e5f8f40e78295d0a4f604d5c7` (`171cba1`)
- 조사 범위: 현재 소스·설정·Git 원격·실제 DB의 읽기 전용 확인
- 이번 문서 작성에서는 코드 수정, 데이터 이동·삭제, 파일 업로드, 배포를 수행하지 않았습니다.

## 1. 프로젝트와 실행 위치

| 항목 | 확인 결과 |
|---|---|
| 프로젝트명 | `lesoul-ai-random-fitting` / LESOUL AI Random Fitting |
| WebDev Project ID | `XABHv8QdBoCpfYVqBJuXsY` |
| 공개 사이트 | `https://lesoulai-xabhv8qd.manus.space/` |
| 개발 미리보기 | 현재 세션의 WebDev 미리보기 주소 사용 |
| 절대 경로 | `/home/ubuntu/lesoul-ai-random-fitting` |
| GitHub 원격 | `https://github.com/leolee-007-tj/lesoul-ai-random-fitting.git` |
| GitHub 브랜치 | `main` |
| 현재 작업 브랜치 | `main` |
| 기준 커밋 | `171cba1` — Manus 안정성 수정과 CI/CD 파이프라인 병합 |
| 개발 실행 | `pnpm dev` |
| 검사 | `pnpm check` |
| 테스트 | `pnpm test -- --run` |
| 프로덕션 빌드 | `pnpm build` |
| 서버 실행 | `pnpm start` 또는 배포 런타임의 시작 명령 |

GitHub와 Manus는 자동 양방향 동기화가 아닙니다. 현재 저장소 원격은 연결되어 있지만, GitHub의 최신 커밋을 가져와 Manus에 자동 반영하는 구조로 확정되어 있지는 않습니다. 동기화할 때는 `fetch → 상태 비교 → 백업/브랜치 → fast-forward 또는 rebase → 검사 → Manus 미리보기/게시` 순서를 사용합니다.

`.github/workflows/ci-and-manus-deploy.yml`은 `main` push와 Pull Request에서 의존성 설치, 타입 검사, 테스트, 빌드를 실행합니다. `MANUS_DEPLOY_HOOK_URL` GitHub Secret이 실제로 설정되어 있을 때만 Manus 배포 훅을 호출하고, 설정되지 않으면 CI만 통과한 뒤 배포를 건너뜁니다. 이 Secret의 실제 존재 여부와 실제 배포 훅 성공 여부는 이번 읽기 전용 조사에서 확인하지 않았습니다.

## 2. DB 연결과 데이터 구조

### 연결

- DB 종류: MySQL/TiDB 호환 관계형 데이터베이스
- ORM: Drizzle ORM
- 스키마: `drizzle/schema.ts`
- 연결 환경변수: `DATABASE_URL`
- 연결 확인: 성공. WebDev 읽기 전용 SQL로 기존 테이블의 행 수와 상품 1건의 이미지 참조를 조회했습니다.
- 데이터 삭제·수정: 이 조사에서는 수행하지 않았습니다.

확인된 주요 행 수는 다음과 같습니다.

| 테이블 | 확인된 행 수 | 역할 |
|---|---:|---|
| `releaseSettings` | 1 | 스토어·가격·세일·AI·디스플레이 전역 설정 |
| `products` | 187 | 일반 상품 카탈로그, 가격·재고·다국어·이미지 참조 |
| `careLabelProducts` | 391 | 중국어 Care Label 원본·편집 JSON과 고정 ID |
| `generations` | 0 | 사용자 AI 생성 요청/결과 |
| `siteVisitSummaries` | 443 | 익명 일별 방문 요약 |

### 주요 테이블

- `users`: Manus OAuth 및 관리자/VIP/매장 디스플레이 계정과 역할
- `productCategories`: 카테고리·측정 항목·다국어 이름
- `products`: 상품 기본정보, 상품 유형/세트 구성, 가격 정책, 재고, 이미지 URL/JSON, 설명과 룩북 프롬프트
- `careLabelProducts`: Care Label 고정 ID와 중국어 원본·편집 데이터
- `careLabelPrivatePrices`: Care Label 관리자 전용 가격
- `careLabelSymbols`, `careLabelProductSymbols`, `careLabelSettings`: 세탁기호·상품별 연결·공개 위챗 QR/설정
- `poses`, `backgrounds`: AI 룩북 포즈·배경
- `generations`, `generationLogs`, `generationFeedback`: AI 생성 요청·로그·결과·피드백
- `bodyProfiles`, `aiBodyModels`: 고객 신체정보와 승인된 모델 이미지 참조
- `savedLooks`, `curatedOutfits`, `curatedOutfitItems`: 저장 룩과 관리자 추천 코디
- `displayLookbookImages`: 매장 디스플레이용 승인 AI 룩북 이미지와 조합 상품
- `releaseSettings`, `trialStores`, `trialStoreProducts`: 전역 출시/세일/AI 설정 및 체험 매장
- `redeemCodes`, `visitorEntitlements`, `aiAccessBlocks`: 게스트 AI 사용량·권한·차단
- `siteVisitSummaries`, `productShareVisits`, `productEngagementEvents`: 익명 방문·상품 공유·참여 지표

상품·Care Label·방문 요약은 DB에 저장됩니다. 대학정보나 학생정보 전용 테이블은 현재 스키마에서 확인되지 않았고, 즐겨찾기 전용 테이블도 확인되지 않았습니다. 사용자 저장 룩은 `savedLooks`에 저장됩니다.

### 마이그레이션

- 파일 위치: `drizzle/*.sql`
- 스키마 원본: `drizzle/schema.ts`
- 설정: `drizzle.config.ts`
- 적용 이력 확인: 활성 DB의 Drizzle 마이그레이션 추적 테이블과 실제 `SHOW COLUMNS`/정보 스키마를 비교
- 안전한 변경 절차:
  1. `drizzle/schema.ts`를 먼저 변경
  2. `pnpm drizzle-kit generate`로 SQL 생성
  3. 생성 SQL을 읽어 `DROP`, 전체 테이블 재생성, 데이터 삭제 여부를 검토
  4. 운영 DB 백업/체크포인트 확보
  5. 승인된 마이그레이션만 적용
  6. 기존 행 수·핵심 ID·컬럼을 읽기 전용으로 재확인
  7. `pnpm check`, `pnpm test -- --run`, `pnpm build` 실행

코드만 GitHub에서 가져오는 것으로 DB 변경은 적용되지 않습니다. 마이그레이션은 별도로 검토·승인·적용해야 합니다. 개발·미리보기·공개 사이트가 항상 같은 DB를 쓴다고 단정하지 마십시오. 각 실행 환경의 `DATABASE_URL`을 확인해야 하며, 현재 프로젝트 설정상 WebDev 실행은 프로젝트의 활성 DB를 사용합니다.

## 3. 사진·문서·생성 이미지 저장소

파일 바이트는 로컬 디스크나 DB BLOB에 저장하지 않고 Manus Forge가 제공하는 S3 호환 객체 저장소에 업로드합니다. DB에는 URL 또는 storage key만 저장합니다.

### 저장 흐름

1. 서버가 `BUILT_IN_FORGE_API_URL`과 `BUILT_IN_FORGE_API_KEY`로 Forge presign API를 호출합니다.
2. presigned PUT URL로 파일을 객체 저장소에 업로드합니다.
3. DB에는 `/manus-storage/{key}` 형태의 프록시 경로와 필요한 경우 `storageKey`를 저장합니다.
4. Express의 `server/_core/storageProxy.ts`가 `/manus-storage/*` 요청을 받아 Forge에서 짧은 서명 URL을 받아 307 redirect합니다.

`storagePut()`은 충돌 방지를 위해 저장 키 뒤에 짧은 랜덤 해시를 붙입니다. 대표 경로 형식은 다음과 같습니다.

- 상품: `/manus-storage/lesoul/catalog/products/{category}/{product-key}/...`
- AI 생성: `generated/{timestamp}.png` 또는 기능별 `storageKey`
- 디스플레이 룩북: DB의 `displayLookbookImages.imageUrl`와 `storageKey`
- Care Label 기호·QR·PDF·XLSX: Manus storage URL 참조

주요 파일 참조 필드는 `products.imageUrl`, `products.images`, `products.imageViews`, `careLabelSymbols.imageUrl`, `trialStoreProducts.imageUrls`, `generations.userPhotoUrl`, `generations.resultImageUrl`, `aiBodyModels.imageUrl`, `displayLookbookImages.imageUrl`, `displayLookbookImages.storageKey` 등입니다.

`/manus-storage/...`는 영구 공개 URL 자체가 아니라 앱의 storage proxy 경로입니다. 실제 객체 접근 시 서버가 presigned GET URL로 redirect합니다. `storageGetSignedUrl()`은 임시 서명 URL을 반환하므로 문서·로그·GitHub에 저장하거나 공개하면 안 됩니다.

읽기 전용 확인으로 기존 `products` 행 1건에서 `/manus-storage/...` 이미지 참조가 존재함을 확인했습니다. 실제 객체의 장기 보존·권한 정책은 Manus Forge/S3 계정 정책에 따르며, 코드 재배포나 작업 폴더 변경만으로 기존 객체가 삭제되지는 않습니다. 객체 키와 DB 참조를 함께 보존해야 합니다.

## 4. 인증과 외부 기능

### 인증·권한

- Manus OAuth: `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`
- 세션 쿠키 서명: `JWT_SECRET`
- 소유자 식별: `OWNER_OPEN_ID`, `OWNER_NAME`
- 관리자 초기화 보호: `LESOUL_OWNER_BOOTSTRAP_SECRET`
- 서버는 OAuth 계정, VIP/관리자 세션, 테스트 접근 세션을 역할별로 확인합니다.
- 관리자·소유자 비밀번호/보호값은 이 문서에 기록하지 않습니다.

### 외부 기능

- Manus Forge LLM: `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`; 상품 메타데이터 번역·분류 보조와 텍스트 생성
- Manus Forge ImageService: GPT Image 2 기본 모델 설정과 이미지 편집/생성
- Manus Forge/S3 저장소: 이미지·세탁기호·QR·문서 저장
- Manus Analytics: `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`
- MediaPipe Tasks Vision: 브라우저 매장 카메라 사람 감지. 카메라 프레임은 코드상 영구 저장 흐름이 아님
- Web Share API: 브라우저 공유 미리보기
- QR/PDF/XLSX 생성: 프로젝트 스크립트·관리자 화면 및 저장소 산출물

설정 누락 시 대표 오류는 `Storage config missing`, `BUILT_IN_FORGE_API_URL is not configured`, `BUILT_IN_FORGE_API_KEY is not configured`, `OPENAI_API_KEY is not configured` 형태입니다. 실제 호출 비용·잔액·provider별 사용량은 Forge 계정/프로젝트 운영 화면에서 확인해야 하며, 이번 조사에서는 유료 AI 호출을 실행하지 않았습니다.

## 5. GitHub 동기화 시 보존할 항목

### 절대 저장소에 올리지 않을 것

- `.env*`
- `.project-config.json`
- Git remote 인증정보가 포함된 URL
- DB 접속 문자열, API 키, OAuth 토큰, JWT secret, 관리자 보호값
- `node_modules`, `dist`, 로그, 임시 파일, 실제 업로드 이미지/문서
- 임시 서명 URL, 쿠키, 개인정보, 실제 고객 사진

`.gitignore`에는 환경변수 파일, DB 파일, 빌드 산출물, 로그, `.project-config.json` 등이 제외되어 있습니다. 원격 URL에는 인증 토큰을 넣지 않고 GitHub 연결 도구 또는 별도의 보안 credential helper를 사용해야 합니다.

### 코드 가져오기 순서

```bash
git fetch github main
git status --short
git rev-list --left-right --count HEAD...github/main
# 로컬 변경이 없을 때만
git pull --ff-only github main
pnpm install --frozen-lockfile
pnpm check
pnpm test -- --run
pnpm build
```

로컬 변경이 있으면 먼저 별도 브랜치로 보존하고, 충돌을 검토한 뒤 rebase/merge합니다. 코드 import만으로 DB·스토리지 파일은 초기화되지 않습니다.

### 백업·복구

- 코드: GitHub commit/tag와 비밀 제거 소스 ZIP
- DB 구조: `drizzle/schema.ts`와 `drizzle/*.sql`
- DB 데이터: 공급자 백업/덤프. 소스 ZIP에 넣지 않음
- 객체 파일: Manus storage의 객체 보존 정책과 key 목록을 함께 백업
- Care Labels: 관리자 화면 JSON 백업 및 QR PNG/SVG/PDF/XLSX 별도 보관
- 복구: 코드 복원 → 의존성 설치 → 환경변수 주입 → DB 연결 확인 → 마이그레이션 검토/적용 → 객체 저장소 접근 확인 → 테스트/빌드 → 게시

프로젝트명이나 도메인을 바꿀 때는 `README.md`, QR 생성 스크립트/산출물, Care Label product URL, Open Graph/share URL, GitHub Actions 문서와 Manus 도메인 설정을 함께 점검해야 합니다. 상품 ID와 `/product/{id}` 규칙은 변경하지 않아야 기존 QR이 유지됩니다.

## 6. 확인 상태 요약

| 항목 | 상태 |
|---|---|
| WebDev 프로젝트 ID·공개 주소 | 확인됨 |
| 현재 프로젝트 절대 경로 | 확인됨 |
| GitHub 원격·main 브랜치 설정 | 확인됨 |
| 현재 기준 커밋 | 확인됨 |
| DB 연결 | 읽기 전용 SQL 성공 |
| 기존 상품 이미지 저장 참조 | 1건 확인 |
| 전체 객체 파일 무결성/보존 기간 | 미확인 |
| GitHub 최신 원격과 Manus HEAD 완전 일치 | 미확인 |
| GitHub Actions의 실제 배포 훅 설정·성공 | 미확인 |
| 중국 본토 통신망·실제 휴대폰/WeChat 스캔 | 미실행 |
| 유료 AI 호출·잔액 확인 | 미실행 |
| DB 백업 생성 | 미실행 |
| 데이터 이동·삭제 | 미실행 |
| 게시·배포 | 미실행 |
