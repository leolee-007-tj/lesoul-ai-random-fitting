import { describe, expect, it } from "vitest";
import { decodeImageDataUrl, MAX_PRODUCT_IMAGE_BYTES } from "./uploads";

describe("product image validation", () => {
  it("decodes permitted image data and normalizes JPEG extension", () => {
    const result = decodeImageDataUrl("data:image/jpeg;base64,aGVsbG8=", 1024);
    expect(result.mimeType).toBe("image/jpeg");
    expect(result.extension).toBe("jpg");
    expect(result.buffer.toString()).toBe("hello");
  });

  it("rejects non-image data and oversized data", () => {
    expect(() => decodeImageDataUrl("data:text/plain;base64,aGVsbG8=", 1024)).toThrow("Only JPG");
    expect(() => decodeImageDataUrl("data:image/png;base64,aGVsbG8=", 1)).toThrow("allowed size limit");
  });

  it("allows original product images up to 20MB without changing their bytes", () => {
    expect(MAX_PRODUCT_IMAGE_BYTES).toBe(20 * 1024 * 1024);
    const source = Buffer.from([0, 1, 2, 3, 255]);
    const result = decodeImageDataUrl(`data:image/png;base64,${source.toString("base64")}`, MAX_PRODUCT_IMAGE_BYTES);
    expect(Buffer.compare(result.buffer, source)).toBe(0);
  });
});
