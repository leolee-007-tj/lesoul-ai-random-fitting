import { describe, expect, it } from "vitest";
import { buildClothingPreservationPrompt, CLOTHING_NEGATIVE_PROMPT, MockFashionProvider } from "./fashionProvider";

describe("MockFashionProvider", () => {
  it("returns a completed provider-neutral fashion-look response without changing the client image", async () => {
    const provider = new MockFashionProvider();
    const response = await provider.generateFashionLook({
      userImage: "data:image/jpeg;base64,mock",
      pose: { id: 1, name: "Natural Standing", promptKeyword: "standing naturally" },
      clothing: [{ id: 2, name: "Silk Shirt", category: "top", imageUrl: "shirt.jpg", description: "Ivory silk shirt" }],
      background: { id: 3, name: "Cafe", promptKeyword: "quiet cafe" },
      style: "MINIMAL",
    });

    expect(response).toMatchObject({
      generatedImage: "data:image/jpeg;base64,mock",
      generationStatus: "completed",
      provider: "mock",
      metadata: { pose: "Natural Standing", background: "Cafe", style: "MINIMAL", clothingCount: 1 },
    });
  });
});

describe("clothing preservation prompt", () => {
  it("includes the precise garment construction and strict non-distortion instruction", () => {
    const prompt = buildClothingPreservationPrompt({
      userImage: "photo.jpg",
      pose: { id: 1, name: "Natural Standing", promptKeyword: "standing naturally" },
      clothing: [{ id: 12, name: "Wide Denim Pants", category: "bottom", imageUrl: "pants-main.jpg", images: ["pants-main.jpg", "pants-detail.jpg"], description: "Wide denim pants", color: "Blue", fabric: "Denim", texture: "Textured", fit: "Relaxed", length: "Full", width: "Wide", details: "Wide leg, raw hem, high waist", neckline: null, sleeve: null }],
      background: { id: 2, name: "Fashion Studio", promptKeyword: "warm white studio" },
      style: "MINIMAL",
    });
    expect(prompt).toContain("Denim fabric");
    expect(prompt).toContain("Full length");
    expect(prompt).toContain("Wide width silhouette");
    expect(prompt).toContain("Wide leg, raw hem, high waist");
    expect(prompt).toContain("pants-main.jpg");
    expect(prompt).toContain(CLOTHING_NEGATIVE_PROMPT);
  });
});
