import { z } from "zod";
import { createAdminProduct, deleteAdminProduct, deleteAdminProducts, deleteAllAdminProducts, getAdminStats, getCatalog, getDb, updateAdminProduct } from "../db";
import { invokeLLM } from "../_core/llm";
import { ownerProcedure, protectedProcedure, router } from "../_core/trpc";
import { redeemCodes, releaseSettings } from "../../drizzle/schema";
import { getReleaseSettings } from "../access";
import { createHash, randomBytes } from "node:crypto";
import { legacyStatusForAvailability, normaliseAvailabilityStatus } from "../../shared/productAvailability";

const productInput = z.object({
  name: z.string().min(1).max(160),
  nameEn: z.string().max(160).nullable().optional(),
  nameKo: z.string().max(160).nullable().optional(),
  nameZh: z.string().max(160).nullable().optional(),
  brand: z.string().max(120).nullable().optional(),
  category: z.enum(["top", "bottom", "outer", "dress", "shoes", "bag"]),
  season: z.string().min(1).max(120),
  color: z.string().min(1).max(80),
  style: z.string().min(1).max(200),
  status: z.enum(["in_stock", "sold_out"]),
  isActive: z.number().int().min(0).max(1).optional(),
  availabilityStatus: z.enum(["AVAILABLE", "SOLD_OUT", "PREORDER"]).optional(),
  isNew: z.number().int().min(0).max(1).optional(),
  newArrivalAt: z.date().nullable().optional(),
  price: z.number().int().min(0),
  imageUrl: z.string().min(1),
  images: z.array(z.string().min(1)).max(6).optional(),
  imageViews: z.object({ front: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), back: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), side: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), detail: z.array(z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() })).max(4).optional() }).optional(),
  description: z.string().min(1),
  descriptionEn: z.string().max(4000).nullable().optional(),
  descriptionKo: z.string().max(4000).nullable().optional(),
  descriptionZh: z.string().max(4000).nullable().optional(),
  discountSeasonEnabled: z.number().int().min(0).max(1).optional(),
  discountOnePercent: z.number().int().min(0).max(100).optional(),
  discountTwoPercent: z.number().int().min(0).max(100).optional(),
  discountThreePercent: z.number().int().min(0).max(100).optional(),
  discountFourPlusPercent: z.number().int().min(0).max(100).optional(),
  momentCouponEnabled: z.number().int().min(0).max(1).optional(),
  momentCouponCode: z.string().max(64).nullable().optional(),
  momentCouponPercent: z.number().int().min(0).max(100).optional(),
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
  purchaseQrUrl: z.string().min(1).nullable().optional(),
  isFeatured: z.number().int().min(0).max(1).optional(),
  featuredPriority: z.number().int().min(0).max(9999).optional(),
  catalogTier: z.enum(["beta", "basic", "full"]).optional(),
  garmentMeasurements: z.object({ shoulderCm: z.number().min(0).max(300).nullable().optional(), bustCm: z.number().min(0).max(300).nullable().optional(), waistCm: z.number().min(0).max(300).nullable().optional(), hipCm: z.number().min(0).max(300).nullable().optional(), sleeveCm: z.number().min(0).max(200).nullable().optional(), totalLengthCm: z.number().min(0).max(300).nullable().optional(), riseCm: z.number().min(0).max(100).nullable().optional(), thighCm: z.number().min(0).max(200).nullable().optional(), inseamCm: z.number().min(0).max(200).nullable().optional() }).nullable().optional(),
  sizeOptions: z.array(z.object({ label: z.string().min(1).max(32), available: z.boolean().optional(), shoulderCm: z.number().min(0).max(300).nullable().optional(), bustCm: z.number().min(0).max(300).nullable().optional(), waistCm: z.number().min(0).max(300).nullable().optional(), hipCm: z.number().min(0).max(300).nullable().optional(), sleeveCm: z.number().min(0).max(200).nullable().optional(), totalLengthCm: z.number().min(0).max(300).nullable().optional(), riseCm: z.number().min(0).max(100).nullable().optional(), thighCm: z.number().min(0).max(200).nullable().optional(), inseamCm: z.number().min(0).max(200).nullable().optional() })).max(8).nullable().optional(),
  stretchLevel: z.enum(["none", "low", "medium", "high"]).optional(),
  stylistMetadata: z.object({ mainColor: z.string().max(80).optional(), secondaryColor: z.string().max(80).optional(), pattern: z.string().max(80).optional(), materialAppearance: z.string().max(120).optional(), silhouette: z.string().max(120).optional(), formality: z.number().int().min(1).max(5).optional(), fashionMood: z.array(z.string().max(64)).max(8).optional(), recommendedStyles: z.array(z.enum(["quiet_luxury", "elegant", "minimal", "chic", "casual", "office", "date", "street", "ai_choice"])).max(9).optional(), compatibleColors: z.array(z.string().max(80)).max(8).optional(), layeringSuitability: z.enum(["base", "layer", "outer", "complete", "accessory"]).optional(), source: z.enum(["manual", "vision"]).optional() }).nullable().optional(),
});

