import { describe, expect, it } from "vitest";
import { MockFashionProvider } from "./fashionProvider";

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
