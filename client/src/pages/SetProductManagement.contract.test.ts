import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("set-product manager contract", () => {
  it("lets the owner choose a set and manage two or more individual garment entries", () => {
    const manager = source("client/src/pages/ProductManagerV2.tsx");
    expect(manager).toContain('productType: "SINGLE" | "SET"');
    expect(manager).toContain('value="SET"');
    expect(manager).toContain("draft.setComponents.length >= 6");
    expect(manager).toContain("draft.setComponents.length <= 2");
    expect(manager).toContain("sumSetComponentPrices(draft.setComponents)");
    expect(manager).toContain("priceReadOnly={draft.productType === \"SET\"}");
    expect(manager).toContain("representativeSetCategory(normalized)");
    expect(manager).toContain("updates.displayCategoryId = matchedCategory.id");
  });

  it("keeps product-type selection available while editing an existing product", () => {
    const manager = source("client/src/pages/ProductManagerV2.tsx");
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    expect(manager).toContain("displayCategoryId: item.displayCategoryId ?? fallbackDisplayCategory");
    expect(manager).not.toContain("CategoryManagementPanel");
    expect(manager).not.toContain("categoryPanelOpen");
    expect(categories).toContain('open ? "z-50" : "z-0"');
  });

  it("lets Fit Manager filter and select set products using their representative category", () => {
    const fitManager = source("client/src/pages/ProductFitManager.tsx");
    expect(fitManager).toContain('useState<"all" | "single" | "set">("all")');
    expect(fitManager).toContain('productFilter === "set" ? isSetProduct(product)');
    expect(fitManager).toContain("representativeSetCategory(product.setComponents");
    expect(fitManager).toContain("categoryMeasurementFields(");
    expect(fitManager).toContain("componentDrafts.length >= MAX_SET_COMPONENTS");
    expect(fitManager).toContain("onClick={addComponent}");
    expect(fitManager).toContain("setComponents: componentDrafts.map");
    expect(fitManager).toContain("localizedCategoryName(product.displayCategory, language)");
    expect(fitManager).toContain("productListCategoryLabel");
    expect(fitManager).toContain('loading="lazy"');
    expect(fitManager).toContain("productListCategoryLabel(product, i18n.language)");
  });

  it("opens a Korean category form with a measurement checklist and keeps saving usable if translation is unavailable", () => {
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    const fitManager = source("client/src/pages/ProductFitManager.tsx");
    expect(categories).toContain("translateCustomerText.useMutation");
    expect(categories).toContain("name: \"상품 종류 이름 (한국어)\"");
    expect(categories).toContain('type="checkbox" checked={draft.measurementFields?.includes(field) ?? false}');
    expect(categories).toContain("A translation outage must not prevent a Korean owner from creating a usable type.");
    expect(fitManager).toContain("const fieldsFor = (category: CoreCategory, displayCategory?");
    expect(fitManager).toContain("renderFields(measurements, category");
  });

  it("keeps the product and Fit Manager catalog paths uncapped for a 500-product inventory", () => {
    const manager = source("client/src/pages/ProductManagerV2.tsx");
    const fitManager = source("client/src/pages/ProductFitManager.tsx");
    const db = source("server/db.ts");
    expect(manager).toContain("visibleProducts.map");
    expect(manager).not.toContain("visibleProducts.slice");
    expect(fitManager).toContain("filteredCatalog.map");
    expect(fitManager).not.toContain("filteredCatalog.slice");
    expect(db).toContain("db.select().from(products)");
    expect(db).not.toContain("db.select().from(products).limit");
  });

  it("keeps the fit list compact with internal scrolling for the remaining products", () => {
    const fitManager = source("client/src/pages/ProductFitManager.tsx");
    expect(fitManager).toContain("max-h-[13.75rem]");
    expect(fitManager).toContain("overflow-y-auto");
    expect(fitManager).toContain("overscroll-contain");
  });

  it("orders actual garment measurements newest-first like the product manager", () => {
    const fitManager = source("client/src/pages/ProductFitManager.tsx");
    expect(fitManager).toContain("newArrivalAt");
    expect(fitManager).toContain("createdAt");
    expect(fitManager).toContain("rightTime - leftTime");
    expect(fitManager).toContain("right.id - left.id");
  });

  it("adds practical browsing controls without imposing a fixed catalog size", () => {
    const manager = source("client/src/pages/ProductManagerV2.tsx");
    expect(manager).toContain("useMemo");
    expect(manager).toContain("searchTerm");
    expect(manager).toContain("categoryFilter");
    expect(manager).toContain("statusFilter");
    expect(manager).toContain('sortOrder === "newest"');
    expect(manager).toContain("density === \"compact\"");
    expect(manager).not.toContain("slice(0, 500)");
  });

  it("lets the owner choose trial duration in days for creation and reset", () => {
    const manager = source("client/src/components/TrialStoreManager.tsx");
    const operations = source("server/routers/operations.ts");
    expect(manager).toContain("durationDays");
    expect(manager).toContain("restartDays");
    expect(manager).toContain("durationDays: restartDays");
    expect(operations).toContain("trialDurationDays");
    expect(operations).toContain("trialDurationMs(input.durationDays)");
    expect(operations).toContain("max(3650)");
  });

  it("keeps category creation out of the list and exposes one bottom add button", () => {
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    expect(categories).toContain('!creating && !editingId && <button type="button" onClick={startCreate}');
    expect(categories).not.toContain('justify-between gap-2"><p className="text-[11px] leading-5 text-[#746d64]">{copy.inactiveNote}</p><button type="button" onClick={startCreate}');
    expect(categories).not.toContain("useEffect(() => { if (open) startCreate(); }, [open])");
  });

  it("does not expose category creation from product type dropdowns or product modals", () => {
    const productManager = source("client/src/pages/ProductManagerV2.tsx");
    const operationsDashboard = source("client/src/pages/OperationsDashboard.tsx");
    expect(productManager).not.toContain("__add_category__");
    expect(productManager).not.toContain("setCategoryPanelOpen(true)");
    expect(operationsDashboard).toContain("CategoryManagementPanel");
    expect(operationsDashboard).toContain("setCategoryPanelOpen(true)");
  });

  it("keeps product-type creation in the operations dashboard instead of active product modals", () => {
    const productManager = source("client/src/pages/ProductManagerV2.tsx");
    const operationsDashboard = source("client/src/pages/OperationsDashboard.tsx");
    expect(productManager).not.toContain("autoStartCreate");
    expect(productManager).not.toContain("categoryPanelOpen");
    expect(operationsDashboard).toContain("종류 · 치수 관리");
  });

  it("shows product-type creation only in the operations dashboard, not product add or edit modals", () => {
    const productManager = source("client/src/pages/ProductManagerV2.tsx");
    const operationsDashboard = source("client/src/pages/OperationsDashboard.tsx");
    expect(productManager).not.toContain("상품 종류 추가");
    expect(operationsDashboard).toContain("CategoryManagementPanel");
  });

  it("keeps the customer-facing set total and individual components together through catalog and purchase flows", () => {
    const detail = source("client/src/components/ProductDetailScreen.tsx");
    const list = source("client/src/pages/PurchaseList.tsx");
    const catalog = source("server/routers/catalog.ts");
    const purchase = source("server/routers/purchase.ts");
    expect(detail).toContain("copy.components");
    expect(detail).toContain("localizedSetComponentName(component, language)");
    expect(list).toContain("copy.includes");
    expect(catalog).toContain("productType: product.productType, setComponents: product.setComponents");
    expect(purchase).toContain("productType: product.productType, setComponents: product.setComponents");
  });
});
