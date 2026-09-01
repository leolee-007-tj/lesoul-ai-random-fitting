import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { rankProductShareVisits } from "./routers/operations";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("WeChat product-share referral contract", () => {
  it("stores one opaque visitor visit per product, source, and UTC day", () => {
    const schema = source("../drizzle/schema.ts");
    const db = source("./db.ts");
    expect(schema).toContain("productShareVisits");
    expect(schema).toContain("product_share_visit_daily_unique");
    expect(schema).toContain("productId, table.visitorId, table.source, table.visitDay");
    expect(db).toContain("recordWeChatProductShareVisit");
    expect(db).toContain("onDuplicateKeyUpdate");
  });

  it("permits public link tracking but reserves aggregate viewing for the owner", () => {
    const catalog = source("./routers/catalog.ts");
    const operations = source("./routers/operations.ts");
    expect(catalog).toContain("trackWeChatShareVisit: publicProcedure");
    expect(catalog).toContain("visitorId: z.string().regex(/^visitor_[A-Za-z0-9-]{8,80}$/)");
    expect(catalog).toContain('["admin", "store_display", "store_trial"].includes(ctx.user?.role ?? "") ? false');
    expect(operations).toContain("productShareAnalytics: ownerProcedure");
    expect(operations).toContain("groupBy(productShareVisits.productId)");
  });

  it("ranks grouped counts and excludes visits for deleted products", () => {
    const result = rankProductShareVisits(
      [{ productId: 7, visits: "4" }, { productId: 3, visits: 2 }, { productId: 999, visits: 20 }],
      [
        { id: 7, name: "Jacket", nameEn: null, nameKo: null, nameZh: null, imageUrl: null, imageViews: null },
        { id: 3, name: "Pants", nameEn: null, nameKo: null, nameZh: null, imageUrl: null, imageViews: null },
      ],
    );
    expect(result.total).toBe(6);
    expect(result.products.map((item) => [item.product.id, item.visits])).toEqual([[7, 4], [3, 2]]);
  });

  it("keeps the migration contract for the Operations dashboard table", () => {
    const migration = source("../drizzle/0034_strange_miracleman.sql");
    expect(migration).toContain("CREATE TABLE `productShareVisits`");
    expect(migration).toContain("`productId` int NOT NULL");
    expect(migration).toContain("UNIQUE(`productId`,`visitorId`,`source`,`visitDay`)");
    expect(migration).toContain("REFERENCES `products`(`id`)");
  });
});
