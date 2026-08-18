import { describe, expect, it } from "vitest";
import { demoProducts } from "./catalogSeed";
import { recommendTopLooks, validateRecommendedProductIds } from "./stylistEngine";
import { DEFAULT_STYLE_PRESETS } from "../shared/stylist";
import type { Product } from "../drizzle/schema";

const catalogProducts: Product[] = demoProducts.map((product, index) => ({ ...product, id: index + 1, createdAt: new Date(0), updatedAt: new Date(0) }));
const activeProducts = catalogProducts.filter((product) => product.status === "in_stock");
const quietLuxury = DEFAULT_STYLE_PRESETS.find((preset) => preset.key === "quiet_luxury")!;

describe("AI Stylist compatibility recommendations", () => {
  it("returns at most three score-ordered looks made solely from active product IDs", () => {
    const looks = recommendTopLooks({ activeProducts, preset: quietLuxury });
    expect(looks.length).toBeGreaterThan(0);
    expect(looks.length).toBeLessThanOrEqual(3);
    expect(looks.every((look) => look.score >= 0 && look.score <= 100)).toBe(true);
    expect(looks.every((look, index) => index === 0 || look.score <= looks[index - 1]!.score)).toBe(true);
    looks.forEach((look) => validateRecommendedProductIds(look.productIds, activeProducts));
  });

  it("retains an active anchor item in every STYLE THIS ITEM recommendation", () => {
    const anchor = activeProducts.find((product) => product.category === "outer")!;
    const looks = recommendTopLooks({ activeProducts, preset: quietLuxury, anchorProductId: anchor.id });
    expect(looks.length).toBeGreaterThan(0);
    expect(looks.every((look) => look.productIds.includes(anchor.id) && look.anchorProductId === anchor.id)).toBe(true);
  });

  it("rejects inactive or invented product IDs", () => {
    const inactive = catalogProducts.find((product) => product.status === "sold_out")!;
    expect(() => recommendTopLooks({ activeProducts, preset: quietLuxury, anchorProductId: inactive.id })).toThrow(/not active inventory/i);
    expect(() => validateRecommendedProductIds([999999], activeProducts)).toThrow(/existing active product IDs/i);
  });

  it("locks customer-facing recommendation reasons to the requested locale", () => {
    expect(recommendTopLooks({ activeProducts, preset: quietLuxury, locale: "ko" })[0]?.reason).toContain("LESOUL 룩");
    expect(recommendTopLooks({ activeProducts, preset: quietLuxury, locale: "zh" })[0]?.reason).toContain("LESOUL 造型");
    expect(recommendTopLooks({ activeProducts, preset: quietLuxury, locale: "en" })[0]?.reason).toMatch(/^A /);
  });
});
