import { describe, expect, it } from "vitest";
import { modelPrompt } from "./routers/bodyModel";

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
  });
});
