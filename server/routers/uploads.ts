import { randomUUID } from "node:crypto";
import { z } from "zod";
import { storagePut } from "../storage";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const acceptedImage = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
export const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;

export function decodeImageDataUrl(dataUrl: string, maxBytes: number) {
  const match = dataUrl.match(acceptedImage);
  if (!match) throw new Error("Only JPG, PNG, and WEBP images can be uploaded.");
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > maxBytes) throw new Error("Image exceeds the allowed size limit.");
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  return { buffer, mimeType, extension };
}

export const uploadRouter = router({
  photo: protectedProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(10_000_000) }))
    .mutation(async ({ ctx, input }) => {
      const { buffer, mimeType, extension } = decodeImageDataUrl(input.dataUrl, 6 * 1024 * 1024);
      const { url } = await storagePut(`lesoul/${ctx.user.id}/uploads/${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
  productImage: publicProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(12_000_000) }))
    .mutation(async ({ input }) => {
      const { buffer, mimeType, extension } = decodeImageDataUrl(input.dataUrl, MAX_PRODUCT_IMAGE_BYTES);
      const { url } = await storagePut(`lesoul/catalog/products/${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
});
