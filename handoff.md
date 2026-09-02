# LESOUL AI Random Fitting — Handoff

> **안전한 소스 내보내기 문서입니다.** 이 파일에는 비밀번호, API 키, 토큰, service-role 값, 데이터베이스 접속 문자열 또는 Git 원격 인증정보를 기록하지 않습니다. 해당 값은 배포 환경의 비밀 저장소에서 주입해야 합니다.

## 1. 프로젝트 개요

LESOUL AI Random Fitting은 모바일 우선 패션 카탈로그 앱입니다. 현재 사용자에게 제공되는 코디 추천은 관리자가 저장한 큐레이션 코디를 노출하는 방식이며, 고객 카탈로그·상품 상세·구매목록·위챗 공유·예약 안내·다국어(EN/KO/ZH)를 포함합니다. 관리자 화면에서는 상품·핏 정보·코디·가격·세일·계정·매장 디스플레이·방문 분석을 관리합니다.

기술 스택은 React 19, Vite, Tailwind CSS 4, Express 4, tRPC 11, Drizzle ORM, MySQL/TiDB 호환 데이터베이스, Vitest, TypeScript 5.9, Web Share API, MediaPipe Tasks Vision입니다.

## 2. 프로젝트 구조

```text
client/
  index.html                 브라우저 진입점
  src/
    App.tsx                  SPA 라우트와 전역 Provider
    pages/                   고객·관리자·VIP·체험·매장 화면
    components/              공통 화면·상품·인증·공유 컴포넌트
    contexts/                구매목록 등 전역 상태
    i18n/                    EN/KO/ZH 번역 리소스
    lib/                     방문자·분석·공유·이미지·tRPC 유틸리티
    _core/hooks/             인증 훅
  public/                    작은 정적 설정 파일만 포함
server/
  _core/                     Express·OAuth·Vite·Forge·스토리지 기반
  routers.ts                 tRPC 루트와 역할별 인증 라우터
  routers/                   기능별 tRPC 라우터
  db.ts                      Drizzle DB 헬퍼
  storage.ts                 Manus Forge/S3 저장소 래퍼
  *.test.ts                  서버 계약·회귀 테스트
drizzle/
  schema.ts                  MySQL/TiDB Drizzle 스키마
  *.sql                      누적 비파괴적 마이그레이션
shared/                      서버·클라이언트 공통 타입과 정책
scripts/                     유지보수·검증용 스크립트
docs/                        운영·번역·통합 참고 문서
patches/                     패키지 패치
package.json                실행·검사·빌드·테스트 명령
pnpm-lock.yaml              의존성 잠금 파일
vite.config.ts              Vite·경로 별칭·개발 로거 설정
tsconfig.json               TypeScript 설정
drizzle.config.ts           Drizzle Kit 설정
.gitignore                  비밀·의존성·빌드·로그 제외 규칙
```

`.git`, `node_modules`, `dist`, `.manus-logs`, `.env*`, 인증서·키 파일은 안전한 ZIP에서 제외합니다. `.project-config.json`은 구조와 변수 이름만 남긴 비밀 제거 사본으로 포함합니다.

## 3. 실행 방법

Node.js와 pnpm을 설치한 뒤 프로젝트 루트에서 `pnpm install`을 실행합니다. 개발 서버는 `pnpm dev`로 시작하며 기본적으로 서버가 자동으로 사용 가능한 포트를 선택합니다. 타입 검사는 `pnpm check`, 전체 테스트는 `pnpm test`, 포맷 검사는 프로젝트의 Prettier 설정을 따릅니다.

데이터베이스 스키마를 변경할 때는 먼저 `drizzle/schema.ts`를 수정하고 Drizzle 마이그레이션을 생성·검토한 뒤, 운영 데이터베이스에는 관리되는 마이그레이션 절차로 적용합니다. `DATABASE_URL`은 로컬 셸이나 비밀 저장소에서만 주입합니다. 운영 데이터와 사용자가 업로드한 파일은 소스 ZIP에 포함되지 않습니다.

