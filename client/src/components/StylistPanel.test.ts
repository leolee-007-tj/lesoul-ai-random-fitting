import { describe, expect, it } from "vitest";
import { shouldRetryStylistRecommendation, shouldShowStylistStatusBadge, stylistErrorMessage } from "./StylistPanel";

describe("Style This Item error guidance", () => {
  it("shows a localized curated-look explanation instead of a blank recommendation area", () => {
    expect(stylistErrorMessage("network unavailable", "ko")).toContain("추천 코디");
    expect(stylistErrorMessage("network unavailable", "zh")).toContain("精选搭配");
    expect(stylistErrorMessage("network unavailable", "en")).toContain("curated looks");
  });

  it("keeps an actionable localized fallback for unexpected errors", () => {
    expect(stylistErrorMessage("network unavailable", "ko")).toContain("다시 시도");
    expect(stylistErrorMessage("network unavailable", "zh")).toContain("稍后重试");
  });

  it("allows one retry for a transient curated-look load failure", () => {
    expect(shouldRetryStylistRecommendation(0)).toBe(true);
    expect(shouldRetryStylistRecommendation(1)).toBe(false);
  });

  it("hides purchase-availability badges in the fixed-item picker only", () => {
    expect(shouldShowStylistStatusBadge("picker")).toBe(false);
    expect(shouldShowStylistStatusBadge("recommendation")).toBe(true);
  });
});
