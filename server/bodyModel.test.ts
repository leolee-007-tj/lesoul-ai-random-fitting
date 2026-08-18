import { describe, expect, it } from "vitest";
import { modelPrompt } from "./routers/bodyModel";

describe("AI Body Model prompt", () => {
  it("uses measurements for a non-identifying full-body fitting model", () => {
    const prompt = modelPrompt({ visitorId: "visitor-1", heightCm: 165, weightKg: 55, bustCm: 84, waistCm: 65, hipCm: 91, genderPresentation: "female", bodyShape: "curvy", consent: true });
    expect(prompt).toContain("anonymous full-body fashion fitting model");
    expect(prompt).toContain("must not resemble or infer a real person's identity");
    expect(prompt).toContain("165 cm / 55 kg");
    expect(prompt).toContain("curvy body shape");
    expect(prompt).toContain("plain soft ivory studio background");
  });
});
