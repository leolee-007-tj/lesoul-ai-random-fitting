import { describe, expect, it } from "vitest";
import { calculateAutoDisplayScale, formatKeyMeasurement, resolveCatalogDisplay } from "./catalogDisplay";

describe("catalog display normalization", () => {
  it("uses category-local physical medians and never stretches source imagery", () => {
    const products = resolveCatalogDisplay([
      { id: 1, category: "bottom", garmentMeasurements: { totalLengthCm: 90 } },
      { id: 2, category: "bottom", garmentMeasurements: { totalLengthCm: 100 } },
      { id: 3, category: "bottom", garmentMeasurements: { totalLengthCm: 110 } },
      { id: 4, category: "top", garmentMeasurements: { totalLengthCm: 60 } },
    ]);
    expect(products[0].catalogDisplay.categoryMedianCm).toBe(100);
    expect(products[0].catalogDisplay.effectiveScale).toBeLessThan(1);
    expect(products[2].catalogDisplay.effectiveScale).toBeGreaterThan(1);
    expect(products[3].catalogDisplay.effectiveScale).toBe(1);
    expect(calculateAutoDisplayScale(300, 10)).toBeLessThanOrEqual(1.08);
  });

  it("keeps manual UI placement separate from garments and clamps unsafe values", () => {
    const [product] = resolveCatalogDisplay([{ id: 1, category: "outer", garmentMeasurements: { totalLengthCm: 72 }, catalogDisplay: { manualScale: 3, objectPositionX: -30, objectPositionY: 140 } }]);
    expect(product.catalogDisplay.manualScale).toBe(1.1);
    expect(product.catalogDisplay.effectiveScale).toBe(1.1);
    expect(product.catalogDisplay.objectPositionX).toBe(0);
    expect(product.catalogDisplay.objectPositionY).toBe(100);
    expect(formatKeyMeasurement(product, "ko")).toBe("총장 72cm");
  });
});
