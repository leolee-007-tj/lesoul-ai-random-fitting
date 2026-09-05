import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const display = readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("store display catalog redesign", () => {
  it("keeps category filtering and adds brand search", () => {
    expect(display).toContain("trpc.catalog.storeDisplayProducts.useQuery()");
    expect(display).toContain('type Category = "all" | "top" | "bottom" | "outer" | "dress" | "shoes" | "bag"');
    expect(display).toContain("product.category === category");
    expect(display).toContain("product.brand");
    expect(display).toContain("brandPlaceholder");
    expect(display).toContain("aria-pressed={category === item}");
  });

  it("uses horizontal swipe cards and shuffles the display order", () => {
    expect(display).toContain("function shuffle");
    expect(display).toContain("useMemo(() => shuffle(catalog.data ?? [])");
    expect(display).toContain("overflow-x-auto");
    expect(display).toContain("snap-x snap-mandatory");
    expect(display).toContain("shrink-0 snap-start");
  });

  it("does not expose camera controls in the display catalog", () => {
    expect(display).not.toContain("getUserMedia");
    expect(display).not.toContain("runPreflight");
    expect(display).not.toContain("START DETECTION");
  });
});
