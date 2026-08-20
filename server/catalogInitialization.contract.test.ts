import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./db.ts", import.meta.url), "utf8");

describe("catalog initialization performance contract", () => {
  it("coalesces concurrent catalog initialization and avoids sequential default-category round trips", () => {
    expect(source).toContain("let _catalogEnsurePromise");
    expect(source).toContain("async function ensureCatalogOnce()");
    expect(source).toContain("if (!_catalogEnsurePromise)");
    expect(source).toContain("const missing = DEFAULT_MANAGED_CATEGORIES.filter");
    expect(source).toContain("await Promise.all(categories.map");
  });
});