## 4. 배포 방법

Manus WebDev 프로젝트에서는 변경 후 체크포인트를 저장하면 현재 프로젝트 설정에 따라 자동 게시됩니다. 일반적인 검증 순서는 `pnpm check`, `pnpm test`, `pnpm build`입니다. 프로덕션 번들은 `dist/`에 생성되고 `pnpm start`로 실행됩니다. 서버는 포트를 하드코딩하지 않고 `PORT` 또는 런타임이 할당한 포트를 사용합니다.

현재 게시 도메인은 `https://lesoulai-xabhv8qd.manus.space`입니다. Tencent Cloud에서 `lesoullook.cn`을 구매한 뒤 연결할 경우 Manus 관리 화면의 **Settings → Domains**에서 사용자 도메인을 추가하고, 화면에 표시되는 DNS 레코드를 Tencent DNSPod에 그대로 등록합니다. 임의의 A/CNAME 값을 사용하지 않습니다. DNS 전파와 HTTPS 인증서 발급을 확인한 뒤 도메인을 공개합니다. 중국 본토 호스팅 및 ICP备案 필요 여부는 실제 운영 위치와 서비스 제공자 조건에 따라 별도로 확인해야 합니다.

## 5. API·스토리지·Supabase·GitHub 정보

| 구분 | 현재 상태 |
|---|---|
| tRPC | `/api/trpc` 아래에서 클라이언트와 서버 계약을 공유합니다. 루트 라우터는 `server/routers.ts`와 기능별 `server/routers/`에 있습니다. |
| Manus OAuth | 소유자·관리자 인증에 사용합니다. OAuth 비밀과 세션 서명값은 환경변수로만 주입합니다. |
| Manus Forge / S3 | `server/storage.ts`가 Forge 스토리지 프록시를 통해 파일을 업로드·조회합니다. 파일 바이트는 DB에 저장하지 않습니다. |
| Web Share API | 구매목록·위챗 공유 흐름에 사용합니다. 공유 이미지는 브라우저 메모리 미리보기만 사용하며 자동 다운로드하지 않습니다. |
| MediaPipe | 매장 디스플레이의 카메라 사람 감지에 사용합니다. 카메라 프레임은 저장·업로드하지 않습니다. |
| Supabase | 현재 코드와 설정에서 Supabase 프로젝트·키·연결은 확인되지 않았습니다. 데이터베이스는 Drizzle + MySQL/TiDB 방식입니다. |
| GitHub | 소스 ZIP에는 Git 원격 URL·토큰·`.git` 이력을 포함하지 않았습니다. 별도 GitHub 저장소나 Actions 설정은 이 안전한 export에 연결하지 않았습니다. |
| Tencent Cloud | 중국판 Tencent Cloud에서 `.cn` 도메인을 구매·연결하는 작업은 미완료입니다. 등록 후 DNSPod 레코드 연결이 필요합니다. |

## 6. 환경변수 목록

아래는 변수 **이름과 용도만** 정리한 목록입니다. 실제 값은 이 문서나 ZIP에 포함하지 않습니다.

| 환경변수 | 용도 |
|---|---|
| `DATABASE_URL` | MySQL/TiDB 데이터베이스 연결 |
| `JWT_SECRET` | 세션 쿠키 서명 |
| `VITE_APP_ID` | Manus OAuth 애플리케이션 ID |
| `OAUTH_SERVER_URL` | OAuth 서버 주소 |
| `VITE_OAUTH_PORTAL_URL` | 클라이언트 OAuth 포털 주소 |
| `OWNER_OPEN_ID` | 소유자 계정 식별 |
| `OWNER_NAME` | 소유자 표시 이름 |
| `BUILT_IN_FORGE_API_URL` | Manus Forge API 주소 |
| `BUILT_IN_FORGE_API_KEY` | 서버 측 Forge 인증 키 |
| `VITE_FRONTEND_FORGE_API_URL` | 클라이언트 Forge API 주소 |
| `VITE_FRONTEND_FORGE_API_KEY` | 클라이언트 Forge 인증 키 |
| `VITE_ANALYTICS_ENDPOINT` | 분석 엔드포인트 설정 |
| `VITE_ANALYTICS_WEBSITE_ID` | 분석 사이트 식별자 |
| `VITE_APP_TITLE` | 사이트 제목 |
| `VITE_APP_LOGO` | 사이트 로고 설정 |
| `LESOUL_OWNER_BOOTSTRAP_SECRET` | 소유자 관리자 초기화 보호값 |

