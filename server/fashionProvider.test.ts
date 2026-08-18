import { describe, expect, it } from "vitest";
import { buildClothingPreservationPrompt, buildQuickFitPreservationPrompt, CLOTHING_NEGATIVE_PROMPT, IMAGE_PROVIDER_TIMEOUT_MS, MockFashionProvider } from "./fashionProvider";
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
    expect(prompt).toContain("Bottom/denim lock");
    expect(prompt).toContain("POSE LOCK — non-negotiable");
    expect(prompt).toContain("BACKGROUND LOCK — non-negotiable");
    expect(prompt).toContain("pants-main.jpg");
    expect(prompt).toContain(CLOTHING_NEGATIVE_PROMPT);
  });

  it("includes body measurements and ordered product-view evidence", () => {
    const prompt = buildClothingPreservationPrompt({
      userImage: "photo.jpg",
      pose: { id: 1, name: "Natural Standing", promptKeyword: "standing" },
      clothing: [{ id: 1, name: "Precision Blazer", category: "outer", imageUrl: "fallback.jpg", imageViews: { front: { original: "front-original.jpg", studioCut: "front-studio.jpg", thumbnail: "front-thumb.jpg" }, back: { original: "back-original.jpg", studioCut: "back-studio.jpg", thumbnail: "back-thumb.jpg" }, detail: [{ original: "detail-cuff.jpg", studioCut: "detail-cuff.jpg", thumbnail: "detail-cuff.jpg" }, { original: "detail-button.jpg", studioCut: "detail-button.jpg", thumbnail: "detail-button.jpg" }] }, description: "Blazer", color: "Black", fabric: "Wool", texture: "Structured", fit: "Regular", length: "Long", width: "Straight", details: "Buttons", neckline: "Collared", sleeve: "Long" }],
      background: { id: 1, name: "Studio", promptKeyword: "studio" }, style: "CHIC",
      bodyMeasurements: { ...defaultBodyMeasurements, height: 170, shoulderWidth: 44, chest: 94 },
    });
    expect(prompt).toContain("Height 170cm");
    expect(prompt).toContain("Shoulder width 44cm");
    expect(prompt).toContain("Front construction reference: front-original.jpg");
    expect(prompt).toContain("Back construction reference: back-original.jpg");
    expect(prompt).toContain("Important detail reference 1: detail-cuff.jpg");
    expect(prompt).toContain("Important detail reference 2: detail-button.jpg");
  });

  it("locks the approved base model identity and respects a Fit Engine warning", () => {
    const prompt = buildClothingPreservationPrompt({
      userImage: "temporary-user-image.jpg", modelReference: { imageUrl: "model-v1.jpg", modelKey: "MODEL-001", version: 1, appearance: { hairLength: "long", hairStyle: "straight", hairColor: "dark brown", skinTone: "light-medium" } },
      pose: { id: 1, name: "Walking", promptKeyword: "walking" }, clothing: [{ id: 1, name: "Small Jacket", category: "outer", imageUrl: "jacket.jpg", description: "Small jacket", garmentMeasurements: { bustCm: 92 }, stretchLevel: "none" }],
      background: { id: 1, name: "Studio", promptKeyword: "studio" }, style: "MINIMAL", bodyMeasurements: { ...defaultBodyMeasurements, chest: 104 },
    });
    expect(prompt).toContain("MODEL-001 v1");
    expect(prompt).toContain("same generated woman");
    expect(prompt).toContain("Do not shrink or reshape the body");
  });
});

describe("QUICK FIT product editorial prompt", () => {
  it("uses product references only and explicitly forbids people or redesigned garments", () => {
    const prompt = buildQuickFitPreservationPrompt({ generationMode: "QUICK_FIT", displayStyle: "studio_flat_lay", userImage: "quick-fit://products/1-2", pose: { id: 0, name: "Product-only arrangement", promptKeyword: "no person" }, background: { id: 0, name: "studio_flat_lay", promptKeyword: "studio flat lay" }, style: "QUIET LUXURY", clothing: [{ id: 1, name: "Ivory Knit", category: "top", imageUrl: "top.jpg", description: "Ivory knit top", color: "Ivory", details: "Rib knit" }, { id: 2, name: "Black Trousers", category: "bottom", imageUrl: "bottom.jpg", description: "Black trousers", color: "Black", details: "Straight hem" }] });
    expect(prompt).toContain("NO PERSON");
    expect(prompt).toContain("NO FACE");
    expect(prompt).toContain("NO HANDS");
    expect(prompt).toContain("NO BODY");
    expect(prompt).toContain("studio_flat_lay");
    expect(prompt).toContain("Ivory Knit");
    expect(prompt).toContain(CLOTHING_NEGATIVE_PROMPT);
  });
});

describe("image provider safeguards", () => {
  it("bounds a stalled provider request so the customer flow can use an explicit fallback", () => {
    expect(IMAGE_PROVIDER_TIMEOUT_MS).toBeGreaterThanOrEqual(30_000);
    expect(IMAGE_PROVIDER_TIMEOUT_MS).toBeLessThanOrEqual(60_000);
  });
});
