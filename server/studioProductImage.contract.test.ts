import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("studio product image generation contract", () => {
  it("limits generation to administrator authority and two supplied source views", () => {
    const admin = source("./routers/admin.ts");
    expect(admin).toContain("generateStudioProductImages: ownerProcedure.input");
    expect(admin).toContain("frontUrl: z.string().trim().min(1)");
    expect(admin).toContain("backUrl: z.string().trim().min(1)");
    expect(admin).toContain("generateImage({ prompt: buildStudioProductImagePrompt(\"front\")");
    expect(admin).toContain("generateImage({ prompt: buildStudioProductImagePrompt(\"back\")");
  });

  it("keeps the manager workflow as generate, review, then accept or discard", () => {
    const manager = source("../client/src/pages/ProductManagerV2.tsx");
    expect(manager).toContain("generateStudioProductImages.useMutation()");
    expect(manager).toContain("acceptStudioPreview");
    expect(manager).toContain("discardStudioPreview");
    expect(manager).toContain("frontStudioUrl");
  });
});
