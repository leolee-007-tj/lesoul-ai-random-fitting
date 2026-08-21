import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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
    expect(catalog).toContain("visitorId: z.string().min(1).max(96)");
    expect(catalog).toContain('ctx.user?.role === "admin" ? false');
    expect(operations).toContain("productShareAnalytics: ownerProcedure");
    expect(operations).toContain("groupBy(productShareVisits.productId)");
  });
});
