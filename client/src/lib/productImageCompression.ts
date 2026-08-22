export const PRODUCT_IMAGE_MAX_EDGE = 2048;
export const PRODUCT_IMAGE_COMPRESSION_THRESHOLD_BYTES = 350 * 1024;
export const PRODUCT_IMAGE_WEBP_QUALITY = 0.84;

export type ProductImageCompressionPlan = {
  width: number;
  height: number;
  needsResize: boolean;
  shouldEncode: boolean;
};

export type CompressedProductImage = {
  file: File;
  originalBytes: number;
  outputBytes: number;
  compressed: boolean;
};

export function productImageCompressionPlan(input: { width: number; height: number; bytes: number; maxEdge?: number }): ProductImageCompressionPlan {
  const maxEdge = input.maxEdge ?? PRODUCT_IMAGE_MAX_EDGE;
  const largestEdge = Math.max(input.width, input.height);
  const scale = largestEdge > maxEdge ? maxEdge / largestEdge : 1;
  const needsResize = scale < 1;
  return {
    width: Math.max(1, Math.round(input.width * scale)),
    height: Math.max(1, Math.round(input.height * scale)),
    needsResize,
    shouldEncode: needsResize || input.bytes > PRODUCT_IMAGE_COMPRESSION_THRESHOLD_BYTES,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("PRODUCT_IMAGE_DECODE_FAILED")); };
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PRODUCT_IMAGE_ENCODE_FAILED")), type, quality));
}

export async function compressProductImage(file: File): Promise<CompressedProductImage> {
  if (!file.type.startsWith("image/")) throw new Error("PRODUCT_IMAGE_TYPE_INVALID");
  const image = await loadImage(file);
  const plan = productImageCompressionPlan({ width: image.naturalWidth, height: image.naturalHeight, bytes: file.size });
  if (!plan.shouldEncode) return { file, originalBytes: file.size, outputBytes: file.size, compressed: false };

  const canvas = document.createElement("canvas");
  canvas.width = plan.width;
  canvas.height = plan.height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("PRODUCT_IMAGE_CANVAS_UNAVAILABLE");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, plan.width, plan.height);
  context.drawImage(image, 0, 0, plan.width, plan.height);

  let blob = await canvasBlob(canvas, "image/webp", PRODUCT_IMAGE_WEBP_QUALITY);
  let mimeType = blob.type === "image/webp" ? "image/webp" : "image/jpeg";
  if (mimeType === "image/jpeg") blob = await canvasBlob(canvas, "image/jpeg", PRODUCT_IMAGE_WEBP_QUALITY);
  if (!plan.needsResize && blob.size >= file.size) return { file, originalBytes: file.size, outputBytes: file.size, compressed: false };

  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  const stem = file.name.replace(/\.[^.]+$/, "") || "product-image";
  const optimized = new File([blob], `${stem}.${extension}`, { type: mimeType, lastModified: Date.now() });
  return { file: optimized, originalBytes: file.size, outputBytes: optimized.size, compressed: true };
}

export function formatImageBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