export const adminRouter = router({
  products: protectedProcedure.query(async () => (await getCatalog()).products),
  stats: ownerProcedure.query(getAdminStats),
  releaseConfig: ownerProcedure.query(getReleaseSettings),
  updateReleaseConfig: ownerProcedure.input(z.object({ releaseMode: z.enum(["PRIVATE", "BETA_PUBLIC", "REDEEM_CODE"]), betaCatalogLimit: z.number().int().min(4).max(100), betaDailyVisitorLimit: z.number().int().min(0).max(100), betaFreeGenerationAllowance: z.number().int().min(1).max(100).optional(), globalDailyGenerationLimit: z.number().int().min(0).max(1000000), monthlyGenerationLimit: z.number().int().min(0).max(1000000), generationEnabled: z.number().int().min(0).max(1), purchaseMode: z.enum(["PURCHASE_LIST", "QR", "DISABLED"]).optional(), purchaseListMaxItems: z.number().int().min(1).max(20).optional(), purchaseQrEnabled: z.number().int().min(0).max(1).optional(), purchaseNoticeEn: z.string().max(1200).nullable().optional(), purchaseNoticeKo: z.string().max(1200).nullable().optional(), purchaseNoticeZh: z.string().max(1200).nullable().optional(), stylistIncludePreorder: z.number().int().min(0).max(1).optional() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("Release settings are temporarily unavailable.");
    const current = await getReleaseSettings();
    const update = { ...input, betaFreeGenerationAllowance: input.betaFreeGenerationAllowance ?? current.betaFreeGenerationAllowance, purchaseMode: input.purchaseMode ?? current.purchaseMode, purchaseListMaxItems: input.purchaseListMaxItems ?? current.purchaseListMaxItems, purchaseQrEnabled: input.purchaseQrEnabled ?? current.purchaseQrEnabled, purchaseNoticeEn: input.purchaseNoticeEn ?? current.purchaseNoticeEn, purchaseNoticeKo: input.purchaseNoticeKo ?? current.purchaseNoticeKo, purchaseNoticeZh: input.purchaseNoticeZh ?? current.purchaseNoticeZh, stylistIncludePreorder: input.stylistIncludePreorder ?? current.stylistIncludePreorder };
    await db.insert(releaseSettings).values({ id: 1, ...update }).onDuplicateKeyUpdate({ set: update });
    return getReleaseSettings();
  }),
  createRedeemCode: ownerProcedure.input(z.object({ code: z.string().min(4).max(64).optional(), generationAllowance: z.number().int().min(1).max(1000), isUnlimited: z.boolean().optional(), catalogTier: z.enum(["basic", "full"]), maxUses: z.number().int().min(1).max(100000), expiresAt: z.date().nullable().optional(), campaign: z.string().max(120).nullable().optional(), note: z.string().max(4000).nullable().optional() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("Redeem service is temporarily unavailable.");
    const code = (input.code?.trim().toUpperCase() || `LESOUL-${randomBytes(4).toString("hex").toUpperCase()}`);
    const codeHash = createHash("sha256").update(code).digest("hex");
    await db.insert(redeemCodes).values({ codeHash, generationAllowance: input.generationAllowance, isUnlimited: input.isUnlimited ? 1 : 0, catalogTier: input.catalogTier, maxUses: input.maxUses, expiresAt: input.expiresAt ?? null, campaign: input.campaign ?? null, note: input.note ?? null });
    return { code };
  }),
  translateProduct: protectedProcedure.input(z.object({ sourceLanguage: z.enum(["en", "ko", "zh"]), name: z.string().min(1).max(160), description: z.string().min(1).max(4000) })).mutation(async ({ input }) => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a professional fashion-commerce translator. Translate the supplied product name and description into English, Korean, and Simplified Chinese. Preserve brand names, material names, garment category, tone, and factual meaning. Return only the requested JSON object." },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "localized_product", strict: true, schema: { type: "object", properties: { nameEn: { type: "string" }, nameKo: { type: "string" }, nameZh: { type: "string" }, descriptionEn: { type: "string" }, descriptionKo: { type: "string" }, descriptionZh: { type: "string" } }, required: ["nameEn", "nameKo", "nameZh", "descriptionEn", "descriptionKo", "descriptionZh"], additionalProperties: false } },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Translation response was empty.");
    return JSON.parse(content) as { nameEn: string; nameKo: string; nameZh: string; descriptionEn: string; descriptionKo: string; descriptionZh: string };
  }),
  createProduct: protectedProcedure.input(productInput).mutation(async ({ input }) => {
    const availabilityStatus = normaliseAvailabilityStatus(input.availabilityStatus, input.status);
    await createAdminProduct({ ...input, status: legacyStatusForAvailability(availabilityStatus), isActive: input.isActive ?? 1, availabilityStatus, isNew: input.isNew ?? 1, newArrivalAt: input.isNew === 0 ? null : input.newArrivalAt ?? new Date(), brand: input.brand ?? null, images: input.images ?? [input.imageUrl], imageViews: input.imageViews ?? { front: { original: input.imageUrl, studioCut: input.imageUrl, thumbnail: input.imageUrl } }, purchaseUrl: input.purchaseUrl ?? null, purchasePlatform: input.purchasePlatform ?? null, purchaseQrUrl: input.purchaseQrUrl ?? null, purchaseQrUpdatedAt: input.purchaseQrUrl ? new Date() : null, isFeatured: input.isFeatured ?? 0, featuredPriority: input.featuredPriority ?? 0, catalogTier: input.catalogTier ?? "full", garmentMeasurements: input.garmentMeasurements ?? null, sizeOptions: input.sizeOptions ?? null, stretchLevel: input.stretchLevel ?? "low" });
    return { success: true };
  }),
  updateProduct: protectedProcedure.input(productInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const { id, ...updates } = input;
    const availabilityStatus = updates.availabilityStatus ? normaliseAvailabilityStatus(updates.availabilityStatus, updates.status) : undefined;
    await updateAdminProduct(id, { ...updates, ...(availabilityStatus ? { availabilityStatus, status: legacyStatusForAvailability(availabilityStatus) } : {}), ...(updates.isNew === 0 ? { newArrivalAt: null } : updates.isNew === 1 && !updates.newArrivalAt ? { newArrivalAt: new Date() } : {}), ...(Object.prototype.hasOwnProperty.call(updates, "purchaseQrUrl") ? { purchaseQrUpdatedAt: new Date() } : {}) });
    return { success: true };
  }),
  deleteProduct: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const result = await deleteAdminProduct(input.id);
    return { success: true, ...result };
  }),
  deleteProducts: protectedProcedure.input(z.object({ ids: z.array(z.number().int().positive()).min(1).max(1000) })).mutation(async ({ input }) => {
    const result = await deleteAdminProducts(input.ids);
    return { success: true, ...result };
  }),
  deleteAllProducts: protectedProcedure.mutation(async () => {
    const result = await deleteAllAdminProducts();
    return { success: true, ...result };
  }),
});
