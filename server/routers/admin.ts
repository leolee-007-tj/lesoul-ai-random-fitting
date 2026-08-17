import { z } from "zod";
import { createAdminProduct, deleteAdminProduct, getAdminStats, getCatalog, updateAdminProduct } from "../db";
import { publicProcedure, router } from "../_core/trpc";

const productInput = z.object({
  name: z.string().min(2).max(160),
  category: z.enum(["top", "bottom", "outer", "dress", "shoes", "bag"]),
  season: z.string().min(1).max(120),
  color: z.string().min(1).max(80),
  style: z.string().min(1).max(200),
  status: z.enum(["in_stock", "sold_out"]),
  price: z.number().int().positive(),
  imageUrl: z.string().min(1),
  images: z.array(z.string().min(1)).max(5).optional(),
  imageViews: z.object({ front: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), back: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), side: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), detail: z.array(z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() })).max(2).optional() }).optional(),
  description: z.string().min(2),
  fabric: z.string().max(160).nullable().optional(),
  texture: z.string().max(120).nullable().optional(),
  fit: z.string().max(120).nullable().optional(),
  length: z.string().max(120).nullable().optional(),
  width: z.string().max(120).nullable().optional(),
  details: z.string().max(2000).nullable().optional(),
  neckline: z.string().max(120).nullable().optional(),
  sleeve: z.string().max(120).nullable().optional(),
  purchaseUrl: z.string().url().nullable().optional(),
  purchasePlatform: z.string().max(120).nullable().optional(),
  stylistMetadata: z.object({ mainColor: z.string().max(80).optional(), secondaryColor: z.string().max(80).optional(), pattern: z.string().max(80).optional(), materialAppearance: z.string().max(120).optional(), silhouette: z.string().max(120).optional(), formality: z.number().int().min(1).max(5).optional(), fashionMood: z.array(z.string().max(64)).max(8).optional(), recommendedStyles: z.array(z.enum(["quiet_luxury", "elegant", "minimal", "chic", "casual", "office", "date", "street", "ai_choice"])).max(9).optional(), compatibleColors: z.array(z.string().max(80)).max(8).optional(), layeringSuitability: z.enum(["base", "layer", "outer", "complete", "accessory"]).optional(), source: z.enum(["manual", "vision"]).optional() }).nullable().optional(),
});

export const adminRouter = router({
  products: publicProcedure.query(async () => (await getCatalog()).products),
  stats: publicProcedure.query(getAdminStats),
  createProduct: publicProcedure.input(productInput).mutation(async ({ input }) => {
    await createAdminProduct({ ...input, images: input.images ?? [input.imageUrl], imageViews: input.imageViews ?? { front: { original: input.imageUrl, studioCut: input.imageUrl, thumbnail: input.imageUrl } }, purchaseUrl: input.purchaseUrl ?? null, purchasePlatform: input.purchasePlatform ?? null });
    return { success: true };
  }),
  updateProduct: publicProcedure.input(productInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const { id, ...updates } = input;
    await updateAdminProduct(id, updates);
    return { success: true };
  }),
  deleteProduct: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await deleteAdminProduct(input.id);
    return { success: true };
  }),
});
