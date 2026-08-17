export type FashionLookRequest = {
  userImage: string;
  pose: { id: number; name: string; promptKeyword: string };
  clothing: Array<{ id: number; name: string; category: string; imageUrl: string; description: string }>;
  background: { id: number; name: string; promptKeyword: string };
  style: "RANDOM" | "DAILY" | "ELEGANT" | "CHIC" | "CASUAL" | "MINIMAL";
};

export type FashionLookResponse = {
  generatedImage: string;
  generationStatus: "completed" | "processing" | "failed";
  provider: "mock" | "external";
  metadata: { pose: string; background: string; style: string; clothingCount: number; generatedAt: string };
};

export interface FashionProvider {
  generateFashionLook(request: FashionLookRequest): Promise<FashionLookResponse>;
}

/**
 * UI-safe provider used for this personal MVP. It preserves the uploaded image
 * while returning the same contract an external virtual try-on provider will use.
 */
export class MockFashionProvider implements FashionProvider {
  async generateFashionLook(request: FashionLookRequest): Promise<FashionLookResponse> {
    return {
      generatedImage: request.userImage,
      generationStatus: "completed",
      provider: "mock",
      metadata: {
        pose: request.pose.name,
        background: request.background.name,
        style: request.style,
        clothingCount: request.clothing.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

let provider: FashionProvider = new MockFashionProvider();

export function setFashionProvider(nextProvider: FashionProvider) {
  provider = nextProvider;
}

export function generateFashionLook(request: FashionLookRequest) {
  return provider.generateFashionLook(request);
}
