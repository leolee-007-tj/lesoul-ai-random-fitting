import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { demoBackgrounds, demoPoses, demoProducts } from "./catalogSeed";
import { appRouter } from "./routers";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("LESOUL catalog seed contract", () => {
  it("ships the requested product, pose, and background demo catalog", () => {
    expect(demoProducts).toHaveLength(20);
    expect(demoProducts.filter((product) => product.status === "in_stock")).toHaveLength(18);
    expect(demoPoses.map((pose) => pose.name)).toEqual(["Natural Standing", "Front Model Pose", "Side Pose", "Walking", "Hand in Pocket", "Elegant Fashion Pose"]);
    expect(demoBackgrounds).toHaveLength(10);
  });
});

describe("LESOUL experience API contract", () => {
  it("keeps catalog, curation, purchase, and administrator routes available", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toEqual(expect.arrayContaining([
      "catalog.bootstrap", "catalog.products", "catalog.productDetail", "catalog.browseProducts",
      "admin.products", "admin.productCategories", "admin.createProduct", "admin.updateProduct", "admin.deleteProduct", "admin.deleteProducts", "admin.deleteAllProducts",
      "stylist.presets", "stylist.products", "stylist.published", "stylist.recommend", "stylist.feedback", "purchase.createRequest",
    ]));
  });
});

describe("administrator product deletion contract", () => {
  it("keeps one, selected, and all-product deletion routes owner-protected", () => {
    const adminSource = source("./routers/admin.ts");
    expect(adminSource).toContain("deleteProduct: ownerProcedure");
    expect(adminSource).toContain("deleteProducts: ownerProcedure");
    expect(adminSource).toContain("deleteAllProducts: ownerProcedure");
  });
  it("requires an explicit DELETE ALL phrase before the destructive UI action is enabled", () => {
    const managerSource = source("../client/src/pages/ProductManagerV2.tsx");
    expect(managerSource).toContain('deleteAllPhrase.trim().toUpperCase() !== "DELETE ALL"');
  });
});

describe("historical generation status contract", () => {
  it("returns a typed object for older saved generation IDs rather than undefined", () => {
    const lookSource = source("./routers/look.ts");
    expect(lookSource).toContain('status: "not_found" as const');
    expect(lookSource).toContain("requestId: input.generationId");
  });
});

describe("customer-facing curated experience contract", () => {
  it("offers store-curated looks and catalog browsing without VIP image-model actions", () => {
    const home = source("../client/src/pages/Home.tsx");
    const studio = source("../client/src/pages/Studio.tsx");
    expect(home).toContain('navigate("/style-match")');
    expect(home).toContain('navigate("/catalog")');
    expect(home).not.toContain('navigate("/body-model")');
    expect(home).toContain("관리자 추천 코디");
    expect(studio).toContain("Image generation is no longer available");
    expect(studio).not.toContain("trpc.look.generate");
  });

  it("uses only administrator-curated results in the customer styling panel", () => {
    const stylist = source("../client/src/components/StylistPanel.tsx");
    const router = source("./routers/stylist.ts");
    expect(stylist).toContain("CURATED LOOKS");
    expect(stylist).not.toContain("body: fitBody");
    expect(router).toContain("getEligibleCuratedOutfits");
    expect(router).toContain("getPublishedCuratedOutfits");
    expect(router).toContain("published: customerReadProcedure");
    expect(router).not.toContain("prioritizeCuratedTopLooks");
  });

  it("redirects all retired image-generation bookmarks to the curated-look screen", () => {
    const app = source("../client/src/App.tsx");
    expect(app).toContain('path={"/studio"} component={() => <CustomerGate><StyleMatch /></CustomerGate>}');
    expect(app).toContain('path={"/quick-fit"} component={() => <CustomerGate><StyleMatch /></CustomerGate>}');
    expect(app).toContain('path={"/body-model"} component={() => <CustomerGate><StyleMatch /></CustomerGate>}');
    expect(app).toContain('path={"/result-preview"} component={() => <CustomerGate><StyleMatch /></CustomerGate>}');
  });

  it("separates owner operations from customer navigation without image-generation destinations", () => {
    const header = source("../client/src/components/AppHeader.tsx");
    const bottomNav = source("../client/src/components/MobileBottomNav.tsx");
    const app = source("../client/src/App.tsx");
    expect(header).toContain('const showAdminManage = user?.role === "admin" || ownerStatus.data?.isOwner === true');
    expect(bottomNav).not.toContain('href: "/quick-fit"');
    expect(bottomNav).not.toContain('href: "/body-model"');
    expect(bottomNav).toContain('href: "/operations"');
    expect(bottomNav).not.toContain('label: copy.outfits');
    expect(header).not.toContain('path: "/operations", icon: Sparkles');
    expect(app).not.toContain('path={"/outfit-management"}');
    expect(app).toContain('<AdminGate><OperationsDashboard /></AdminGate>');
  });

  it("keeps administrator operations focused on catalog, accounts, categories, and sale settings", () => {
    const dashboard = source("../client/src/pages/OperationsDashboard.tsx");
    expect(dashboard).toContain("CategoryManagementPanel");
    expect(dashboard).toContain('href="/sale-settings"');
    expect(dashboard).not.toContain("AI COST SETTINGS");
    expect(dashboard).not.toContain("updateSettings");
  });

  it("keeps all active products browseable by category and retains product detail before purchase", () => {
    const catalog = source("./routers/catalog.ts");
    const browse = source("../client/src/pages/BrowseProducts.tsx");
    const detail = source("../client/src/components/ProductDetailScreen.tsx");
    expect(catalog).toContain("browseProducts: publicProcedure");
    expect(catalog).toContain("product.isActive !== 0");
    expect(browse).toContain("trpc.catalog.browseProducts.useQuery()");
    expect(detail).toContain("<PurchaseScreen productId={product.id}");
  });

  it("keeps purchase-list flow and current availability validation", () => {
    const purchase = source("./routers/purchase.ts");
    const list = source("../client/src/pages/PurchaseList.tsx");
    expect(purchase).toContain("PURCHASE_ITEM_UNAVAILABLE");
    expect(purchase).toContain("PURCHASE_SIZE_UNAVAILABLE");
    expect(list).toContain("trpc.purchase.createRequest.useMutation");
  });

  it("uses product-photo and actual-measurement guidance without simulated fitting claims", () => {
    const notice = source("../client/src/components/FitReferenceNotice.tsx");
    expect(notice).toContain("Product images are for visual reference only");
    expect(notice).toContain("상품사진은 참고용입니다");
    expect(notice).toContain("商品图片仅供穿搭参考");
    expect(notice).not.toContain("AI fitting images");
  });

  it("keeps display categories multilingual and category sizing manager-visible", () => {
    const schema = source("../drizzle/schema.ts");
    const admin = source("./routers/admin.ts");
    const dashboard = source("../client/src/pages/OperationsDashboard.tsx");
    const manager = source("../client/src/pages/ProductManagerV2.tsx");
    expect(schema).toContain('export const productCategories = mysqlTable("productCategories"');
    expect(admin).toContain("createProductCategory: ownerProcedure");
    expect(dashboard).toContain("CategoryManagementPanel");
    expect(manager).toContain("displayCategoryId: draft.displayCategoryId");
  });
});
