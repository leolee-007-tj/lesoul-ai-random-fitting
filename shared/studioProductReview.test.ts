import { describe, expect, it } from "vitest";
import { canApproveStudioReview, createStudioReviewChecks, resetStudioReviewViews, studioReviewCheckKeys } from "./studioProductReview";

describe("studio product review approval", () => {
  it("allows a fully reviewed single front or back result while requiring every check for each generated view", () => {
    const checks = createStudioReviewChecks();
    expect(canApproveStudioReview(checks, true, false)).toBe(false);
    for (const key of studioReviewCheckKeys) checks.front[key] = true;
    expect(canApproveStudioReview(checks, true, false)).toBe(true);
    expect(canApproveStudioReview(checks, false, true)).toBe(false);
    for (const key of studioReviewCheckKeys) checks.back[key] = true;
    expect(canApproveStudioReview(checks, true, true)).toBe(true);
  });

  it("resets only the regenerated view review checks", () => {
    const checks = createStudioReviewChecks();
    for (const key of studioReviewCheckKeys) { checks.front[key] = true; checks.back[key] = true; }
    const reset = resetStudioReviewViews(checks, ["front"]);
    expect(reset.front).toEqual({ framing: false, material: false, details: false });
    expect(reset.back).toEqual({ framing: true, material: true, details: true });
  });
});
