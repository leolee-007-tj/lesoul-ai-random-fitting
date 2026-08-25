import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { demoBackgrounds, demoPoses, demoProducts } from "./catalogSeed";
import { appRouter } from "./routers";

describe("LESOUL catalog seed contract", () => {
  it("ships the requested product, pose, and background demo catalog", () => {
    expect(demoProducts).toHaveLength(20);
    expect(demoProducts.filter((product) => product.status === "in_stock")).toHaveLength(18);
    expect(demoProducts.some((product) => product.category === "dress")).toBe(true);
    expect(demoProducts.some((product) => product.category === "shoes")).toBe(true);
    expect(demoProducts.some((product) => product.category === "bag")).toBe(true);
    expect(demoPoses.map((pose) => pose.name)).toEqual(["Natural Standing", "Front Model Pose", "Side Pose", "Walking", "Hand in Pocket", "Elegant Fashion Pose"]);
    expect(demoBackgrounds).toHaveLength(10);
  });
});

describe("LESOUL experience API contract", () => {
  it("exposes the catalog, generation, upload, and admin routes required by the app", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toEqual(expect.arrayContaining([
      "catalog.bootstrap", "catalog.products", "catalog.productDetail", "catalog.poses", "catalog.backgrounds",
      "uploads.photo", "uploads.productImage", "generations.prepare", "generations.generate", "generations.byId", "generations.save", "generations.list",
      "admin.products", "admin.productCategories", "admin.createProductCategory", "admin.updateProductCategory", "admin.stats", "admin.createProduct", "admin.updateProduct", "admin.deleteProduct", "admin.deleteProducts", "admin.deleteAllProducts",
      "look.generate", "look.status", "stylist.presets", "stylist.recommend", "stylist.feedback",
      "purchase.config", "purchase.createRequest",
    ]));
  });
});

describe("administrator product deletion contract", () => {
  it("keeps catalog mutations authenticated and exposes one, selected, and all-product deletion routes", () => {
    const adminSource = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
    expect(adminSource).toContain("deleteProduct: ownerProcedure");
    expect(adminSource).toContain("deleteProducts: ownerProcedure");
    expect(adminSource).toContain("deleteAllProducts: ownerProcedure");
  });

  it("clears relational product references and marks the catalog initialized before a destructive delete", () => {
    const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    expect(dbSource).toContain("topProductId: null");
    expect(dbSource).toContain("bottomProductId: null");
    expect(dbSource).toContain("outerProductId: null");
    expect(dbSource).toContain("dressProductId: null");
    expect(dbSource).toContain("anchorProductId: null");
    expect(dbSource).toContain("catalogInitialized: 1");
  });

  it("requires an explicit DELETE ALL phrase before the destructive UI action is enabled", () => {
    const managerSource = readFileSync(new URL("../client/src/pages/ProductManagerV2.tsx", import.meta.url), "utf8");
    expect(managerSource).toContain('deleteAllPhrase.trim().toUpperCase() !== "DELETE ALL"');
    expect(managerSource).toContain("deleteProducts.mutateAsync");
    expect(managerSource).toContain("deleteAllProducts.mutateAsync");
  });
});

describe("Studio generation-status contract", () => {
  it("returns a typed not-found object instead of undefined during the short pre-log polling window", () => {
    const lookSource = readFileSync(new URL("./routers/look.ts", import.meta.url), "utf8");
    expect(lookSource).toContain('status: "not_found" as const');
    expect(lookSource).toContain("requestId: input.generationId");
    expect(lookSource).not.toContain("query(async ({ input }) => getGenerationLog(input.generationId))");
  });
});

