import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("owner-managed VIP 李瀛 reference models", () => {
  it("stores the three owner-uploaded reference image URLs in central settings rather than customer or product data", () => {
    const schema = source("drizzle/schema.ts");
    const helper = source("server/liyingReferenceModels.ts");
    expect(schema).toContain('liyingReferenceImageUrls: json("liyingReferenceImageUrls")');
    expect(helper).toContain('LIYING_REFERENCE_MODEL_KEYS = ["petite", "balanced", "volume"]');
    expect(helper).toContain("return settings.liyingReferenceImageUrls ?? {}");
  });

  it("allows only the owner to upload reference images and only VIP users to read them for fitting", () => {
    const operations = source("server/routers/operations.ts");
    const bodyModel = source("server/routers/bodyModel.ts");
    expect(operations).toContain("uploadLiyingReferenceImage: ownerOnlyProcedure");
    expect(operations).toContain("decodeImageDataUrl(input.dataUrl, MAX_PRODUCT_IMAGE_BYTES)");
    expect(operations).toContain("lesoul/liying-reference-models/${input.modelKey}");
    expect(bodyModel).toContain('if (!ctx.user || ctx.user.role !== "vip") throw new Error("LIYING_VIP_ONLY")');
  });

  it("shows VIP users all three uploaded choices as preview cards and passes the selected model into the existing studio flow", () => {
    const page = source("client/src/pages/BodyModel.tsx");
    expect(page).toContain("trpc.bodyModel.liyingReferenceModels.useQuery");
    expect(page).toContain("const imageUrl = uploadedImageUrl || model.imageUrl");
    expect(page).toContain("const uploadedImageUrl = liyingReferences.data?.imageUrls?.[model.key]");
    expect(page).toContain("stateLabel = liyingReferences.isLoading");
    expect(page).toContain('aria-pressed={active}');
    expect(page).toContain('aspect-[3/4]');
    expect(page).toContain("navigate(`/studio?fixedModel=${selected}`)");
  });

  it("uses the selected current owner-uploaded image as the VIP 李瀛 fitting reference without changing admin fixed-model behavior", () => {
    const look = source("server/routers/look.ts");
    expect(look).toContain('const isLiying = !isQuickFit && ctx.user?.role === "vip" && Boolean(input.fixedModelKey)');
    expect(look).toContain("await getLiyingReferenceImageUrls()");
    expect(look).toContain("resolveLiyingReferenceImageUrl(fixed.key, uploadedLiyingImages)");
    expect(look).toContain("modelKey: isLiying ? `liying-${fixed.key}` : `fixed-${fixed.key}`");
  });
});
