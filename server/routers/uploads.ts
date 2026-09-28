import { randomUUID } from "node:crypto";
import { z } from "zod";
import { storagePut } from "../storage";
import { ownerOnlyProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

const acceptedImage = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const acceptedCareLabelImage = /^data:(image\/(?:svg\+xml|jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const acceptedPresenceAudio = /^data:(audio\/(?:mpeg|mp3|webm|mp4|ogg|wav|x-wav));base64,([A-Za-z0-9+/=]+)$/;
export const MAX_PRODUCT_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_PRESENCE_AUDIO_BYTES = 12 * 1024 * 1024;

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
      const { url } = await storagePut(`lesoul/catalog/products/${category}/${key}/${view}_${variant}_${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
  careLabelAsset: ownerOnlyProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(15_000_000), kind: z.enum(["product", "symbol", "wechat"]) }))
    .mutation(async ({ input }) => {
      const { buffer, mimeType, extension } = decodeCareLabelImageDataUrl(input.dataUrl);
      const { url } = await storagePut(`lesoul/care-labels/${input.kind}/${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
});
