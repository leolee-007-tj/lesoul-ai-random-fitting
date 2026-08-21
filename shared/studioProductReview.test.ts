import { describe, expect, it } from "vitest";
import { canApproveStudioReview, createStudioReviewChecks, resetStudioReviewViews, studioReviewCheckKeys } from "./studioProductReview";

describe("studio product review approval", () => {
  it("requires both front and back candidates and every detail check before approval", () => {
    const checks = createStudioReviewChecks();
    expect(canApproveStudioReview(checks, true, true)).toBe(false);
    for (const view of ["front", "back"] as const) for (const key of studioReviewCheckKeys) checks[view][key] = true;
    expect(canApproveStudioReview(checks, false, true)).toBe(false);
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
