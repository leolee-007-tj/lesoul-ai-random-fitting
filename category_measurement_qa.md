# Category Measurement QA Notes

- 390px 관리자 상품 화면에서 상단 **CATEGORIES & FIT FIELDS** 진입 버튼과 접히는 **CATEGORY & MEASUREMENT FIELDS** 패널이 정상 렌더링됨을 확인했습니다.
- 인증된 실제 관리자 세션에서 상품 종류 목록과 생성·치수 항목 저장 동작은 서버 권한으로 검증해야 합니다. 개발 미리보기의 한 번의 요청은 세션 쿠키가 없어 목록 API가 다시 로그인 상태를 요구할 수 있습니다.
