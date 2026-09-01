import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("administrator-curated looks only contract", () => {
  it("exposes a customer procedure that reads published administrator looks", () => {
    const router = source("./routers/stylist.ts");
    expect(router).toContain("published: customerProcedure");
    expect(router).toContain("getPublishedCuratedOutfits");
    expect(router).toContain("limit: 3");
  });

  it("does not use visitor search or user-selected anchors in the customer panel", () => {
    const panel = source("../client/src/components/StylistPanel.tsx");
    const page = source("../client/src/pages/StyleMatch.tsx");
    expect(panel).toContain("Only looks saved and published by the LESOUL administrator");
    expect(panel).toContain("trpc.stylist.published.useQuery");
    expect(panel).not.toContain("visitorId");
    expect(panel).not.toContain("anchorProductId");
    expect(panel).not.toContain("products, requireAnchor");
    expect(page).toContain("<StylistPanel onUseLook={useLook}");
    expect(page).not.toContain("trpc.stylist.products.useQuery");
  });

  it("orders customer-facing looks by the administrator's latest saved time", () => {
    const db = source("./db.ts");
    expect(db).toContain("Customer-facing curated looks follow the administrator's latest saved order");
    expect(db).toContain("new Date(right.createdAt)");
    expect(db).toContain("right.id - left.id");
  });

  it("keeps administrator writes separate from customer reads", () => {
    const manager = source("../client/src/pages/OutfitManager.tsx");
    expect(manager).toContain("trpc.admin.curatedOutfits.useQuery");
    expect(manager).toContain("trpc.admin.createCuratedOutfit.useMutation");
    expect(manager).toContain("isActive");
  });
});
