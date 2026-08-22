import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manager = readFileSync(new URL("./ProductManagerV2.tsx", import.meta.url), "utf8");

describe("ProductManager image compression integration", () => {
  it("compresses the common slot-upload path before the image data is uploaded", () => {
    expect(manager).toContain('import { compressProductImage, formatImageBytes } from "@/lib/productImageCompression"');
    expect(manager).toContain("const optimized = await compressProductImage(file)");
    expect(manager).toContain("reader.readAsDataURL(optimized.file)");
  });

  it("keeps the shared uploader for both four slots and the bulk assignment tray", () => {
    expect(manager).toContain('onChange={(event) => uploadSlot("front", event)}');
    expect(manager).toContain('onChange={(event) => uploadSlot("back", event)}');
    expect(manager).toContain('onChange={(event) => uploadSlot("detail1", event)}');
    expect(manager).toContain('onChange={(event) => uploadSlot("detail2", event)}');
    expect(manager).toContain("onAssign={uploadFileToSlot}");
  });
});
