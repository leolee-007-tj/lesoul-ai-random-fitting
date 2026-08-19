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
      "admin.products", "admin.stats", "admin.createProduct", "admin.updateProduct", "admin.deleteProduct", "admin.deleteProducts", "admin.deleteAllProducts",
      "look.generate", "look.status", "stylist.presets", "stylist.recommend", "stylist.feedback",
    ]));
  });
});

describe("administrator product deletion contract", () => {
  it("keeps catalog mutations authenticated and exposes one, selected, and all-product deletion routes", () => {
    const adminSource = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
    expect(adminSource).toContain("deleteProduct: protectedProcedure");
    expect(adminSource).toContain("deleteProducts: protectedProcedure");
    expect(adminSource).toContain("deleteAllProducts: protectedProcedure");
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
  it("keeps Home focused on two primary entries and prioritizes personal model creation", () => {
    const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    const bodyModel = readFileSync(new URL("../client/src/pages/BodyModel.tsx", import.meta.url), "utf8");
    expect(home).toContain('navigate("/body-model")');
    expect(home).toContain('navigate("/quick-fit")');
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

  it("gates management navigation to administrators while retaining customer Quick Fit navigation", () => {
    const header = readFileSync(new URL("../client/src/components/AppHeader.tsx", import.meta.url), "utf8");
    const bottomNav = readFileSync(new URL("../client/src/components/MobileBottomNav.tsx", import.meta.url), "utf8");
    expect(header).toContain('const showAdminManage = user?.role === "admin"');
    expect(bottomNav).toContain('href: "/quick-fit"');
    expect(bottomNav).not.toContain('href: "/products"');
  });

  it("restores header login/logout and a clear administrator product-management entry", () => {
    const header = readFileSync(new URL("../client/src/components/AppHeader.tsx", import.meta.url), "utf8");
    const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    expect(header).toContain('onClick={() => startLogin()}');
    expect(header).toContain("await logout()");
    expect(header).toContain("상품 관리 · 옷 추가");
    expect(header).toContain("const showCatalogManage = isAuthenticated");
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

  it("starts QUICK FIT generation directly when a Stylist look is selected", () => {
    const quickFit = readFileSync(new URL("../client/src/pages/QuickFit.tsx", import.meta.url), "utf8");
    expect(quickFit).toContain("void generateQuickFit(selectedProducts, selection.selectedLookId, selection.styleName)");
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
});
