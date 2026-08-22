import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("pure-white AI processing removal", () => {
  it("removes the generation route and every administrator UI entry point", () => {
    const admin = source("./routers/admin.ts");
    const manager = source("../client/src/pages/ProductManagerV2.tsx");
    const release = source("../client/src/pages/ReleaseControl.tsx");

    expect(admin).not.toContain("generateStudioProductImages");
    expect(manager).not.toContain("generateStudioProductImages");
    expect(manager).not.toContain("StudioImageReview");
    expect(release).not.toContain("studioImageProcessingEnabled");
  });

  it("preserves normal four-slot product image upload and existing saved image views", () => {
    const manager = source("../client/src/pages/ProductManagerV2.tsx");
    expect(manager).toContain("trpc.uploads.productImage.useMutation()");
    expect(manager).toContain("BulkProductImageTray");
    expect(manager).toContain("imageViews: ProductImageViews");
  });
});
