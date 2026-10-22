import { describe, expect, it } from "vitest";
import { defaultBodyMeasurements } from "../shared/bodyMeasurements";
import { recommendSize } from "./sizeRecommendation";

describe("measurement-based size recommendation", () => {
  it("uses category-specific measurements and relaxes oversized items", () => {
    expect(recommendSize({ category: "top", fit: "Regular" }, { ...defaultBodyMeasurements, shoulderWidth: 39 }).size).toBe("S");
    expect(recommendSize({ category: "bottom", fit: "Regular" }, { ...defaultBodyMeasurements, waist: 85 }).size).toBe("L");
    expect(recommendSize({ category: "outer", fit: "Oversized" }, defaultBodyMeasurements).size).toBe("One size");
  });
});
