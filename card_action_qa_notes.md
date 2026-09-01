# Card-level purchase action QA

2026-09-01 기준 BrowseProducts 카탈로그 카드에서는 PurchaseListAddButton과 `source="catalog"` 렌더링을 제거했습니다. 카드는 상품 이미지와 상품 정보만 표시하고, 카드 전체 클릭으로 ProductDetailScreen을 열도록 유지했습니다. 상세 화면에는 기존 PurchaseListAddButton이 남아 있습니다.

The browser markdown after navigation showed the catalog route and the localized analytics consent banner, while the screenshot captured immediately after navigation still showed the catalog query spinner. This is a capture-timing condition already seen on the preview; the settled browser navigation should be used for manual confirmation. No image attachment was re-opened.

The latest `pnpm check`, full Vitest suite, and production build passed: 93 test files and 279 tests. The card-level regression test asserts that BrowseProducts no longer references PurchaseListAddButton or `source="catalog"`, while ProductDetailScreen retains the detail action.
