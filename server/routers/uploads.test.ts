import { describe, expect, it } from "vitest";
import { decodeImageDataUrl } from "./uploads";

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
});
