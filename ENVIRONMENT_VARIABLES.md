# 환경변수 이름 목록

실제 값은 이 파일이나 소스 ZIP에 포함하지 않습니다. 배포 환경의 Secret 관리 기능으로 주입하세요.

| 변수 | 용도 |
|---|---|
| `NODE_ENV` | 실행 환경 |
| `PORT` | HTTP 포트 |
| `DATABASE_URL` | MySQL/TiDB 데이터베이스 연결 |
| `JWT_SECRET` | 세션 쿠키 서명 |
| `VITE_APP_ID` | Manus OAuth 앱 ID |
| `OAUTH_SERVER_URL` | OAuth 서버 주소 |
| `OWNER_OPEN_ID` | 프로젝트 소유자 식별 |
| `OWNER_NAME` | 소유자 표시 이름 |
| `LESOUL_OWNER_BOOTSTRAP_SECRET` | 최초 소유자 관리자 설정 보호값 |
| `BUILT_IN_FORGE_API_URL` | Manus 서버 API 주소 |
| `BUILT_IN_FORGE_API_KEY` | Manus 서버 API 인증 키 |
| `VITE_OAUTH_PORTAL_URL` | 클라이언트 OAuth 포털 |
| `VITE_FRONTEND_FORGE_API_URL` | 클라이언트 Forge URL |
| `VITE_FRONTEND_FORGE_API_KEY` | 클라이언트 Forge 키 |
| `VITE_ANALYTICS_ENDPOINT` | 익명 분석 엔드포인트 |
| `VITE_ANALYTICS_WEBSITE_ID` | 익명 분석 사이트 ID |
| `VITE_APP_TITLE` | 앱 제목 |
| `VITE_APP_LOGO` | 앱 로고 URL |

Care Labels 기능 자체는 ChatGPT/OpenAI 키나 LLM 호출 없이 동작합니다.
