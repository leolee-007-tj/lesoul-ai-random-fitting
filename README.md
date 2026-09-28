# LESOUL AI Random Fitting + Care Labels

React 19, Tailwind 4, tRPC 11, Drizzle ORM 기반 LESOUL 매장 웹앱입니다. 기존 상품 카탈로그·VIP·매장 디스플레이·AI 룩북 기능을 유지한 채, 첨부된 **LESOUL Care Labels 384개 상품**을 같은 앱에 통합했습니다.

## 공개 주소와 주요 경로

- 공개 사이트: `https://lesoulai-xabhv8qd.manus.space`
- Care Labels 목록: `/care-labels`
- 고정 상품 주소: `/product/LS-0001` ~ `/product/LS-0384`
- 기존 관리자 대시보드: `/operations`
- Care Labels 관리자: `/care-labels/admin`
- QR 인쇄 화면: `/care-labels/print`

상품명이나 내용이 바뀌어도 `LS-0001` 형식의 ID와 URL은 바뀌지 않습니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

기본 포트는 `3000`입니다. 타입·테스트·빌드 검증:

```bash
pnpm check
pnpm test --run
pnpm build
```

## 환경변수

`handoff.md`의 환경변수 **이름 목록**을 참고하세요. 실제 비밀번호, API 키, 토큰, DB URL은 소스에 넣지 않습니다. 관리자 비밀번호는 서버에서 해시되어 저장되며 클라이언트로 반환하지 않습니다.

## Care Labels 데이터

- 원본 384개와 `LS-0001`~`LS-0384` ID를 보존합니다.
- 중국어 상품명, 분류, 표준, 안전분류, 등급, 세탁·관리 정보를 임의 재분류하거나 자동 생성하지 않습니다.
- 첫 공개 조회 시 누락된 원본 행만 DB에 추가하고 기존 편집 행은 덮어쓰지 않습니다.
- 관리자 가격은 별도 `careLabelPrivatePrices` 테이블에 저장되며 공개 API 응답에 포함되지 않습니다.
- PNG/JPG/WebP와 안전 검사된 SVG 세탁기호 업로드를 지원합니다.
- 업로드 이미지는 Manus 영구 스토리지에 저장하고 DB에는 URL만 저장합니다.
- 기호별 중국어 이름·설명·순서와 상품별 선택 순서를 관리합니다.

## QR 원칙

모든 활성 QR은 최종 주소 `https://lesoulai-xabhv8qd.manus.space/product/{id}`를 사용합니다. `chatgpt.site` 주소는 활성 코드·화면·인쇄·다운로드 자료에 사용하지 않습니다. QR 카드의 사용자 문구는 중국어만 사용합니다.

재생성:

```bash
sudo pip3 install 'qrcode[pil]' openpyxl
python3 scripts/generate-care-label-qr.py \
  --data /path/to/products.live.json \
  --output /path/to/output
```

## 배포

Manus WebDev 프로젝트에서 프로덕션 빌드를 통과한 뒤 체크포인트를 저장하고 Publish합니다. DB 스키마 변경은 `pnpm drizzle-kit generate`로 SQL을 생성·검토한 다음 활성 DB에 비파괴적으로 적용합니다.

## 백업

1. 배포 전 Manus 체크포인트를 저장합니다.
2. 소스 ZIP은 `.env*`, 키, 토큰, DB 파일, `node_modules`, 빌드 산출물을 제외해 보관합니다.
3. Care Labels 관리자 데이터는 관리자 화면에서 JSON으로 저장할 수 있습니다.
4. QR ZIP, PDF, `QR_MATCHING.xlsx`는 별도 보관합니다.
5. 이미지 URL은 DB 백업에 포함되며 실제 파일은 Manus 영구 스토리지에 보관됩니다.

자세한 인계 정보는 `handoff.md`를 참고하세요.
