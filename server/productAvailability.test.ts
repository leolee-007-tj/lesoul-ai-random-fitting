import { describe, expect, it } from "vitest";
import { isNewArrival, isStylistEligible, legacyStatusForAvailability, normaliseAvailabilityStatus } from "../shared/productAvailability";

describe("product availability and new-arrival policy", () => {
  it("preserves stable standard availability values while supporting legacy stored records", () => {
    expect(normaliseAvailabilityStatus("IN_STOCK")).toBe("IN_STOCK");
    expect(normaliseAvailabilityStatus("PRE_ORDER")).toBe("PRE_ORDER");
    expect(normaliseAvailabilityStatus("SOLD_OUT")).toBe("SOLD_OUT");
    expect(normaliseAvailabilityStatus("AVAILABLE")).toBe("IN_STOCK");
    expect(normaliseAvailabilityStatus("PREORDER")).toBe("PRE_ORDER");
    expect(normaliseAvailabilityStatus(undefined, "sold_out")).toBe("SOLD_OUT");
    expect(legacyStatusForAvailability("PRE_ORDER")).toBe("in_stock");
  });

  it("treats NEW as an administrator-controlled flag, never a registration date calculation", () => {
    expect(isNewArrival({ isNew: false })).toBe(false);
    expect(isNewArrival({ isNew: true })).toBe(true);
    expect(isNewArrival({ isNew: 1 })).toBe(true);
  });

  it("excludes sold out and unpublished products from Style Match while allowing configured pre-orders", () => {
    expect(isStylistEligible({ isActive: 1, availabilityStatus: "IN_STOCK" })).toBe(true);
    expect(isStylistEligible({ isActive: 1, availabilityStatus: "PRE_ORDER" })).toBe(false);
    expect(isStylistEligible({ isActive: 1, availabilityStatus: "PRE_ORDER" }, true)).toBe(true);
    expect(isStylistEligible({ isActive: 1, availabilityStatus: "SOLD_OUT" }, true)).toBe(false);
    expect(isStylistEligible({ isActive: 0, availabilityStatus: "IN_STOCK" })).toBe(false);
  });
});


it("excludes stale zero-stock and hidden products from lookbook selection while preserving legacy unknown stock",()=>{
 expect(isStylistEligible({isActive:1,availabilityStatus:"IN_STOCK",inventoryQuantity:0},true)).toBe(false);
 expect(isStylistEligible({isActive:1,availabilityStatus:"SOLD_OUT",inventoryQuantity:5},true)).toBe(false);
 expect(isStylistEligible({isActive:0,availabilityStatus:"IN_STOCK",inventoryQuantity:5},true)).toBe(false);
 expect(isStylistEligible({isActive:1,availabilityStatus:"IN_STOCK",inventoryQuantity:null},true)).toBe(true);
});
