import { describe, expect, it } from "vitest";
import { normalizePriceTagExtraction } from "./priceTagOcr";

describe("price tag OCR normalization", () => {
  it("normalizes maker, color, clothing name, and currency price for review", () => {
    expect(normalizePriceTagExtraction({ sourceLanguage: "zh", maker: " LESOUL ", color: "黑色", clothingName: "羊毛外套", price: 1_299.4, rawText: "LESOUL|黑色|羊毛外套|¥1,299.4", confidence: 1.4 })).toEqual({
      sourceLanguage: "zh",
      maker: "LESOUL",
      color: "黑色",
      clothingName: "羊毛外套",
      price: 1299,
      rawText: "LESOUL|黑色|羊毛外套|¥1,299.4",
      confidence: 1,
    });
  });

  it("keeps missing fields safe and refuses invalid prices", () => {
    expect(normalizePriceTagExtraction({ maker: " ", color: null, clothingName: " 셔츠 ", price: -12, rawText: "셔츠", confidence: -0.2 })).toEqual({
      sourceLanguage: "ko",
      maker: null,
      color: null,
      clothingName: "셔츠",
      price: null,
      rawText: "셔츠",
      confidence: 0,
    });
  });
});
