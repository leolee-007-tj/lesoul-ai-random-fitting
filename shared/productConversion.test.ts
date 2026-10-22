import { describe, expect, it } from "vitest";
import { summarizeProductConversions } from "./productConversion";

describe("product conversion analytics", () => {
  it("deduplicates daily events and calculates conversion from detail visitors", () => {
    const result = summarizeProductConversions(
      [
        { productId: 1, visitorId: "visitor_a", eventType: "DETAIL_VIEW" },
        { productId: 1, visitorId: "visitor_b", eventType: "DETAIL_VIEW" },
        { productId: 1, visitorId: "visitor_a", eventType: "PURCHASE_LIST_ADD" },
        { productId: 1, visitorId: "visitor_c", eventType: "PURCHASE_LIST_ADD" },
      ],
      [{ productId: 1, visits: 3 }],
      [{ id: 1, name: "Jacket", nameEn: "Jacket", nameKo: "재킷", nameZh: "夹克", imageUrl: null }],
    );
    expect(result.totalProductViews).toBe(2);
    expect(result.products[0]).toMatchObject({ detailVisits: 2, uniqueVisitors: 2, purchaseListAdds: 2, interestedVisitors: 2, convertedVisitors: 1, conversionRate: 50, shareVisits: 3 });
  });

  it("does not report a misleading conversion when there are no detail visitors", () => {
    const result = summarizeProductConversions(
      [{ productId: 2, visitorId: "visitor_a", eventType: "PURCHASE_LIST_ADD" }],
      [],
      [{ id: 2, name: "Pants", nameEn: null, nameKo: null, nameZh: null, imageUrl: null }],
    );
    expect(result.products[0]).toMatchObject({ uniqueVisitors: 0, convertedVisitors: 0, conversionRate: 0 });
  });

  it("omits stale product IDs without exposing visitor IDs", () => {
    const result = summarizeProductConversions(
      [{ productId: 999, visitorId: "visitor_secret", eventType: "DETAIL_VIEW" }],
      [{ productId: 999, visits: 4 }],
      [],
    );
    expect(result.products).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("visitor_secret");
  });
});
