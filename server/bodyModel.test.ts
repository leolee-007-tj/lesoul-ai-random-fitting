import { describe, expect, it } from "vitest";
import { modelPrompt, profileInput } from "./routers/bodyModel";

describe("AI Body Model prompt", () => {
  it("uses measurements for a non-identifying full-body fitting model", () => {
    const prompt = modelPrompt({ visitorId: "visitor-1", heightCm: 165, weightKg: 55, bustCm: 84, waistCm: 65, hipCm: 91, genderPresentation: "female", bodyShape: "curvy", hairLength: "long", hairStyle: "natural_wave", hairColor: "dark_brown", skinTone: "light_medium", consent: true });
    expect(prompt).toContain("persistent anonymous adult female fashion model");
    expect(prompt).toContain("height 165 cm, weight 55 kg");
    expect(prompt).toContain("bust 84 cm, waist 65 cm, hip 91 cm");
    expect(prompt).toContain("long natural wave hair in dark brown");
    expect(prompt).toContain("light-medium skin tone");
    expect(prompt).toContain("do not make the body slimmer to suit clothing");
    expect(prompt).toContain("plain soft ivory studio background");
    expect(prompt).toContain("East Asian adult female fashion-editorial baseline");
    expect(prompt).toContain("clearly defined natural waist");
    expect(prompt).toContain("never exaggerated");
  });

  it("does not accept a weight below the 40kg model floor", () => {
    expect(() => profileInput.parse({ visitorId: "visitor-1", heightCm: 160, weightKg: 39, genderPresentation: "female", consent: true })).toThrow();
    expect(profileInput.parse({ visitorId: "visitor-1", heightCm: 160, weightKg: 40, genderPresentation: "female", consent: true }).weightKg).toBe(40);
  });
});
