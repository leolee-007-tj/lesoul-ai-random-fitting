import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("studio product image generation contract", () => {
  it("limits generation to administrator authority and supports one or both supplied source views", () => {
    const admin = source("./routers/admin.ts");
    expect(admin).toContain("generateStudioProductImages: ownerProcedure.input");
    expect(admin).toContain("views: z.array(z.enum([\"front\", \"back\"]))");
    expect(admin).toContain("colorCorrectionStrength: z.enum([\"off\", \"subtle\", \"standard\", \"strong\"]).default(\"standard\")");
    expect(admin).toContain("MISSING_${view.toUpperCase()}_SOURCE");
    expect(admin).toContain("buildStudioProductImagePrompt(view, input.colorCorrectionStrength)");
    expect(admin).toContain("embeddedImageReference(sourceUrl)");
    expect(admin).toContain("STUDIO_SOURCE_IMAGE_UNAVAILABLE");
  });

  it("keeps the manager workflow as generate, compare, review, then accept or discard", () => {
    const manager = source("../client/src/pages/ProductManagerV2.tsx");
    expect(manager).toContain("generateStudioProductImages.useMutation()");
    expect(manager).toContain("acceptStudioPreview");
    expect(manager).toContain("discardStudioPreview");
    expect(manager).toContain("StudioImageReview");
    expect(manager).toContain("generateStudioPreview([view])");
    expect(manager).toContain("colorCorrectionStrength");
    expect(manager).toContain("frontStudioUrl");
  });
});
