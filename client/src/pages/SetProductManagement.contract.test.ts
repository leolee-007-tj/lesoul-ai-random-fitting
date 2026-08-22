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
  });

  it("keeps product-type selection and dedicated category creation available while editing an existing product", () => {
    const manager = source("client/src/pages/ProductManagerV2.tsx");
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    expect(manager).toContain("displayCategoryId: item.displayCategoryId ?? null");
    expect(manager).toContain("setCategoryPanelOpen(true)");
    expect(manager).not.toContain("__add_category__");
    expect(categories).toContain('open ? "z-50" : "z-0"');
  });

  it("opens a Korean category form with a measurement checklist and keeps saving usable if translation is unavailable", () => {
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    const fitManager = source("client/src/pages/ProductFitManager.tsx");
    expect(categories).toContain("translateCustomerText.useMutation");
    expect(categories).toContain("name: \"상품 종류 이름 (한국어)\"");
    expect(categories).toContain('type="checkbox" checked={draft.measurementFields?.includes(field) ?? false}');
    expect(categories).toContain("A translation outage must not prevent a Korean owner from creating a usable type.");
    expect(fitManager).toContain("categoryMeasurementFields(product.displayCategory");
    expect(fitManager).toContain("relevant(selected).map((key)");
  });

  it("keeps category creation out of the list and exposes one bottom add button", () => {
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    expect(categories).toContain('!creating && !editingId && <button type="button" onClick={startCreate}');
    expect(categories).not.toContain('justify-between gap-2"><p className="text-[11px] leading-5 text-[#746d64]">{copy.inactiveNote}</p><button type="button" onClick={startCreate}');
    expect(categories).not.toContain("useEffect(() => { if (open) startCreate(); }, [open])");
  });

  it("does not expose category creation as a product edit dropdown option", () => {
    const productManager = source("client/src/pages/ProductManagerV2.tsx");
    expect(productManager).not.toContain("__add_category__");
    expect(productManager).toContain('onClick={() => setCategoryPanelOpen(true)}');
  });

  it("opens product-type creation visibly above the active product modal and retains the draft after creation", () => {
    const productManager = source("client/src/pages/ProductManagerV2.tsx");
    const categories = source("client/src/components/CategoryManagementPanel.tsx");
    expect(productManager).toContain('categoryPanelOpen && <div className="lesoul-safe-modal z-50 overflow-y-auto">');
    expect(productManager).toContain("autoStartCreate");
    expect(productManager).toContain("displayCategoryId: category.id");
    expect(categories).toContain("autoStartCreate = false");
    expect(categories).toContain("if (open && autoStartCreate) startCreate()");
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
