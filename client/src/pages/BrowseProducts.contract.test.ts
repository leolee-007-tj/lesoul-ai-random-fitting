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
    expect(normalized).toContain("Math.min(requestedScale, 0.94)");
    expect(normalized).toContain("object-contain p-1.5");
  });

  it("places new arrivals in a separate top row for every catalog viewer", () => {
    expect(browse).toContain("showNewArrivalRow = true");
    expect(browse).toContain("newArrivals");
    expect(browse).toContain("right.newArrivalAt ?? right.createdAt");
    expect(browse).toContain("NEW ARRIVALS");
    expect(browse).toContain("regularProducts");
    expect(browse).toContain("CUSTOMER_CATALOG_PAGE_SIZE = 6");
    expect(browse).toContain("chunkProducts");
    expect(browse).toContain("data-catalog-page-size={CUSTOMER_CATALOG_PAGE_SIZE}");
    expect(browse).toContain("utils.catalog.productDetail.prefetch");
    expect(browse).toContain("onPointerDown={() => prefetchDetail(product.id)}");
    expect(browse).toContain("initialProduct={initialDetailProduct}");
    expect(detail).toContain("const product = (liveProduct ?? initialProduct) as NonNullable<typeof liveProduct> | null");
    expect(browse).toContain("pricingMode={purchaseConfig.data?.pricingMode}");
    expect(browse).toContain("excludeNewArrivalsFromSale={purchaseConfig.data?.excludeNewArrivalsFromSale}");
    expect(detail).toContain("pricingMode={purchaseConfig.data?.pricingMode}");
    expect(detail).toContain("excludeNewArrivalsFromSale={purchaseConfig.data?.excludeNewArrivalsFromSale}");
  });

  it("keeps the complete image visible in product details and trial catalog cards", () => {
    expect(detail).toContain("PRODUCT_IMAGE_SURFACE_CLASS");
    expect(detail).toContain("object-contain p-2");
    expect(detail).toContain('className="h-full w-full object-contain"');
    expect(trial).toContain('className="aspect-[4/5] w-full bg-white object-contain"');
  });
});
