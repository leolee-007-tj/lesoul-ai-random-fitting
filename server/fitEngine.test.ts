import { describe, expect, it } from "vitest";
import { assessFit, assessSizes } from "../shared/fitEngine";

describe("Size-aware Fit Engine", () => {
  it("does not reshape a body to conceal a too-small non-stretch garment", () => {
    const assessment = assessFit({ bustCm: 105 }, { bustCm: 98 }, "top", "none", "slim");
    expect(assessment.status).toBe("UNLIKELY_TO_FIT");
    expect(assessment.mayNotFit).toBe(true);
    expect(assessment.visualInstruction).toContain("Do not shrink or reshape the body");
  });

  it("selects the closest viable size from actual garment measurements", () => {
    const result = assessSizes({ waistCm: 75, hipCm: 96 }, [
      { label: "S", waistCm: 71, hipCm: 92 },
      { label: "M", waistCm: 81, hipCm: 102 },
      { label: "L", waistCm: 91, hipCm: 112 },
    ], "bottom", "none");
    expect(result.recommendedSize).toBe("M");
  });
});
