# 첫 화면 releaseSettings 조회 실패

사용자 오류는 매장 설정 전체 SELECT 실패다. 이미지 다운로드 경로의 오류가 아니라 DB 조회 단계다. 바깥 tRPC 오류만으로 누락 열·테이블·접속 권한·연결/네트워크 중 하나로 확정하지 않는다. User:null도 공개 설정 조회 실패의 인증 원인이라는 증거가 아니다.

이전 check:manus는 releaseSettings.id만 확인하여 다른 설정 열의 누락을 탐지하지 못했다. 이제 실제 Drizzle 정의의 모든 설정 열을 SELECT LIMIT 0으로 확인하고, 해당 열 목록이 스키마와 같은지도 테스트한다.

Manus의 기존 데이터가 있는 프로젝트 Terminal에서:

```sh
pnpm check:release-db
```

이 명령은 기존 환경의 DATABASE_URL을 사용해 SHOW COLUMNS만 읽는다. 설정 행·상품·학생·접속 값은 출력하지 않는다. 없어진 열 이름 또는 고정 연결/권한 오류 분류만 표시하며 ALTER·migration·seed·데이터 쓰기를 하지 않는다.

- MISSING_COLUMNS: 출력된 missingColumns와 현재 migration SQL을 대조한다. 공급자 백업/체크포인트를 확인하고 해당 미적용 변경만 검토하여 정상 절차로 적용한 뒤 재검사한다. 기존 DB에 전체 migration을 무조건 다시 실행하거나 db:push로 덮지 않는다.
- MISSING_TABLE / DATABASE_NOT_FOUND: 다른 프로젝트/DB로 연결되었는지 먼저 확인한다. 실제 데이터가 있는 DB를 보존하며 새 테이블을 임의 생성하지 않는다.
- ACCESS_DENIED: 기존 Manus DB 계정·권한을 정상 설정으로 복구한다. 코드 기본값으로 권한 오류를 숨기지 않는다.
- CONNECTION_REFUSED / CONNECTION_TIMEOUT / DNS_FAILED / TLS_FAILED: DB 서비스·연결·네트워크를 확인한다. TLS 검증을 끄지 않는다.
- COLUMN_NAMES_MATCH: 이름 존재만 확인한 것이다. 원래 SELECT의 실제 DB 내부 cause(code/errno)를 비밀정보 없이 확인하고 열 타입/연결 상태 등을 추가 점검한다. 앱 성공으로 단정하지 않는다.

현재 local 작업에서는 운영 DB에 접속하지 않았다. 진단 코드를 전달한 것과 실제 Manus DB 복구 완료를 구분해야 한다. missingColumns 또는 비밀정보를 제거한 DB 오류 code/errno가 있어야 정확한 수정 SQL/연결 복구를 선택할 수 있다.
