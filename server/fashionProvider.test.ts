import { describe, expect, it } from "vitest";
import { buildClothingPreservationPrompt, CLOTHING_NEGATIVE_PROMPT, MockFashionProvider } from "./fashionProvider";
import { defaultBodyMeasurements } from "../shared/bodyMeasurements";

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

  it("includes body measurements and ordered product-view evidence", () => {
    const prompt = buildClothingPreservationPrompt({
      userImage: "photo.jpg",
      pose: { id: 1, name: "Natural Standing", promptKeyword: "standing" },
      clothing: [{ id: 1, name: "Precision Blazer", category: "outer", imageUrl: "fallback.jpg", imageViews: { front: { original: "front-original.jpg", studioCut: "front-studio.jpg", thumbnail: "front-thumb.jpg" }, back: { original: "back-original.jpg", studioCut: "back-studio.jpg", thumbnail: "back-thumb.jpg" } }, description: "Blazer", color: "Black", fabric: "Wool", texture: "Structured", fit: "Regular", length: "Long", width: "Straight", details: "Buttons", neckline: "Collared", sleeve: "Long" }],
      background: { id: 1, name: "Studio", promptKeyword: "studio" }, style: "CHIC",
      bodyMeasurements: { ...defaultBodyMeasurements, height: 170, shoulderWidth: 44, chest: 94 },
    });
    expect(prompt).toContain("Height 170cm");
    expect(prompt).toContain("Shoulder width 44cm");
    expect(prompt).toContain("Primary front reference: front-studio.jpg");
    expect(prompt).not.toContain("Back view: back-studio.jpg");
  });
});
