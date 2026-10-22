import { describe, expect, it } from "vitest";
import { assessFit, assessSizes } from "../shared/fitEngine";
import { FIXED_MODELS } from "../shared/fixedModels";

describe("Size-aware Fit Engine", () => {
  it("does not reshape a body to conceal a too-small non-stretch garment", () => {
    const assessment = assessFit({ bustCm: 105 }, { bustCm: 98 }, "top", "none", "slim");
    expect(assessment.status).toBe("UNLIKELY_TO_FIT");
    expect(assessment.mayNotFit).toBe(true);
    expect(assessment.visualInstruction).toContain("Do not shrink or reshape the body");
  });

  it("keeps the same garment visibly distinct across the three fixed body types", () => {
    const garment = { bustCm: 86 };
    const body = (key: "petite" | "balanced" | "volume") => {
      const model = FIXED_MODELS.find((item) => item.key === key)!;
      return { bustCm: model.measurements.chest, shoulderCm: model.measurements.shoulderWidth };
    };
    const petite = assessFit(body("petite"), garment, "top", "low", "regular");
    const balanced = assessFit(body("balanced"), garment, "top", "low", "regular");
    const volume = assessFit(body("volume"), garment, "top", "low", "regular");
    expect(petite.status).toBe("REGULAR");
    expect(balanced.status).toBe("FITTED");
    expect(volume.status).toBe("UNLIKELY_TO_FIT");
    expect(new Set([petite.status, balanced.status, volume.status]).size).toBe(3);
    expect(volume.visualInstruction).toContain("Do not shrink or reshape the body");
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
