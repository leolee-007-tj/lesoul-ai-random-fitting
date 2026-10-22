import { describe, expect, it } from "vitest";
import { validateGeneratedLook, validationNotEnabled } from "../shared/generationValidation";

describe("generation validation boundary", () => {
  it("does not fabricate garment, identity, or overall quality scores before a Vision evaluator is connected", async () => {
    const result = await validateGeneratedLook({ resultImageUrl: "https://example.com/result.jpg", userImageUrl: "https://example.com/customer.jpg", productIds: [1, 2], poseId: 1, backgroundId: 1 });
    expect(result).toEqual(validationNotEnabled());
    expect(result.status).toBe("not_enabled");
    expect(result.garmentPreservationScore).toBeNull();
    expect(result.identityPreservationScore).toBeNull();
    expect(result.overallQualityScore).toBeNull();
  });
});
