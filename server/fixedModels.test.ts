import { describe, expect, it } from "vitest";
import { FIXED_MODELS, getFixedModel } from "../shared/fixedModels";

describe("fixed AI fashion models", () => {
  it("provides exactly three persistent and visually distinct model profiles", () => {
    expect(FIXED_MODELS.map((model) => model.key)).toEqual(["balanced", "volume", "petite"]);
    expect(new Set(FIXED_MODELS.map((model) => model.imageUrl)).size).toBe(3);
    expect(getFixedModel("balanced")?.measurements.height).toBeGreaterThan(getFixedModel("petite")!.measurements.height);
    expect(getFixedModel("volume")?.measurements.hip).toBeGreaterThan(getFixedModel("balanced")!.measurements.hip);
  });
});
