import { describe, expect, it } from "vitest";
import { filterCatalogAvailability, isStylistEligible } from "./productAvailability";
const products = [{id:1,availabilityStatus:"IN_STOCK"}, {id:2,availabilityStatus:"PRE_ORDER"}, {id:3,availabilityStatus:"SOLD_OUT",isNew:1}, {id:4,status:"sold_out"}, {id:5,availabilityStatus:"SOLD_OUT",isActive:0}, {id:6,availabilityStatus:"IN_STOCK",isActive:false}];
describe("separate public sold-out browsing", () => {
  it("defaults to available and preorder pieces, excluding sold-out and inactive pieces", () => {expect(filterCatalogAvailability(products,"available").map(p=>p.id)).toEqual([1,2]);});
  it("groups explicit and legacy sold-out pieces, including sold-out new arrivals", () => {expect(filterCatalogAvailability(products,"sold_out").map(p=>p.id)).toEqual([3,4]);});
  it("never authorizes sold-out recommendations when viewing sold-out products", () => { for(const product of filterCatalogAvailability(products,"sold_out")) expect(isStylistEligible(product as Parameters<typeof isStylistEligible>[0],true)).toBe(false); });
});
