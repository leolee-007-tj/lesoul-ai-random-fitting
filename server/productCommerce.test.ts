import { describe, expect, it } from "vitest";
import { calculateDiscountedPrice, calculateSalePrice, formatSaleDiscount, getEffectivePrice, getQuantityDiscountPercent, getSalePriceState, localizedProductDescription, localizedProductName } from "../shared/productCommerce";

const product = {
  name: "Legacy name",
  nameEn: "Silk Shirt",
  nameKo: "실크 셔츠",
  nameZh: "真丝衬衫",
  description: "Legacy description",
  descriptionEn: "A refined silk shirt.",
  descriptionKo: "정제된 실크 셔츠입니다.",
  descriptionZh: "精致的真丝衬衫。",
  price: 1000,
  discountSeasonEnabled: 1,
  discountOnePercent: 20,
  discountTwoPercent: 25,
  discountThreePercent: 30,
  discountFourPlusPercent: 35,
  momentCouponEnabled: 1,
  momentCouponCode: "MOMENT10",
  momentCouponPercent: 10,
};

describe("product commerce helpers", () => {
  it("selects localized product content and falls back to the legacy field", () => {
    expect(localizedProductName(product, "ko")).toBe("실크 셔츠");
    expect(localizedProductDescription(product, "zh-CN")).toBe("精致的真丝衬衫。");
    expect(localizedProductName({ ...product, nameKo: null }, "ko")).toBe("Legacy name");
  });

  it("shows the current system-language name after a Chinese-source product is localized", () => {
    const chineseSourceProduct = {
      ...product,
      name: "羊毛风衣",
      nameZh: "羊毛风衣",
      nameKo: "울 트렌치코트",
      nameEn: "Wool Trench Coat",
      description: "双排扣羊毛风衣。",
      descriptionZh: "双排扣羊毛风衣。",
      descriptionKo: "더블브레스트 울 트렌치코트입니다.",
      descriptionEn: "A double-breasted wool trench coat.",
    };
    expect(localizedProductName(chineseSourceProduct, "ko")).toBe("울 트렌치코트");
    expect(localizedProductName(chineseSourceProduct, "en")).toBe("Wool Trench Coat");
    expect(localizedProductDescription(chineseSourceProduct, "ko")).toBe("더블브레스트 울 트렌치코트입니다.");
  });

  it("applies the configured quantity discount ladder", () => {
    expect([1, 2, 3, 4].map((quantity) => getQuantityDiscountPercent(product, quantity))).toEqual([20, 25, 30, 35]);
    expect(calculateDiscountedPrice(product, 1)).toMatchObject({ baseTotal: 1000, tierPercent: 20, total: 800 });
    expect(calculateDiscountedPrice(product, 4)).toMatchObject({ baseTotal: 4000, tierPercent: 35, total: 2600 });
  });

  it("adds a valid Moment coupon after the tier discount and rejects a wrong code", () => {
    expect(calculateDiscountedPrice(product, 2, "moment10")).toMatchObject({ tierPercent: 25, couponPercent: 10, total: 1350 });
    expect(calculateDiscountedPrice(product, 2, "WRONG")).toMatchObject({ tierPercent: 25, couponPercent: 0, total: 1500 });
  });

  it("calculates single-product sales with nearest-whole CNY rounding", () => {
    expect(calculateSalePrice(999, 20)).toBe(799);
    expect(calculateSalePrice(999, 30)).toBe(699);
    expect(calculateSalePrice(999, 40)).toBe(599);
    expect(calculateSalePrice(999, 45)).toBe(549);
  });

  it("uses sale price only when the enabled sale fields are valid", () => {
    const sale = { ...product, priceOriginal: 1000, discountRate: 30, priceSale: 700, saleEnabled: 1 };
    expect(getSalePriceState(sale)).toMatchObject({ original: 1000, rate: 30, sale: 700, enabled: true });
    expect(getEffectivePrice(sale)).toBe(700);
    expect(getEffectivePrice({ ...sale, saleEnabled: 0 })).toBe(1000);
    expect(getEffectivePrice({ ...sale, priceSale: 1000 })).toBe(1000);
  });

  it("uses Chinese retail 折 notation only for the Chinese locale", () => {
    expect(formatSaleDiscount(20, "zh")).toBe("8折");
    expect(formatSaleDiscount(30, "zh")).toBe("7折");
    expect(formatSaleDiscount(45, "zh")).toBe("5.5折");
    expect(formatSaleDiscount(20, "en")).toBe("SALE 20%");
    expect(formatSaleDiscount(20, "ko")).toBe("SALE 20%");
  });
});
