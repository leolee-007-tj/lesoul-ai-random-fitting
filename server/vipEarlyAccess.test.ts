import { describe, expect, it } from "vitest";
import { canViewVipEarlyAccess, selectVisibleProducts } from "./access";

const vipPreview = { id: 1, status: "in_stock", isActive: 1, availabilityStatus: "IN_STOCK" as const, vipEarlyAccess: 1, isFeatured: 0, featuredPriority: 0, catalogTier: "full", category: "top" };
const publicProduct = { ...vipPreview, id: 2, vipEarlyAccess: 0 };

describe("VIP early-access catalog visibility", () => {
  it("hides VIP previews from NORMAL users while permitting VIP and owner preview", () => {
    expect(canViewVipEarlyAccess(vipPreview, "user")).toBe(false);
    expect(canViewVipEarlyAccess(vipPreview, "vip")).toBe(true);
    expect(canViewVipEarlyAccess(vipPreview, "admin")).toBe(true);
  });

  it("keeps public pieces visible while server-filtering VIP preview products", () => {
    expect(selectVisibleProducts([vipPreview, publicProduct], "full", 6, "user").map((product) => product.id)).toEqual([2]);
    expect(selectVisibleProducts([vipPreview, publicProduct], "full", 6, "vip").map((product) => product.id)).toEqual([1, 2]);
  });
});
