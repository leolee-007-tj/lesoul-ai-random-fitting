import { randomUUID } from "node:crypto";
import { z } from "zod";
import { storageGetSignedUrl, storagePut } from "../storage";
import { generateImage } from "../_core/imageGeneration";
import { ownerOnlyProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

const acceptedImage = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const acceptedCareLabelImage = /^data:(image\/(?:svg\+xml|jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const acceptedPresenceAudio = /^data:(audio\/(?:mpeg|mp3|webm|mp4|ogg|wav|x-wav));base64,([A-Za-z0-9+/=]+)$/;
export const MAX_PRODUCT_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_PRESENCE_AUDIO_BYTES = 12 * 1024 * 1024;

export type ProductImageEnhancementView = "front" | "back" | "detail";

export function buildProductImageEnhancementPrompt(category: "top" | "bottom" | "outer" | "dress" | "shoes" | "bag", view: ProductImageEnhancementView) {
  const garmentRule = category === "top"
    ? "For a top, preserve the exact sleeve length, shoulder width, body length, thickness, neckline, cuffs, seams, and silhouette."
    : category === "bottom"
      ? "For bottoms, preserve the exact rise, waist shape, leg width, inseam, hem, pleats, pockets, and silhouette; never turn trousers into a skirt or vice versa."
      : "Preserve the exact category, proportions, construction, hardware, seams, and silhouette of the supplied item.";
  const displayRule = ["top", "bottom", "outer", "dress"].includes(category)
    ? "Show a natural simple clothing hanger."
    : "Show the item alone in a clean product-cut arrangement without a clothing hanger.";
  if (view === "detail") {
    return `Edit the supplied product detail photograph as a faithful photographic enhancement only. Preserve the exact garment, crop, composition, texture, weave, stitching, color, shadows, and every visible design detail from the source. Improve faithful color rendering and material clarity under neutral light. Do not redesign, recolor, reshape, lengthen, shorten, add, remove, translate, or invent any part. Do not add a price tag, text, logo, model, hanger, mannequin, jewelry, or extra garment. The result must remain the same detail photograph, only cleaner and more color-accurate. ${garmentRule}`;
  }
  return `Create a clean ecommerce product cut from the supplied ${view} photograph on a seamless pure white background. Keep the exact supplied garment identity, color, material texture, weave, stitching, seams, pockets, hardware, pattern, and proportions. Show the entire item centered with comfortable margins, ${displayRule} Do not include a model, body, mannequin, price tag, label text, watermark, props, or extra garments. Match the source ${view} orientation exactly; do not mirror it. Use realistic studio lighting that reveals the material without changing its color. ${garmentRule} Do not invent unseen details or replace the item with a similar one.`;
}

export function decodeImageDataUrl(dataUrl: string, maxBytes: number) {
  const match = dataUrl.match(acceptedImage);
  if (!match) throw new Error("Only JPG, PNG, and WEBP images can be uploaded.");
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > maxBytes) throw new Error("Image exceeds the allowed size limit.");
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  return { buffer, mimeType, extension };
}

/** Accepts an owner MP3 upload and browser-produced audio recording formats only. */
export function decodeCareLabelImageDataUrl(dataUrl: string, maxBytes = 10 * 1024 * 1024) {
  const match = dataUrl.match(acceptedCareLabelImage);
  if (!match) throw new Error("Only SVG, JPG, PNG, and WEBP care-label images are supported.");
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > maxBytes) throw new Error("Care-label image exceeds the allowed size limit.");
  if (mimeType === "image/svg+xml") {
    const source = buffer.toString("utf8");
    if (/<script|on[a-z]+\s*=|javascript:/i.test(source)) throw new Error("Unsafe SVG content was rejected.");
  }
  const extension = mimeType === "image/svg+xml" ? "svg" : mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  return { buffer, mimeType, extension } as const;
}

/** Accepts an owner MP3 upload and browser-produced audio recording formats only. */
export function decodePresenceAudioDataUrl(dataUrl: string, maxBytes = MAX_PRESENCE_AUDIO_BYTES) {
  const match = dataUrl.match(acceptedPresenceAudio);
  if (!match) throw new Error("Only MP3 uploads and browser-recorded audio can be uploaded.");
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > maxBytes) throw new Error("Audio exceeds the allowed size limit.");
  const extension = mimeType === "audio/mpeg" || mimeType === "audio/mp3" ? "mp3" : mimeType === "audio/x-wav" ? "wav" : mimeType.split("/")[1];
  return { buffer, mimeType, extension } as const;
}

export const uploadRouter = router({
  photo: protectedProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(30_000_000) }))
    .mutation(async ({ ctx, input }) => {
      const { buffer, mimeType, extension } = decodeImageDataUrl(input.dataUrl, MAX_PRODUCT_IMAGE_BYTES);
      const { url } = await storagePut(`lesoul/${ctx.user.id}/uploads/${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
  presenceAudio: ownerOnlyProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(18_000_000) }))
    .mutation(async ({ input }) => {
      const { buffer, mimeType, extension } = decodePresenceAudioDataUrl(input.dataUrl);
      const { url } = await storagePut(`lesoul/presence-alert/${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
  productImage: publicProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(30_000_000), category: z.enum(["top", "bottom", "outer", "dress", "shoes", "bag"]).optional(), view: z.enum(["front", "back", "side", "detail"]).optional(), variant: z.enum(["original", "studio", "thumbnail"]).optional(), productKey: z.string().max(80).optional() }))
    .mutation(async ({ input }) => {
      const { buffer, mimeType, extension } = decodeImageDataUrl(input.dataUrl, MAX_PRODUCT_IMAGE_BYTES);
      const key = input.productKey?.replace(/[^a-zA-Z0-9_-]/g, "") || randomUUID();
      const category = input.category ?? "top"; const view = input.view ?? "detail"; const variant = input.variant ?? "studio";
      const stored = await storagePut(`lesoul/catalog/products/${category}/${key}/${view}_${variant}_${randomUUID()}.${extension}`, buffer, mimeType);
      return { ...stored, mimeType };
    }),
  enhanceProductImage: ownerOnlyProcedure
    .input(z.object({ sourceKey: z.string().trim().min(1).max(300), category: z.enum(["top", "bottom", "outer", "dress", "shoes", "bag"]), view: z.enum(["front", "back", "detail"]), productKey: z.string().trim().min(1).max(80) }))
    .mutation(async ({ input }) => {
      const sourceUrl = await storageGetSignedUrl(input.sourceKey);
      const result = await generateImage({
        prompt: buildProductImageEnhancementPrompt(input.category, input.view),
        originalImages: [{ url: sourceUrl, mimeType: "image/jpeg" }],
        quality: "high",
        storageKey: `lesoul/catalog/products/${input.category}/${input.productKey}/${input.view}_studio_ai.png`,
      });
      if (!result.url || !result.key) throw new Error("AI product image enhancement returned no image.");
      return result;
    }),
  careLabelAsset: ownerOnlyProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(15_000_000), kind: z.enum(["product", "symbol", "wechat"]) }))
    .mutation(async ({ input }) => {
      const { buffer, mimeType, extension } = decodeCareLabelImageDataUrl(input.dataUrl);
      const { url } = await storagePut(`lesoul/care-labels/${input.kind}/${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
});
