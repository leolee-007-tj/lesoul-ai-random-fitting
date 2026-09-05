import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("store display account contract", () => {
  it("keeps the role distinct and restricts customer procedures to read-only display use", () => {
    const schema = read("drizzle/schema.ts");
    const trpc = read("server/_core/trpc.ts");
    expect(schema).toContain('"store_display"');
    expect(trpc).toContain("storeDisplayProcedure");
    expect(trpc).toContain("STORE_DISPLAY_READ_ONLY");
  });

  it("exposes only the camera-free display catalogue through the display procedure", () => {
    const catalog = read("server/routers/catalog.ts");
    expect(catalog).toContain("storeDisplayProducts: storeDisplayProcedure");
    expect(catalog).toContain("product.vipEarlyAccess !== 1");
  });

  it("uses a display-only route for large horizontally swipeable catalogue cards", () => {
    const app = read("client/src/App.tsx");
    const customerGate = read("client/src/components/CustomerGate.tsx");
    const displayCatalogue = read("client/src/pages/StoreDisplayCatalog.tsx");
    expect(app).toContain('<StoreDisplayGate><StoreDisplayCatalog /></StoreDisplayGate>');
    expect(app).not.toContain("PresenceAlert");
    expect(customerGate).toContain('user?.role === "store_display"');
    expect(displayCatalogue).toContain("catalog.storeDisplayProducts.useQuery");
    expect(displayCatalogue).toContain("overflow-x-auto");
    expect(displayCatalogue).not.toContain("getUserMedia");
  });

  it("keeps customer-facing merchandising information without adding purchase actions", () => {
    const displayCatalogue = read("client/src/pages/StoreDisplayCatalog.tsx");
    expect(displayCatalogue).toContain("<ProductPrice product={product}");
    expect(displayCatalogue).toContain("<ProductStatusBadges");
    expect(displayCatalogue).toContain("showAvailability={false}");
    expect(displayCatalogue).not.toContain("PurchaseListAddButton");
  });
});
