import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relative: string) => readFileSync(resolve(root, relative), "utf8");

describe("central pricing integration contract", () => {
  it("stores one active pricing mode and returns it to customer purchase flows", () => {
    expect(read("drizzle/schema.ts")).toContain('pricingMode: mysqlEnum("pricingMode"');
    expect(read("server/routers/admin.ts")).toContain('pricingMode: z.enum(["BASE", "SEASON_FORMAT_1", "SEASON_FORMAT_2", "SEASON_FORMAT_3"])');
    expect(read("server/routers/purchase.ts")).toContain("pricingMode: settings.pricingMode");
  });

  it("uses the same policy in price-bearing customer displays while keeping purchase QR cards price-free", () => {
    expect(read("client/src/components/ProductPrice.tsx")).toContain("resolveCentralPrice");
    expect(read("client/src/components/PurchaseListAddButton.tsx")).toContain("resolveCentralPrice");
    expect(read("client/src/pages/PurchaseList.tsx")).toContain("totalUnits = items.reduce");
    expect(read("client/src/components/PurchaseScreen.tsx")).not.toContain("resolveCentralPrice");
    expect(read("client/src/components/PurchaseScreen.tsx")).toContain("product.purchaseQrUrl");
    expect(read("client/src/lib/productShareCard.ts")).toContain("resolveCentralPrice");
  });

  it("lets the owner select one global policy and removes confusing per-product sale controls", () => {
    const release = read("client/src/pages/ReleaseControl.tsx");
    const manager = read("client/src/pages/ProductManagerV2.tsx");
    expect(release).toContain('value={draft.pricingMode ?? "BASE"}');
    expect(release).toContain("SEASON_FORMAT_1");
    expect(release).toContain("SEASON_FORMAT_2");
    expect(release).toContain("SEASON_FORMAT_3");
    expect(manager).not.toContain("saleCopy");
    expect(manager).not.toContain("calculateSalePrice");
  });
});