describe("customer-facing UX cleanup contract", () => {
  it("gives NORMAL two Home actions, VIP a 李瀛 model action, and keeps Quick AI out of customer Home", () => {
    const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    const bodyModel = readFileSync(new URL("../client/src/pages/BodyModel.tsx", import.meta.url), "utf8");
    expect(home).toContain('navigate("/body-model")');
    expect(home).toContain('navigate("/style-match")');
    expect(home).toContain('navigate("/catalog")');
    expect(home).not.toContain('navigate("/quick-fit")');
    expect(home).toContain('const isVip = user?.role === "vip"');
    expect(home).toContain("return <MobileScreen>");
    expect(home).not.toContain('features: [');
    expect(bodyModel).toContain("CREATE MY AI MODEL");
    expect(bodyModel).toContain("USE QUICK MODEL");
    expect(bodyModel).toContain("trpc.bodyModel.create.useMutation");
  });

  it("uses default pose/background with optional customisation and hides public test controls", () => {
    const studio = readFileSync(new URL("../client/src/pages/Studio.tsx", import.meta.url), "utf8");
    expect(studio).toContain('item.name === "Natural Standing"');
    expect(studio).toContain('item.name === "미니멀 스튜디오"');
    expect(studio).toContain('setStep(step === 2 ? 4 : step + 1)');
    expect(studio).toContain("ui.changePose");
    expect(studio).toContain("ui.changeBackground");
    expect(studio).not.toContain('>{t("catalogUi.testLook")}</button>');
  });

  it("keeps public stylist and result cards product-first without score breakdown or provider copy", () => {
    const stylist = readFileSync(new URL("../client/src/components/StylistPanel.tsx", import.meta.url), "utf8");
    const result = readFileSync(new URL("../client/src/components/LookResultPanel.tsx", import.meta.url), "utf8");
    const progress = readFileSync(new URL("../client/src/components/GenerationProgress.tsx", import.meta.url), "utf8");
    expect(stylist).toContain("locale, body: fitBody");
    expect(stylist).not.toContain("recommendation.scoreBreakdown.style");
    expect(result).not.toContain("copyLink");
    expect(result).toContain("overflow-x-auto");
    expect(progress).not.toContain("LESOUL AI COMPOSITE");
    expect(progress).not.toContain("<span>{progress}%</span>");
  });

  it("separates administrator operations navigation from NORMAL and VIP customer navigation", () => {
    const header = readFileSync(new URL("../client/src/components/AppHeader.tsx", import.meta.url), "utf8");
    const bottomNav = readFileSync(new URL("../client/src/components/MobileBottomNav.tsx", import.meta.url), "utf8");
    const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
    const adminGate = readFileSync(new URL("../client/src/components/AdminGate.tsx", import.meta.url), "utf8");
    expect(header).toContain('const showAdminManage = user?.role === "admin"');
    expect(bottomNav).not.toContain('href: "/quick-fit"');
    expect(bottomNav).toContain('href: "/outfit-management"');
    expect(bottomNav).toContain('href: "/products"');
    expect(bottomNav).toContain('href: "/purchase-list"');
    expect(bottomNav).not.toContain('href: "/body-model"');
    expect(app).toContain('<CustomerGate><QuickFit /></CustomerGate>');
    expect(app).toContain('<AdminGate><OperationsDashboard /></AdminGate>');
    expect(adminGate).toContain('user?.role !== "admin"');
  });

  it("keeps shared NORMAL login separate from logout and administrator product-management entry", () => {
    const header = readFileSync(new URL("../client/src/components/AppHeader.tsx", import.meta.url), "utf8");
    const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    expect(header).toContain('onClick={() => choose("/login")}');
    expect(header).not.toContain("startLogin(location)");
    expect(header).toContain("await logout()");
    expect(header).toContain("상품 관리 · 옷 추가");
    expect(header).toContain("const showCatalogManage = showAdminManage");
    expect(header).not.toContain("capabilities.quickAI");
    expect(dbSource).toContain('user.openId === ENV.ownerOpenId ? "admin"');
  });

  it("keeps the home title higher and supports optional brand plus F free-size product data", () => {
    const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
    const manager = readFileSync(new URL("../client/src/pages/ProductManagerV2.tsx", import.meta.url), "utf8");
    const sizing = readFileSync(new URL("../client/src/components/CategorySizingEditor.tsx", import.meta.url), "utf8");
    expect(home).toContain("justify-center pb-12");
    expect(schema).toContain('brand: varchar("brand", { length: 120 })');
    expect(manager).toContain("brand: draft.brand.trim() || null");
    expect(sizing).toContain('top: ["F", "S", "M", "L"]');
    expect(sizing).toContain('label: "F", available: true');
  });

  it("opens customer product details before the existing QR purchase screen", () => {
    const catalog = readFileSync(new URL("./routers/catalog.ts", import.meta.url), "utf8");
    const detail = readFileSync(new URL("../client/src/components/ProductDetailScreen.tsx", import.meta.url), "utf8");
    const editorial = readFileSync(new URL("../client/src/components/EditorialPurchaseBar.tsx", import.meta.url), "utf8");
    const result = readFileSync(new URL("../client/src/components/LookResultPanel.tsx", import.meta.url), "utf8");
    expect(catalog).toContain("productDetail: publicProcedure");
    expect(catalog).toContain("purchaseStatus");
    expect(detail).toContain("<PurchaseScreen productId={product.id}");
    expect(detail).toContain("localizedProductDescription(product, language)");
    expect(editorial).toContain("<ProductDetailScreen productId={detailId}");
    expect(result).toContain("<ProductDetailScreen productId={detailId}");
  });

  it("keeps QUICK FIT in an explicit select-look, choose-display, then generate order", () => {
    const quickFit = readFileSync(new URL("../client/src/pages/QuickFit.tsx", import.meta.url), "utf8");
    expect(quickFit).not.toContain("void generateQuickFit(selectedProducts, selection.selectedLookId, selection.styleName)");
    expect(quickFit).toContain("onClick={() => generateQuickFit()}");
    expect(quickFit).toContain('id="quick-fit-generate"');
    expect(quickFit).toContain('scrollIntoView({ behavior: "smooth", block: "center" })');
    expect(quickFit).toContain('aria-live="polite"');
  });

  it("marks the selected QUICK FIT recommendation with a high-contrast border and check badge", () => {
    const stylist = readFileSync(new URL("../client/src/components/StylistPanel.tsx", import.meta.url), "utf8");
    expect(stylist).toContain("const [selectedLookId, setSelectedLookId]");
    expect(stylist).toContain('setSelectedLookId(recommendation.lookId)');
    expect(stylist).toContain('border-black ring-2 ring-black/20');
    expect(stylist).toContain("<Check size={10}");
    expect(stylist).toContain('aria-pressed={isSelected}');
  });

  it("keeps all active products browseable by category even when generation access is unavailable", () => {
    const catalog = readFileSync(new URL("../server/routers/catalog.ts", import.meta.url), "utf8");
    const browse = readFileSync(new URL("../client/src/pages/BrowseProducts.tsx", import.meta.url), "utf8");
    const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    expect(catalog).toContain("browseProducts: publicProcedure");
    expect(catalog).toContain("product.isActive !== 0");
    expect(browse).toContain("trpc.catalog.browseProducts.useQuery()");
    expect(browse).toContain("<ProductDetailScreen productId={detailId} browseAll");
    expect(home).toContain('navigate("/catalog")');
  });

  it("uses PURCHASE_LIST by default while retaining QR mode and latest product validation as backward-compatible settings", () => {
    const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
    const purchase = readFileSync(new URL("./routers/purchase.ts", import.meta.url), "utf8");
    const admin = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
    expect(schema).toContain('purchaseMode: mysqlEnum("purchaseMode", ["PURCHASE_LIST", "QR", "DISABLED"]).default("PURCHASE_LIST")');
    expect(schema).toContain('purchaseListMaxItems: int("purchaseListMaxItems").default(10)');
    expect(purchase).toContain('settings.purchaseMode !== "PURCHASE_LIST"');
    expect(purchase).toContain("PURCHASE_ITEM_UNAVAILABLE");
    expect(purchase).toContain("PURCHASE_SIZE_UNAVAILABLE");
    expect(purchase).toContain("currentPrice: pricing.unitPrice");
    expect(admin).toContain('purchaseMode: z.enum(["PURCHASE_LIST", "QR", "DISABLED"])');
  });

  it("keeps one shared, persisted purchase list across product detail, AI fitting, QUICK FIT, and the manual WeChat request card", () => {
    const context = readFileSync(new URL("../client/src/contexts/PurchaseListContext.tsx", import.meta.url), "utf8");
    const detail = readFileSync(new URL("../client/src/components/ProductDetailScreen.tsx", import.meta.url), "utf8");
    const result = readFileSync(new URL("../client/src/components/LookResultPanel.tsx", import.meta.url), "utf8");
    const editorial = readFileSync(new URL("../client/src/components/EditorialPurchaseBar.tsx", import.meta.url), "utf8");
    const list = readFileSync(new URL("../client/src/pages/PurchaseList.tsx", import.meta.url), "utf8");
    const card = readFileSync(new URL("../client/src/components/PurchaseRequestCard.tsx", import.meta.url), "utf8");
    const notices = readFileSync(new URL("../client/src/pages/PurchaseNoticeManager.tsx", import.meta.url), "utf8");
    expect(context).toContain('const STORAGE_KEY = "lesoulPurchaseList"');
    expect(context).toContain("purchase_list_item_added");
    expect(detail).toContain("<PurchaseListAddButton");
    expect(result).toContain('source="ai_fitting"');
    expect(editorial).toContain('source="quick_fit"');
    expect(list).toContain("trpc.purchase.createRequest.useMutation");
    expect(list).toContain("selectedSize");
    expect(card).toContain("purchase_request_saved");
    expect(card).toContain("WeChat");
    expect(card).toContain("purchaseNoticeKo");
    expect(notices).toContain("purchaseMode: config.data.purchaseMode");
    expect(notices).toContain("send it to LESOUL via WeChat");
  });

  it("separates public visibility from selling availability, supports NEW and reservation purchase, and excludes unavailable items from AI Stylist by default", () => {
    const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
    const manager = readFileSync(new URL("../client/src/pages/ProductManagerV2.tsx", import.meta.url), "utf8");
    const availability = readFileSync(new URL("../shared/productAvailability.ts", import.meta.url), "utf8");
    const purchase = readFileSync(new URL("./routers/purchase.ts", import.meta.url), "utf8");
    const stylist = readFileSync(new URL("./routers/stylist.ts", import.meta.url), "utf8");
    const context = readFileSync(new URL("../client/src/contexts/PurchaseListContext.tsx", import.meta.url), "utf8");
    const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    expect(schema).toContain('availabilityStatus: mysqlEnum("availabilityStatus", ["IN_STOCK", "PRE_ORDER", "SOLD_OUT"])');
    expect(schema).toContain('isNew: int("isNew").default(0)');
    expect(schema).toContain('stylistIncludePreorder: int("stylistIncludePreorder").default(0)');
    expect(manager).toContain('availabilityStatus: "IN_STOCK"');
    expect(manager).toContain('value={draft.isActive ? draft.availabilityStatus : "UNPUBLISHED"}');
    expect(availability).toContain("return Boolean(product.isNew)");
    expect(purchase).toContain('product.availabilityStatus === "SOLD_OUT"');
    expect(purchase).toContain('purchaseType: product.availabilityStatus === "PRE_ORDER"');
    expect(stylist).toContain("getActiveStylistProducts(Boolean(settings.stylistIncludePreorder))");
    expect(context).toContain('purchaseType?: "NORMAL" | "RESERVATION"');
    expect(home).toContain("NEW ARRIVALS");
  });

  it("keeps visual-reference and actual-measurement guidance concise across result, detail, list, and saved request surfaces", () => {
    const notice = readFileSync(new URL("../client/src/components/FitReferenceNotice.tsx", import.meta.url), "utf8");
    const result = readFileSync(new URL("../client/src/components/LookResultPanel.tsx", import.meta.url), "utf8");
    const detail = readFileSync(new URL("../client/src/components/ProductDetailScreen.tsx", import.meta.url), "utf8");
    const list = readFileSync(new URL("../client/src/pages/PurchaseList.tsx", import.meta.url), "utf8");
    const card = readFileSync(new URL("../client/src/components/PurchaseRequestCard.tsx", import.meta.url), "utf8");
    const provider = readFileSync(new URL("./fashionProvider.ts", import.meta.url), "utf8");
    expect(notice).toContain("AI fitting images are for visual reference only");
    expect(notice).toContain("실제 핏과 차이가 있을 수 있으니");
    expect(notice).toContain("AI试穿效果仅供穿搭参考");
    expect(result).toContain('context="result"');
    expect(detail).toContain('context="detail"');
    expect(list).toContain('context="purchase"');
    expect(card).toContain('context="request"');
    expect(provider).toContain("PHYSICAL SCALE AUTHORITY");
  });

  it("keeps display categories multilingual while Base Category remains the stable sizing and AI contract", () => {
    const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
    const admin = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
    const categoryDb = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    const manager = readFileSync(new URL("../client/src/pages/ProductManagerV2.tsx", import.meta.url), "utf8");
    const dashboard = readFileSync(new URL("../client/src/pages/OperationsDashboard.tsx", import.meta.url), "utf8");
    const provider = readFileSync(new URL("./fashionProvider.ts", import.meta.url), "utf8");
    const studio = readFileSync(new URL("../client/src/pages/Studio.tsx", import.meta.url), "utf8");
    const quickFit = readFileSync(new URL("../client/src/pages/QuickFit.tsx", import.meta.url), "utf8");
    expect(schema).toContain('export const productCategories = mysqlTable("productCategories"');
    expect(schema).toContain('displayCategoryId: int("displayCategoryId")');
    expect(admin).toContain("createProductCategory: ownerProcedure");
    expect(admin).toContain("updateProductCategory: ownerProcedure");
    expect(categoryDb).toContain("The Base Category cannot change while products use this category.");
    expect(dashboard).toContain("CategoryManagementPanel");
    expect(manager).not.toContain("CategoryManagementPanel");
    expect(manager).toContain("displayCategoryId: draft.displayCategoryId");
    expect(manager).toContain("const firstActive = (managedCategories.data ?? []).find");
    expect(provider).toContain("Stable Base Category");
    expect(studio).toContain("displayCategoryName");
    expect(quickFit).toContain("displayCategoryName");
  });
});
