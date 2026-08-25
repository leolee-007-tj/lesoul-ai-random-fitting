import { describe, expect, it } from "vitest";
import { getScopedStorageKey, isValidVisitorId } from "./visitor";

describe("visitor identity recovery", () => {
  it("accepts stable visitor identifiers and rejects short or unsafe values", () => {
    expect(isValidVisitorId("visitor_saved_device")).toBe(true);
    expect(isValidVisitorId("visitor")).toBe(false);
    expect(isValidVisitorId("visitor/other")).toBe(false);
  });

  it("scopes browser data by owner identity rather than language", () => {
    expect(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device")).toBe("lesoulPurchaseList:visitor_saved_device");
    expect(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device")).toBe(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device"));
    expect(getScopedStorageKey("lesoulPurchaseList", "account:vip_123")).not.toBe(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device"));
  });
});
