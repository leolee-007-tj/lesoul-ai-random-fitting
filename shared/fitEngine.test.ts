import { describe, expect, it } from "vitest";
import { assessFit, assessSizes } from "./fitEngine";

describe("Size-aware fit engine", () => {
  it("keeps the body fixed and flags a too-small non-stretch garment", () => {
    const fit = assessFit({ bustCm: 105 }, { bustCm: 98 }, "top", "none", "slim");
    expect(fit.status).toBe("UNLIKELY_TO_FIT");
    expect(fit.visualInstruction).toContain("Do not shrink or reshape the body");
  });
  it("distinguishes relaxed, fitted, and recommended sizes from actual measurements", () => {
    expect(assessFit({ bustCm: 84 }, { bustCm: 98 }, "top", "none").status).toBe("REGULAR");
    expect(assessFit({ bustCm: 96 }, { bustCm: 98 }, "top", "none").status).toBe("TIGHT");
    expect(assessSizes({ waistCm: 75, hipCm: 96 }, [{ label: "S", waistCm: 71, hipCm: 92 }, { label: "M", waistCm: 81, hipCm: 102 }, { label: "L", waistCm: 91, hipCm: 112 }], "bottom", "none").recommendedSize).toBe("M");
  });
});
