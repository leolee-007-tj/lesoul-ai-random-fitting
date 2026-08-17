import { describe, expect, it } from "vitest";
import { calculateDiscountedPrice, getQuantityDiscountPercent, localizedProductDescription, localizedProductName } from "../shared/productCommerce";

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

  it("applies the configured quantity discount ladder", () => {
    expect([1, 2, 3, 4].map((quantity) => getQuantityDiscountPercent(product, quantity))).toEqual([20, 25, 30, 35]);
    expect(calculateDiscountedPrice(product, 1)).toMatchObject({ baseTotal: 1000, tierPercent: 20, total: 800 });
    expect(calculateDiscountedPrice(product, 4)).toMatchObject({ baseTotal: 4000, tierPercent: 35, total: 2600 });
  });

  it("adds a valid Moment coupon after the tier discount and rejects a wrong code", () => {
    expect(calculateDiscountedPrice(product, 2, "moment10")).toMatchObject({ tierPercent: 25, couponPercent: 10, total: 1350 });
    expect(calculateDiscountedPrice(product, 2, "WRONG")).toMatchObject({ tierPercent: 25, couponPercent: 0, total: 1500 });
  });
});
