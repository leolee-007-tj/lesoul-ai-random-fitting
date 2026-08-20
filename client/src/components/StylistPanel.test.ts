import { describe, expect, it } from "vitest";
import { shouldRetryStylistRecommendation, stylistErrorMessage } from "./StylistPanel";

describe("Style This Item error guidance", () => {
  it("shows the localized quota explanation instead of a blank recommendation area", () => {
    const quota = "GENERATION_ACCESS_DENIED:style_match_quota";
    expect(stylistErrorMessage(quota, "ko")).toContain("사용 횟수를 모두 사용");
    expect(stylistErrorMessage(quota, "zh")).toContain("次数已用完");
    expect(stylistErrorMessage(quota, "en")).toContain("limit has been reached");
  });

  it("keeps an actionable localized fallback for unexpected errors", () => {
    expect(stylistErrorMessage("network unavailable", "ko")).toContain("다시 시도");
    expect(stylistErrorMessage("network unavailable", "zh")).toContain("稍后重试");
  });

  it("does not retry a deterministic quota denial but allows one transient retry", () => {
    expect(shouldRetryStylistRecommendation(0, new Error("GENERATION_ACCESS_DENIED:style_match_quota"))).toBe(false);
    expect(shouldRetryStylistRecommendation(0, new Error("network unavailable"))).toBe(true);
    expect(shouldRetryStylistRecommendation(1, new Error("network unavailable"))).toBe(false);
  });
});
