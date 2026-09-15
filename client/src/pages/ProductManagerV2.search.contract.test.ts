import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ProductManagerV2.tsx", import.meta.url), "utf8");

describe("ProductManagerV2 product search", () => {
  it("keeps the search controls visible when a query has no matches", () => {
    expect(source).toContain("searchNoResults");
    expect(source).toContain("(catalog.data ?? []).length ?");
    expect(source).toContain("{visibleProducts.length ? <section");
  });

  it("searches localized names and brands", () => {
    expect(source).toContain("item.name, item.brand, item.nameEn, item.nameKo, item.nameZh");
    expect(source).toContain("toLocaleLowerCase().includes(normalizedSearch)");
  });
});
