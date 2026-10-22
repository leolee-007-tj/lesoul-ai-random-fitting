import { describe, expect, it } from "vitest";
import { modelPrompt, profileInput } from "./routers/bodyModel";

describe("retired personal image model contract", () => {
  it("retains input validation but never produces an image-generation prompt", () => {
    const prompt = modelPrompt({ visitorId: "visitor-1", heightCm: 165, weightKg: 55, bustCm: 84, waistCm: 65, hipCm: 91, genderPresentation: "female", bodyShape: "curvy", hairLength: "long", hairStyle: "natural_wave", hairColor: "dark_brown", skinTone: "light_medium", consent: true });
    expect(prompt).toContain("retired");
    expect(prompt).toContain("height 165 cm");
    expect(prompt).toContain("weight 55 kg");
    expect(prompt).toContain("not sent to an image-generation service");
  });

  it("does not accept a weight below the 40kg model floor", () => {
    expect(() => profileInput.parse({ visitorId: "visitor-1", heightCm: 160, weightKg: 39, genderPresentation: "female", consent: true })).toThrow();
    expect(profileInput.parse({ visitorId: "visitor-1", heightCm: 160, weightKg: 40, genderPresentation: "female", consent: true }).weightKg).toBe(40);
  });
});
