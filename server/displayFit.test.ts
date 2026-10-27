import {describe,it,expect} from "vitest";
import {displayFit} from "./displayFit";
import {isStylistEligible} from "../shared/productAvailability";
describe("measurement-aware display recommendations",()=>{
 it("ranks a measured comfortable garment ahead of a tight one",()=>{const body={bustCm:90};const good=displayFit(body,{category:"top",garmentMeasurements:{bustCm:100}});const tight=displayFit(body,{category:"top",garmentMeasurements:{bustCm:80}});expect(good.rankBonus).toBeGreaterThan(tight.rankBonus);expect(tight.assessment.mayNotFit).toBe(true);});
 it("uses an available larger size instead of excluding the entire product",()=>{const fit=displayFit({bustCm:100},{category:"top",sizeOptions:[{label:"S",bustCm:80},{label:"L",bustCm:108},{label:"XL",bustCm:120,available:false}]});expect(fit.recommendedSize).toBe("L");expect(fit.assessment.mayNotFit).toBe(false);});
 it("does not invent measurement compatibility when garment data is missing",()=>{expect(displayFit({waistCm:70},{category:"bottom"})).toMatchObject({measured:false,rankBonus:0});});
 it("excludes zero stock regardless of stale in-stock status",()=>{expect(isStylistEligible({availabilityStatus:"IN_STOCK",inventoryQuantity:0})).toBe(false);expect(isStylistEligible({availabilityStatus:"IN_STOCK",inventoryQuantity:2})).toBe(true);});
});
