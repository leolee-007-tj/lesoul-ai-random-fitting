import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { trialStoreProducts, trialStores } from "../../drizzle/schema";
import { getDb } from "../db";
import { decodeImageDataUrl, MAX_PRODUCT_IMAGE_BYTES } from "./uploads";
import { storagePut } from "../storage";
import { getTrialStoreStatus, requireActiveTrialStore } from "../trialStore";
import { router, trialStoreProcedure, trialStoreSessionProcedure } from "../_core/trpc";

const category = z.enum(["top", "bottom", "outer", "dress", "shoes", "bag"]);
const productInput = z.object({ name: z.string().trim().min(1).max(160), brand: z.string().trim().max(120).optional(), category, price: z.number().int().min(0).max(10_000_000), status: z.enum(["IN_STOCK", "SOLD_OUT"]).default("IN_STOCK"), imageUrls: z.array(z.string().min(1)).max(4), description: z.string().trim().max(4000).optional() });

export const trialStoreRouter = router({
  status: trialStoreSessionProcedure.query(({ ctx }) => getTrialStoreStatus(ctx.user.id)),
  workspace: trialStoreProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const store = await requireActiveTrialStore(ctx.user.id);
    const products = await db.select().from(trialStoreProducts).where(eq(trialStoreProducts.storeId, store.id)).orderBy(trialStoreProducts.createdAt);
    return { store, products };
  }),
  updateStore: trialStoreProcedure.input(z.object({ storeName: z.string().trim().min(1).max(80), paymentQrUrl: z.string().min(1).nullable().optional(), purchaseNotice: z.string().trim().max(1200).nullable().optional(), pricingMode: z.enum(["BASE", "SEASON_FORMAT_1", "SEASON_FORMAT_2", "SEASON_FORMAT_3"]).optional(), excludeNewArrivalsFromSale: z.number().int().min(0).max(1).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const store = await requireActiveTrialStore(ctx.user.id);
    await db.update(trialStores).set(input).where(eq(trialStores.id, store.id));
    return getTrialStoreStatus(ctx.user.id);
  }),
  createProduct: trialStoreProcedure.input(productInput).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const store = await requireActiveTrialStore(ctx.user.id);
    await db.insert(trialStoreProducts).values({ ...input, storeId: store.id, brand: input.brand || null, description: input.description || null });
    return { success: true };
  }),
  deleteProduct: trialStoreProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new Error("TRIAL_STORE_SERVICE_UNAVAILABLE");
    const store = await requireActiveTrialStore(ctx.user.id);
    const product = (await db.select({ id: trialStoreProducts.id }).from(trialStoreProducts).where(and(eq(trialStoreProducts.id, input.id), eq(trialStoreProducts.storeId, store.id))).limit(1))[0];
    if (!product) return { success: true };
    await db.delete(trialStoreProducts).where(and(eq(trialStoreProducts.id, input.id), eq(trialStoreProducts.storeId, store.id)));
    return { success: true };
  }),
  uploadImage: trialStoreProcedure.input(z.object({ dataUrl: z.string().min(40).max(12_000_000) })).mutation(async ({ ctx, input }) => {
    const store = await requireActiveTrialStore(ctx.user.id);
    const { buffer, mimeType, extension } = decodeImageDataUrl(input.dataUrl, MAX_PRODUCT_IMAGE_BYTES);
    const { url } = await storagePut(`lesoul/trial-stores/${store.id}/${randomUUID()}.${extension}`, buffer, mimeType);
    return { url };
  }),
});
