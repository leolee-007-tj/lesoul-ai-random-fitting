import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const browse = readFileSync(new URL("./BrowseProducts.tsx", import.meta.url), "utf8");
const normalized = readFileSync(new URL("../components/NormalizedProductImage.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("../components/ProductDetailScreen.tsx", import.meta.url), "utf8");
const trial = readFileSync(new URL("./TrialStoreConsole.tsx", import.meta.url), "utf8");

describe("complete product image presentation", () => {
  it("uses the shared contain renderer for browse cards", () => {
    expect(browse).toContain("<NormalizedProductImage");
    expect(normalized).toContain("object-contain");
    expect(normalized).toContain("Math.min(catalogDisplay?.effectiveScale ?? catalogDisplay?.manualScale ?? 1, 1)");
  });

  it("places new arrivals in a separate top row for non-admin customers", () => {
    expect(browse).toContain("showNewArrivalRow = user?.role !== \"admin\"");
    expect(browse).toContain("newArrivals");
    expect(browse).toContain("NEW ARRIVALS");
    expect(browse).toContain("regularProducts");
  });

  it("keeps the complete image visible in product details and trial catalog cards", () => {
    expect(detail).toContain('className="aspect-[4/5] w-full rounded-2xl bg-[#e7e0d6] object-contain"');
    expect(detail).toContain('className="h-full w-full object-contain"');
    expect(trial).toContain('className="aspect-[4/5] w-full bg-[#f4f1eb] object-contain"');
  });
});
