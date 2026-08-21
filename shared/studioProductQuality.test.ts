import { describe, expect, it } from "vitest";
import { normaliseStudioImageQuality } from "./studioProductQuality";

describe("studio product image quality", () => {
  it("returns PASS only when the visual inspection has no recognized warning", () => {
    expect(normaliseStudioImageQuality({ confidence: 94, warningCodes: [] })).toEqual({ status: "PASS", confidence: 94, warningCodes: [] });
  });

  it("deduplicates supported warnings and clamps confidence for the manual-review gate", () => {
    expect(normaliseStudioImageQuality({ confidence: 106, warningCodes: ["BACKGROUND_NOT_PURE_WHITE", "BACKGROUND_NOT_PURE_WHITE", "UNKNOWN" as never] })).toEqual({ status: "WARNING", confidence: 100, warningCodes: ["BACKGROUND_NOT_PURE_WHITE"] });
  });

  it("requires a warning when the automated visual assessment has low confidence", () => {
    expect(normaliseStudioImageQuality({ confidence: 42, warningCodes: [] })).toEqual({ status: "WARNING", confidence: 42, warningCodes: ["LOW_CONFIDENCE"] });
  });
});
