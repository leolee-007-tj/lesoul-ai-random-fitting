import { describe, expect, it } from "vitest";
import type { Background, Product } from "../drizzle/schema";
import { selectOutfit } from "./styling";

const product = (id: number, category: Product["category"], overrides: Partial<Product> = {}): Product => ({
  id,
  name: `Item ${id}`,
  category,
  season: "봄,가을",
  color: category === "bottom" ? "블랙" : "아이보리",
  style: "출근,데이트",
  status: "in_stock",
  price: 100000,
  imageUrl: "image.jpg",
  description: "description",
  purchaseUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const backgrounds: Background[] = [{ id: 1, name: "갤러리", promptKeyword: "gallery", styleTags: "출근,데이트", imageUrl: null, createdAt: new Date() }];

function sequence(values: number[]) {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe("selectOutfit", () => {
  const catalog = [
    product(1, "top"),
    product(2, "bottom"),
    product(3, "outer"),
    product(4, "dress"),
    product(5, "dress", { status: "sold_out" }),
  ];

  it("uses a dress-only look when the type draw is below 30% and never returns sold-out stock", () => {
    const outfit = selectOutfit(catalog, backgrounds, sequence([0.29, 0, 0]));
    expect(outfit.type).toBe("dress");
    expect(outfit.dress?.id).toBe(4);
    expect(outfit.top).toBeNull();
    expect(outfit.bottom).toBeNull();
    expect(outfit.outer).toBeNull();
    expect(outfit.dress?.status).toBe("in_stock");
  });

  it("uses separate pieces when the type draw is 30% or greater and skips outer below the 30% outer threshold", () => {
    const outfit = selectOutfit(catalog, backgrounds, sequence([0.3, 0, 0.29, 0]));
    expect(outfit.type).toBe("separates");
    expect(outfit.top?.category).toBe("top");
    expect(outfit.bottom?.category).toBe("bottom");
    expect(outfit.outer).toBeNull();
  });

  it("includes a compatible outer when the outer draw is 30% or greater", () => {
    const outfit = selectOutfit(catalog, backgrounds, sequence([0.7, 0, 0.3, 0, 0]));
    expect(outfit.type).toBe("separates");
    expect(outfit.outer?.category).toBe("outer");
    expect(outfit.outer?.status).toBe("in_stock");
  });

  it("fails gracefully rather than weakening compatibility rules", () => {
    const incompatibleCatalog = [
      product(1, "top", { color: "버건디", style: "출근", season: "겨울" }),
      product(2, "bottom", { color: "그린", style: "캐주얼", season: "여름" }),
      product(3, "outer", { color: "블랙", style: "출근", season: "겨울" }),
      product(4, "dress"),
    ];
    expect(() => selectOutfit(incompatibleCatalog, backgrounds, sequence([0.7, 0]))).toThrow("호환 가능한 코디");
  });
});
