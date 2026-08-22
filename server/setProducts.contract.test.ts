import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("set-product server contract", () => {
  it("persists a product type plus an ordered component list", () => {
    const schema = source("drizzle/schema.ts");
    expect(schema).toContain('productType: mysqlEnum("productType", ["SINGLE", "SET"])');
    expect(schema).toContain('setComponents: json("setComponents")');
  });

  it("requires two or more pieces and uses the component total as the saved outer price", () => {
    const router = source("server/routers/admin.ts");
    expect(router).toContain("setComponents: z.array(setComponentInput).min(2).max(6)");
    expect(router).toContain('throw new Error("SET_NEEDS_TWO_COMPONENTS")');
    expect(router).toContain("const total = sumSetComponentPrices(components)");
    expect(router).toContain('productType: "SET" as const, setComponents: components, price: total, priceOriginal: total');
  });
});
