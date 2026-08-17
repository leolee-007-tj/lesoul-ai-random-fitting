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
  description: z.string().min(2),
  purchaseUrl: z.string().url().nullable().optional(),
});

export const adminRouter = router({
  products: publicProcedure.query(async () => (await getCatalog()).products),
  stats: publicProcedure.query(getAdminStats),
  createProduct: publicProcedure.input(productInput).mutation(async ({ input }) => {
    await createAdminProduct({ ...input, purchaseUrl: input.purchaseUrl ?? null });
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
