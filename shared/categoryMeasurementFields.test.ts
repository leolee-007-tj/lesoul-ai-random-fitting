import { describe, expect, it } from "vitest";
import { categoryMeasurementFields, defaultMeasurementFields, moveMeasurementField, normalizeMeasurementFields, reorderMeasurementFields } from "./categoryMeasurementFields";

describe("category measurement field templates", () => {
  it("uses safe legacy defaults for every base category", () => {
    expect(defaultMeasurementFields("TOP")).toEqual(["shoulderCm", "bustCm", "sleeveCm", "totalLengthCm"]);
    expect(defaultMeasurementFields("PANTS")).toContain("inseamCm");
    expect(defaultMeasurementFields("SHOES")).toEqual(["totalLengthCm"]);
  });

  it("keeps valid custom field order, removes duplicates, and falls back for empty legacy data", () => {
    expect(normalizeMeasurementFields(["hipCm", "waistCm", "hipCm", "unknown"], "PANTS")).toEqual(["hipCm", "waistCm"]);
    expect(categoryMeasurementFields({ baseCategory: "DRESS", measurementFields: null })).toContain("bustCm");
  });

  it("reorders configured fields without changing the selected field set", () => {
    const fields = ["shoulderCm", "bustCm", "sleeveCm"] as const;
    expect(reorderMeasurementFields(fields, "sleeveCm", "shoulderCm")).toEqual(["sleeveCm", "shoulderCm", "bustCm"]);
    expect(moveMeasurementField(fields, "bustCm", "down")).toEqual(["shoulderCm", "sleeveCm", "bustCm"]);
  });
});