코드에서 사용하는 환경변수의 기본 선언은 `server/_core/env.ts`에 있습니다. 모든 비밀값은 배포 환경의 Secret 관리 기능으로 주입하고 `.env` 파일을 공유하지 않습니다.

## 7. 현재 남은 오류·주의사항

현재 마지막 검증 기록 기준으로 타입 오류와 프로덕션 빌드 오류는 없습니다. 알려진 운영상 미완료 사항은 Tencent Cloud 중국판에서 `lesoullook.cn` 등록·결제·DNS 연결이 아직 완료되지 않았다는 점입니다. 중국 현지 통신사별 접속은 싱가포르 관측 지점만으로 보장할 수 없으므로, 실제 중국 SIM 또는 Wi-Fi를 사용하는 iPhone에서 별도 확인해야 합니다.

일반 웹 브라우저는 정확한 iPhone 제조사·모델명을 안정적으로 제공하지 않으므로 방문 분석은 기기 유형·운영체제·브라우저·화면 등급 수준으로만 집계합니다. 방문 분석은 사용자 동의 후 익명·일일 단위로 기록하며 IP 원문·정확한 위치·연락처·광고 식별자는 저장하지 않습니다.

실제 환경에서 확인해야 할 항목은 로그인 계정별 세션 유지, 중국 iPhone 카메라 권한, 사용자 도메인 HTTPS, Tencent ICP备案 필요 여부, 실데이터가 있는 상품 카탈로그와 위챗 공유입니다.

## 8. 최근 수정 내용

최근 릴리스에는 로그인 성공 직후 역할별 화면 이동과 잘못된 `next=/login` 반복 리다이렉트 차단, 상품별 익명 방문·구매목록 관심 행동 전환율 분석, 중국 iPhone 접속을 방해할 수 있는 Google Fonts 제거, 상품 이미지의 회색 배경·오버레이 제거, 이미지별 흰색 여백 자동 보정, 일반 사용자 상품 카드의 구매목록 버튼 제거가 포함되어 있습니다.

또한 관리자 큐레이션 코디는 최신 저장순으로 표시되고, 코디의 다중 상품을 원자적으로 구매목록에 추가하며, 품절 상품을 합계·공유 카드에서 제외합니다. 예약 상품에는 한국·칭다오 배송기간 2~3주 안내를 EN/KO/ZH로 표시합니다. 방문 분석과 상품별 전환율 표는 관리자 전용이며, Store Display 계정은 카탈로그·카메라 알림 기능만 사용할 수 있도록 역할 경계를 유지합니다.

## 9. 검증 기준

마지막 기능 검증은 TypeScript 검사, Vitest 전체 테스트, 프로덕션 빌드, 모바일 카탈로그·로그인·운영 대시보드 미리보기로 진행되었습니다. 테스트 수는 기능 변경에 따라 변동될 수 있으므로 실행 시 `pnpm test`의 실제 결과를 기준으로 합니다.

## References

[1]: https://cloud.tencent.com/product/domain "腾讯云域名产品页"
[2]: https://buy.cloud.tencent.com/domain/ "腾讯云中国大陆域名注册页"
[3]: https://www.tencentcloud.com/document/product/242/42861 "Tencent Cloud Registration Guide"
