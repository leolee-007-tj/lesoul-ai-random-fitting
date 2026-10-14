import { describe, expect, it } from "vitest";
import { shouldRetryStylistRecommendation, shouldShowStylistStatusBadge, stylistErrorMessage, stylistGridClass } from "./StylistPanel";

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

  it("keeps 1-2 columns on mobile and expands to 3-4 columns from the iPad breakpoint", () => {
    expect(stylistGridClass(1)).toBe("grid-cols-1");
    expect(stylistGridClass(2)).toBe("grid-cols-2");
    expect(stylistGridClass(3)).toBe("grid-cols-2 sm:grid-cols-3");
    expect(stylistGridClass(4)).toBe("grid-cols-2 sm:grid-cols-4");
    expect(stylistGridClass(99)).toBe("grid-cols-2 sm:grid-cols-4");
  });
});
