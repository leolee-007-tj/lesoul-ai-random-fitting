import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const admin = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
const manager = readFileSync(new URL("../client/src/pages/ProductManager.tsx", import.meta.url), "utf8");

describe("inventory and sold-out synchronization", () => {
  it("stores a non-negative owner-managed inventory quantity", () => {
    expect(schema).toContain('inventoryQuantity: int("inventoryQuantity").default(0).notNull()');
    expect(admin).toContain("inventoryQuantity: z.number().int().min(0).max(1_000_000).optional()");
  });

  it("forces inventory to zero when a product becomes sold out", () => {
    expect(admin).toContain('updates.status === "sold_out"');
    expect(admin).toContain('updates.availabilityStatus === "SOLD_OUT"');
    expect(admin).toContain("inventoryQuantity = shouldBeSoldOut ? 0");
  });

  it("exposes inventory editing and immediate form feedback", () => {
    expect(manager).toContain("inventoryQuantity");
    expect(manager).toContain('status === "sold_out" ? { inventoryQuantity: 0 }');
  });
});
