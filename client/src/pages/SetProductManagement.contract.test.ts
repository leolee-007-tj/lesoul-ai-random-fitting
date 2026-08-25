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
  });

  it("opens a Korean category form with a measurement checklist and keeps saving usable if translation is unavailable", () => {
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    const fitManager = source("client/src/pages/ProductFitManager.tsx");
    expect(categories).toContain("translateCustomerText.useMutation");
    expect(categories).toContain("name: \"상품 종류 이름 (한국어)\"");
    expect(categories).toContain('type="checkbox" checked={draft.measurementFields?.includes(field) ?? false}');
    expect(categories).toContain("A translation outage must not prevent a Korean owner from creating a usable type.");
    expect(fitManager).toContain("const fieldsFor = (category: CoreCategory)");
    expect(fitManager).toContain("renderFields(measurements, category");
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
