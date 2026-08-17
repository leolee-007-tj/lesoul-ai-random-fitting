import { randomUUID } from "node:crypto";
import { z } from "zod";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

const acceptedImage = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export const uploadRouter = router({
  photo: protectedProcedure
    .input(z.object({ dataUrl: z.string().min(40).max(10_000_000) }))
    .mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(acceptedImage);
      if (!match) throw new Error("JPG, PNG 또는 WEBP 사진만 업로드할 수 있습니다.");
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.byteLength > 6 * 1024 * 1024) throw new Error("사진 크기는 6MB 이하로 업로드해 주세요.");
      const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
      const { url } = await storagePut(`lesoul/${ctx.user.id}/uploads/${randomUUID()}.${extension}`, buffer, mimeType);
      return { url };
    }),
});
