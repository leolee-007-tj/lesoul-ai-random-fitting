import { z } from "zod";
import { eq } from "drizzle-orm";
import { createAdminProduct, createCuratedOutfit, createProductCategory, deleteAdminProduct, deleteAdminProducts, deleteAllAdminProducts, getAdminStats, getCatalog, getDb, listCuratedOutfits, listProductCategories, resolveDisplayCategoryId, updateAdminProduct, updateCuratedOutfit, updateProductCategory } from "../db";
import { invokeLLM } from "../_core/llm";
import { ownerProcedure, router } from "../_core/trpc";
import { redeemCodes, releaseSettings } from "../../drizzle/schema";
import { getReleaseSettings } from "../access";
import { createHash, randomBytes } from "node:crypto";
import { legacyStatusForAvailability, normaliseAvailabilityStatus } from "../../shared/productAvailability";
import { validDisplayScale } from "../../shared/catalogDisplay";
import { BASE_CATEGORY_OPTIONS } from "../../shared/productCategories";
import { MEASUREMENT_FIELD_KEYS } from "../../shared/categoryMeasurementFields";
import { STYLE_PRESET_KEYS } from "../../shared/stylist";
import { optionalKoreanCustomerCopy, requiredKoreanCustomerCopy } from "../../shared/adminTranslation";
import { representativeSetCategory, SET_COMPONENT_CATEGORIES, sumSetComponentPrices, type SetProductComponent } from "../../shared/setProducts";
import { normalizePriceTagExtraction } from "../../shared/priceTagOcr";

const setComponentInput = z.object({
  componentId: z.string().trim().min(1).max(64),
  sortOrder: z.number().int().min(1).max(99).optional(),
  category: z.enum(SET_COMPONENT_CATEGORIES),
  name: z.string().trim().min(1).max(160),
  nameEn: z.string().trim().max(160).nullable().optional(),
  nameKo: z.string().trim().max(160).nullable().optional(),
  nameZh: z.string().trim().max(160).nullable().optional(),
  price: z.number().int().min(1).max(10_000_000),
  garmentMeasurements: z.object({ shoulderCm: z.number().min(0).max(300).nullable().optional(), bustCm: z.number().min(0).max(300).nullable().optional(), waistCm: z.number().min(0).max(300).nullable().optional(), hipCm: z.number().min(0).max(300).nullable().optional(), sleeveCm: z.number().min(0).max(200).nullable().optional(), totalLengthCm: z.number().min(0).max(300).nullable().optional(), riseCm: z.number().min(0).max(100).nullable().optional(), thighCm: z.number().min(0).max(200).nullable().optional(), inseamCm: z.number().min(0).max(200).nullable().optional() }).nullable().optional(),
  stretchLevel: z.enum(["none", "low", "medium", "high"]).nullable().optional(),
});

const priceTagOcrInput = z.object({ dataUrl: z.string().regex(/^data:image\/(?:jpeg|png|webp);base64,/, "Only JPEG, PNG, or WebP images are supported.").max(12_000_000) });

const productInput = z.object({
  name: z.string().min(1).max(160),
  nameEn: z.string().max(160).nullable().optional(),
  nameKo: z.string().max(160).nullable().optional(),
  nameZh: z.string().max(160).nullable().optional(),
  brand: z.string().max(120).nullable().optional(),
  displayCategoryId: z.number().int().positive().nullable().optional(),
  category: z.enum(["top", "bottom", "outer", "dress", "shoes", "bag"]),
  season: z.string().min(1).max(120),
  color: z.string().min(1).max(80),
  style: z.string().min(1).max(200),
  status: z.enum(["in_stock", "sold_out"]),
  inventoryQuantity: z.number().int().min(0).max(1_000_000).optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  availabilityStatus: z.enum(["IN_STOCK", "PRE_ORDER", "SOLD_OUT"]).optional(),
  vipEarlyAccess: z.number().int().min(0).max(1).optional(),
  isNew: z.number().int().min(0).max(1).optional(),
  newArrivalAt: z.date().nullable().optional(),
  price: z.number().int().min(0),
  productType: z.enum(["SINGLE", "SET"]).optional(),
  setComponents: z.array(setComponentInput).min(2).max(6).nullable().optional(),
  normalDiscountPercent: z.union([z.literal(17), z.literal(20)]).optional(),
  vipDiscountPercent: z.union([z.literal(20), z.literal(30)]).optional(),
  priceOriginal: z.number().int().positive().nullable().optional(),
  discountRate: z.number().int().min(1).max(99).nullable().optional(),
  priceSale: z.number().int().positive().nullable().optional(),
  saleEnabled: z.number().int().min(0).max(1).optional(),
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
  /** UI-only thumbnail controls. These values never enter fit or generation inputs. */
  catalogDisplay: z.object({ manualScale: z.number().min(0.7).max(1.1).nullable().optional(), objectPositionX: z.number().min(0).max(100).nullable().optional(), objectPositionY: z.number().min(0).max(100).nullable().optional() }).nullable().optional(),
  sizeOptions: z.array(z.object({ label: z.string().min(1).max(32), available: z.boolean().optional(), shoulderCm: z.number().min(0).max(300).nullable().optional(), bustCm: z.number().min(0).max(300).nullable().optional(), waistCm: z.number().min(0).max(300).nullable().optional(), hipCm: z.number().min(0).max(300).nullable().optional(), sleeveCm: z.number().min(0).max(200).nullable().optional(), totalLengthCm: z.number().min(0).max(300).nullable().optional(), riseCm: z.number().min(0).max(100).nullable().optional(), thighCm: z.number().min(0).max(200).nullable().optional(), inseamCm: z.number().min(0).max(200).nullable().optional() })).max(8).nullable().optional(),
  stretchLevel: z.enum(["none", "low", "medium", "high"]).optional(),
  stylistMetadata: z.object({ mainColor: z.string().max(80).optional(), secondaryColor: z.string().max(80).optional(), pattern: z.string().max(80).optional(), materialAppearance: z.string().max(120).optional(), silhouette: z.string().max(120).optional(), formality: z.number().int().min(1).max(5).optional(), fashionMood: z.array(z.string().max(64)).max(8).optional(), recommendedStyles: z.array(z.enum(["quiet_luxury", "elegant", "minimal", "chic", "casual", "office", "date", "street", "ai_choice"])).max(9).optional(), compatibleColors: z.array(z.string().max(80)).max(8).optional(), layeringSuitability: z.enum(["base", "layer", "outer", "complete", "accessory"]).optional(), source: z.enum(["manual", "vision"]).optional() }).nullable().optional(),
});

const curatedOutfitInput = z.object({
  nameEn: z.string().trim().min(1).max(160),
  nameKo: z.string().trim().min(1).max(160),
  nameZh: z.string().trim().min(1).max(160),
  reasonEn: z.string().trim().max(2000).nullable().optional(),
  reasonKo: z.string().trim().max(2000).nullable().optional(),
  reasonZh: z.string().trim().max(2000).nullable().optional(),
  stylePresetKey: z.enum(STYLE_PRESET_KEYS),
  isActive: z.number().int().min(0).max(1).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  items: z.array(z.object({ productId: z.number().int().positive(), isAnchor: z.number().int().min(0).max(1).optional(), sortOrder: z.number().int().min(0).max(9999).optional() })).min(2).max(12),
});

type SaleCandidate = { price?: number; priceOriginal?: number | null; discountRate?: number | null; priceSale?: number | null; saleEnabled?: number | null };
type SetComponentDraft = z.infer<typeof setComponentInput>;
type SetCandidate = { productType?: "SINGLE" | "SET" | null; setComponents?: SetComponentDraft[] | null; price?: number; priceOriginal?: number | null };

function normalizeSetComponents(components: SetComponentDraft[]): SetProductComponent[] {
  const ids = new Set<string>();
  const normalized = components.map((component, index) => {
    const componentId = component.componentId.trim();
    if (ids.has(componentId)) throw new Error("SET_COMPONENT_DUPLICATE");
    ids.add(componentId);
    return {
      componentId,
      sortOrder: component.sortOrder ?? index + 1,
      category: component.category,
      name: component.name.trim(),
      nameEn: component.nameEn?.trim() || null,
      nameKo: component.nameKo?.trim() || null,
      nameZh: component.nameZh?.trim() || null,
      price: Math.round(component.price),
      garmentMeasurements: component.garmentMeasurements ?? null,
      stretchLevel: component.stretchLevel ?? null,
    } satisfies SetProductComponent;
  }).sort((a, b) => a.sortOrder - b.sortOrder || a.componentId.localeCompare(b.componentId));
  if (normalized.length < 2) throw new Error("SET_NEEDS_TWO_COMPONENTS");
  return normalized.map((component, index) => ({ ...component, sortOrder: index + 1 }));
}

function resolveSetFields(input: SetCandidate, existing?: SetCandidate) {
  const isTouched = Object.prototype.hasOwnProperty.call(input, "productType") || Object.prototype.hasOwnProperty.call(input, "setComponents");
  if (!isTouched && existing) return {};
  const productType = input.productType ?? existing?.productType ?? "SINGLE";
  if (productType === "SINGLE") return { productType: "SINGLE" as const, setComponents: null };
  const components = normalizeSetComponents(input.setComponents ?? existing?.setComponents ?? []);
  const total = sumSetComponentPrices(components);
  return { productType: "SET" as const, setComponents: components, price: total, priceOriginal: total };
}

function resolveSaleFields(input: SaleCandidate, existing?: SaleCandidate) {
  const original = Math.round(input.priceOriginal ?? input.price ?? existing?.priceOriginal ?? existing?.price ?? 0);
  const saleEnabled = input.saleEnabled ?? existing?.saleEnabled ?? 0;
  const rate = input.discountRate ?? existing?.discountRate ?? null;
  const sale = input.priceSale ?? existing?.priceSale ?? null;
  if (original <= 0) throw new Error("SALE_ORIGINAL_PRICE_REQUIRED");
  if (saleEnabled) {
    if (!rate || !sale || sale >= original) throw new Error("SALE_PRICE_INVALID");
    return { price: original, priceOriginal: original, discountRate: rate, priceSale: sale, saleEnabled: 1 };
  }
  return { price: original, priceOriginal: original, discountRate: null, priceSale: null, saleEnabled: 0 };
}

export const adminRouter = router({
  products: ownerProcedure.query(async () => (await getCatalog()).products),
  extractPriceTag: ownerProcedure.input(priceTagOcrInput).mutation(async ({ input }) => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You extract printed characters from a product price-tag image for an owner-only catalog form. This is OCR, not image copying: return text and numbers only, never the image, pixels, an image URL, or a visual description. Korean is the default reading language when the characters are Korean or unclear; if the visible characters are Chinese, English, or another language, preserve those exact source-language characters. Never translate or invent the original text during OCR. The expected printed order is Maker | Color | Clothing Name | Price, but handle line breaks, Korean, Chinese, English, ¥, 元, RMB, commas, and decimal separators." },
        { role: "user", content: [
          { type: "text", text: "Extract the price tag. rawText must contain only readable characters copied as text from the image. sourceLanguage must be ko for Korean, zh for Chinese, en for English, or other for another script. Return null for a field that is not visible. price must be a positive number in the displayed currency, with separators removed. Do not return image data." },
          { type: "image_url", image_url: { url: input.dataUrl, detail: "high" } },
        ] },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "price_tag_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              sourceLanguage: { type: "string", enum: ["ko", "zh", "en", "other"] },
              maker: { type: ["string", "null"] },
              color: { type: ["string", "null"] },
              clothingName: { type: ["string", "null"] },
              price: { type: ["number", "null"] },
              rawText: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["sourceLanguage", "maker", "color", "clothingName", "price", "rawText", "confidence"],
            additionalProperties: false,
          },
        },
      },
      maxTokens: 1200,
    });
    const content = response.choices[0]?.message?.content;
    const text = typeof content === "string" ? content : Array.isArray(content) ? content.filter((part) => part.type === "text").map((part) => part.text).join("\n") : "";
    if (!text) throw new Error("PRICE_TAG_OCR_EMPTY");
    let parsed: { sourceLanguage?: unknown; maker?: unknown; color?: unknown; clothingName?: unknown; price?: unknown; rawText?: unknown; confidence?: unknown };
    try { parsed = JSON.parse(text); } catch { throw new Error("PRICE_TAG_OCR_INVALID"); }
    return normalizePriceTagExtraction(parsed);
  }),
  curatedOutfits: ownerProcedure.query(async () => listCuratedOutfits(true)),
  createCuratedOutfit: ownerProcedure.input(curatedOutfitInput).mutation(async ({ input }) => createCuratedOutfit(input)),
  updateCuratedOutfit: ownerProcedure.input(curatedOutfitInput.partial().extend({ id: z.number().int().positive(), items: curatedOutfitInput.shape.items.optional() })).mutation(async ({ input }) => {
    const { id, ...updates } = input;
    return updateCuratedOutfit(id, updates);
  }),
  productCategories: ownerProcedure.query(async () => listProductCategories(true)),
  createProductCategory: ownerProcedure.input(z.object({ nameEn: z.string().trim().min(1).max(120), nameKo: z.string().trim().min(1).max(120), nameZh: z.string().trim().min(1).max(120), baseCategory: z.enum(BASE_CATEGORY_OPTIONS), measurementFields: z.array(z.enum(MEASUREMENT_FIELD_KEYS)).min(1).max(MEASUREMENT_FIELD_KEYS.length).optional(), isActive: z.number().int().min(0).max(1).optional(), sortOrder: z.number().int().min(0).max(9999).optional() })).mutation(async ({ input }) => createProductCategory(input)),
  updateProductCategory: ownerProcedure.input(z.object({ id: z.number().int().positive(), nameEn: z.string().trim().min(1).max(120).optional(), nameKo: z.string().trim().min(1).max(120).optional(), nameZh: z.string().trim().min(1).max(120).optional(), baseCategory: z.enum(BASE_CATEGORY_OPTIONS).optional(), measurementFields: z.array(z.enum(MEASUREMENT_FIELD_KEYS)).min(1).max(MEASUREMENT_FIELD_KEYS.length).optional(), isActive: z.number().int().min(0).max(1).optional(), sortOrder: z.number().int().min(0).max(9999).optional() })).mutation(async ({ input }) => { const { id, ...updates } = input; return updateProductCategory(id, updates); }),
  stats: ownerProcedure.query(getAdminStats),
  releaseConfig: ownerProcedure.query(getReleaseSettings),
  updatePresenceAlertConfig: ownerProcedure.input(z.object({ presenceAlertEnabled: z.number().int().min(0).max(1).optional(), presenceAlertSoundUrl: z.string().min(1).nullable().optional(), presenceAlertRepeatCount: z.number().int().min(1).max(5).optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Presence alert settings are temporarily unavailable.");
    const current = await getReleaseSettings();
    const presenceAlertSoundUrl = input.presenceAlertSoundUrl === undefined ? current.presenceAlertSoundUrl : input.presenceAlertSoundUrl;
    const presenceAlertEnabled = input.presenceAlertEnabled ?? current.presenceAlertEnabled;
    const presenceAlertRepeatCount = Math.min(5, Math.max(1, input.presenceAlertRepeatCount ?? current.presenceAlertRepeatCount ?? 1));
    await db.update(releaseSettings).set({ presenceAlertEnabled, presenceAlertSoundUrl, presenceAlertRepeatCount }).where(eq(releaseSettings.id, 1));
    return { presenceAlertEnabled, presenceAlertSoundUrl, presenceAlertRepeatCount };
  }),
  updateReleaseConfig: ownerProcedure.input(z.object({ storeName: z.string().trim().min(1).max(80).optional(), storeTaglineEn: z.string().trim().min(1).max(180).optional(), storeTaglineKo: z.string().trim().min(1).max(180).optional(), storeTaglineZh: z.string().trim().min(1).max(180).optional(), pricingMode: z.enum(["BASE", "SEASON_FORMAT_1", "SEASON_FORMAT_2", "SEASON_FORMAT_3"]).optional(), excludeNewArrivalsFromSale: z.number().int().min(0).max(1).optional(), adminTrialPaymentQrUrl: z.string().min(1).nullable().optional(), adminTrialUsageGuideQrUrl: z.string().min(1).nullable().optional(), adminTrialPaymentNoticeEn: z.string().trim().min(1).max(800).optional(), adminTrialPaymentNoticeKo: z.string().trim().min(1).max(800).optional(), adminTrialPaymentNoticeZh: z.string().trim().min(1).max(800).optional(), releaseMode: z.enum(["PRIVATE", "BETA_PUBLIC", "REDEEM_CODE"]), betaCatalogLimit: z.number().int().min(4).max(100), betaDailyVisitorLimit: z.number().int().min(0).max(100), betaFreeGenerationAllowance: z.number().int().min(1).max(100).optional(), globalDailyGenerationLimit: z.number().int().min(0).max(1000000), monthlyGenerationLimit: z.number().int().min(0).max(1000000), generationEnabled: z.number().int().min(0).max(1), purchaseMode: z.enum(["PURCHASE_LIST", "QR", "DISABLED"]).optional(), purchaseListMaxItems: z.number().int().min(1).max(20).optional(), purchaseQrEnabled: z.number().int().min(0).max(1).optional(), purchaseNoticeEn: z.string().max(1200).nullable().optional(), purchaseNoticeKo: z.string().max(1200).nullable().optional(), purchaseNoticeZh: z.string().max(1200).nullable().optional(), stylistIncludePreorder: z.number().int().min(0).max(1).optional() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("Release settings are temporarily unavailable.");
    const current = await getReleaseSettings();
    const update = { ...input, storeName: input.storeName ?? current.storeName, storeTaglineEn: input.storeTaglineEn ?? current.storeTaglineEn, storeTaglineKo: input.storeTaglineKo ?? current.storeTaglineKo, storeTaglineZh: input.storeTaglineZh ?? current.storeTaglineZh, pricingMode: input.pricingMode ?? current.pricingMode, excludeNewArrivalsFromSale: input.excludeNewArrivalsFromSale ?? current.excludeNewArrivalsFromSale, adminTrialPaymentQrUrl: input.adminTrialPaymentQrUrl ?? current.adminTrialPaymentQrUrl, adminTrialUsageGuideQrUrl: input.adminTrialUsageGuideQrUrl ?? current.adminTrialUsageGuideQrUrl, adminTrialPaymentNoticeEn: input.adminTrialPaymentNoticeEn ?? current.adminTrialPaymentNoticeEn, adminTrialPaymentNoticeKo: input.adminTrialPaymentNoticeKo ?? current.adminTrialPaymentNoticeKo, adminTrialPaymentNoticeZh: input.adminTrialPaymentNoticeZh ?? current.adminTrialPaymentNoticeZh, betaFreeGenerationAllowance: input.betaFreeGenerationAllowance ?? current.betaFreeGenerationAllowance, purchaseMode: input.purchaseMode ?? current.purchaseMode, purchaseListMaxItems: input.purchaseListMaxItems ?? current.purchaseListMaxItems, purchaseQrEnabled: input.purchaseQrEnabled ?? current.purchaseQrEnabled, purchaseNoticeEn: input.purchaseNoticeEn ?? current.purchaseNoticeEn, purchaseNoticeKo: input.purchaseNoticeKo ?? current.purchaseNoticeKo, purchaseNoticeZh: input.purchaseNoticeZh ?? current.purchaseNoticeZh, stylistIncludePreorder: input.stylistIncludePreorder ?? current.stylistIncludePreorder };
    await db.insert(releaseSettings).values({ id: 1, ...update }).onDuplicateKeyUpdate({ set: update });
    return getReleaseSettings();
  }),
  createRedeemCode: ownerProcedure.input(z.object({ code: z.string().min(4).max(64).optional(), generationAllowance: z.number().int().min(1).max(1000), isUnlimited: z.boolean().optional(), catalogTier: z.enum(["basic", "full"]), maxUses: z.number().int().min(1).max(100000), expiresAt: z.date().nullable().optional(), campaign: z.string().max(120).nullable().optional(), note: z.string().max(4000).nullable().optional() })).mutation(async () => {
    throw new Error("REDEEM_DISABLED_USE_VIP_ACCOUNT");
  }),
  translateCustomerText: ownerProcedure.input(z.object({ context: z.enum(["product", "outfit", "category", "purchase_notice"]), title: z.string().trim().min(1).max(2000), body: z.string().trim().max(4000).nullable().optional() })).mutation(async ({ input }) => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a premium fashion-commerce localization service. Detect whether the supplied source text is English, Korean, or Simplified Chinese. Preserve the original source exactly (apart from surrounding whitespace) and translate it faithfully into the other two languages. Do not add products, prices, claims, policy, or details. Return all EN, KO, and Simplified Chinese values plus the detected source locale in the required JSON." },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "localized_customer_text", strict: true, schema: { type: "object", properties: { sourceLanguage: { type: "string", enum: ["en", "ko", "zh"] }, titleEn: { type: "string" }, titleKo: { type: "string" }, titleZh: { type: "string" }, bodyEn: { type: "string" }, bodyKo: { type: "string" }, bodyZh: { type: "string" } }, required: ["sourceLanguage", "titleEn", "titleKo", "titleZh", "bodyEn", "bodyKo", "bodyZh"], additionalProperties: false } } },
    });
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Translation response was empty.");
    const translated = JSON.parse(content) as { sourceLanguage: "en" | "ko" | "zh"; titleEn: string; titleKo: string; titleZh: string; bodyEn: string; bodyKo: string; bodyZh: string };
    return { sourceLanguage: translated.sourceLanguage, titleEn: translated.titleEn.trim(), titleKo: translated.titleKo.trim(), titleZh: translated.titleZh.trim(), bodyEn: translated.bodyEn.trim(), bodyKo: translated.bodyKo.trim(), bodyZh: translated.bodyZh.trim() };
  }),
  translateProduct: ownerProcedure.input(z.object({ sourceLanguage: z.enum(["en", "ko", "zh"]), name: z.string().min(1).max(160), description: z.string().min(1).max(4000) })).mutation(async ({ input }) => {
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
  translatePurchaseNotice: ownerProcedure.input(z.object({ noticeKo: z.string().trim().min(1).max(1200) })).mutation(async ({ input }) => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You translate customer-facing Korean purchase-request notices for a premium fashion brand. Translate faithfully into natural English and Simplified Chinese. Preserve brand names, QR payment, WeChat, final-price, return, exchange, and policy meanings exactly. Do not add policies or claims. Return only the requested JSON object." },
        { role: "user", content: input.noticeKo },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "purchase_notice_translation", strict: true, schema: { type: "object", properties: { noticeEn: { type: "string" }, noticeZh: { type: "string" } }, required: ["noticeEn", "noticeZh"], additionalProperties: false } },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Purchase notice translation response was empty.");
    const translated = JSON.parse(content) as { noticeEn: string; noticeZh: string };
    return { noticeKo: input.noticeKo, noticeEn: translated.noticeEn.trim(), noticeZh: translated.noticeZh.trim() };
  }),
  translateCuratedOutfit: ownerProcedure.input(z.object({ nameKo: z.string().trim().min(1).max(160), reasonKo: z.string().trim().max(2000).nullable().optional() })).mutation(async ({ input }) => {
    const nameKo = requiredKoreanCustomerCopy(input.nameKo);
    const reasonKo = optionalKoreanCustomerCopy(input.reasonKo);
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You translate Korean customer-facing names and recommendation reasons for a premium fashion styling app. Translate faithfully into natural English and Simplified Chinese. Preserve LESOUL, garment names, style names, product claims, tone, and factual meaning. Do not add products, prices, policies, or claims. Return only the requested JSON object." },
        { role: "user", content: JSON.stringify({ nameKo, reasonKo: reasonKo ?? "" }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "curated_outfit_translation", strict: true, schema: { type: "object", properties: { nameEn: { type: "string" }, nameZh: { type: "string" }, reasonEn: { type: "string" }, reasonZh: { type: "string" } }, required: ["nameEn", "nameZh", "reasonEn", "reasonZh"], additionalProperties: false } },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Curated outfit translation response was empty.");
    const translated = JSON.parse(content) as { nameEn: string; nameZh: string; reasonEn: string; reasonZh: string };
    return { nameKo, nameEn: translated.nameEn.trim(), nameZh: translated.nameZh.trim(), reasonKo, reasonEn: optionalKoreanCustomerCopy(translated.reasonEn), reasonZh: optionalKoreanCustomerCopy(translated.reasonZh) };
  }),
  translateProductCategory: ownerProcedure.input(z.object({ nameKo: z.string().trim().min(1).max(120) })).mutation(async ({ input }) => {
    const nameKo = requiredKoreanCustomerCopy(input.nameKo);
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You translate Korean customer-facing fashion catalog category names into natural English and Simplified Chinese. Preserve garment-category meaning exactly and return only the requested JSON object." },
        { role: "user", content: nameKo },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "product_category_translation", strict: true, schema: { type: "object", properties: { nameEn: { type: "string" }, nameZh: { type: "string" } }, required: ["nameEn", "nameZh"], additionalProperties: false } },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Product category translation response was empty.");
    const translated = JSON.parse(content) as { nameEn: string; nameZh: string };
    return { nameKo, nameEn: translated.nameEn.trim(), nameZh: translated.nameZh.trim() };
  }),
  createProduct: ownerProcedure.input(productInput).mutation(async ({ input }) => {
    const availabilityStatus = normaliseAvailabilityStatus(input.availabilityStatus, input.status);
    const inventoryQuantity = availabilityStatus === "SOLD_OUT" ? 0 : input.inventoryQuantity ?? 1;
    const { productType: _productType, setComponents: _setComponents, ...productInputFields } = input;
    const setFields = resolveSetFields(input);
    const representativeCategory = setFields.productType === "SET" ? representativeSetCategory(setFields.setComponents, input.category) : input.category;
    const categoryLink = await resolveDisplayCategoryId(input.displayCategoryId, representativeCategory);
    const catalogDisplay = input.catalogDisplay ? { manualScale: validDisplayScale(input.catalogDisplay.manualScale), objectPositionX: input.catalogDisplay.objectPositionX ?? 50, objectPositionY: input.catalogDisplay.objectPositionY ?? 50 } : null;
    const sale = resolveSaleFields({ ...productInputFields, ...setFields });
    await createAdminProduct({ ...productInputFields, ...setFields, ...sale, category: categoryLink.category, displayCategoryId: categoryLink.displayCategoryId, status: legacyStatusForAvailability(availabilityStatus), inventoryQuantity, isActive: input.isActive ?? 1, availabilityStatus, vipEarlyAccess: input.vipEarlyAccess ?? 0, isNew: input.isNew ?? 1, newArrivalAt: input.isNew === 0 ? null : input.newArrivalAt ?? new Date(), brand: input.brand ?? null, images: input.images ?? [input.imageUrl], imageViews: input.imageViews ?? { front: { original: input.imageUrl, studioCut: input.imageUrl, thumbnail: input.imageUrl } }, purchaseUrl: input.purchaseUrl ?? null, purchasePlatform: input.purchasePlatform ?? null, purchaseQrUrl: input.purchaseQrUrl ?? null, purchaseQrUpdatedAt: input.purchaseQrUrl ? new Date() : null, isFeatured: input.isFeatured ?? 0, featuredPriority: input.featuredPriority ?? 0, catalogTier: input.catalogTier ?? "full", garmentMeasurements: input.garmentMeasurements ?? null, sizeOptions: input.sizeOptions ?? null, catalogDisplay, stretchLevel: input.stretchLevel ?? "low" });
    return { success: true };
  }),
  updateProduct: ownerProcedure.input(productInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const { id, ...updates } = input;
    const existing = (await getCatalog()).products.find((product) => product.id === id);
    if (!existing) throw new Error("PRODUCT_NOT_FOUND");
    const hasInventoryUpdate = Object.prototype.hasOwnProperty.call(updates, "inventoryQuantity");
    const requestedInventory = updates.inventoryQuantity ?? existing.inventoryQuantity;
    const shouldBeSoldOut = updates.status === "sold_out" || updates.availabilityStatus === "SOLD_OUT" || (hasInventoryUpdate && requestedInventory === 0);
    const availabilityStatus = shouldBeSoldOut ? "SOLD_OUT" as const : updates.availabilityStatus ? normaliseAvailabilityStatus(updates.availabilityStatus, updates.status) : undefined;
    const inventoryQuantity = shouldBeSoldOut ? 0 : hasInventoryUpdate ? requestedInventory : undefined;
    const catalogDisplay = updates.catalogDisplay === undefined ? undefined : updates.catalogDisplay ? { manualScale: validDisplayScale(updates.catalogDisplay.manualScale), objectPositionX: updates.catalogDisplay.objectPositionX ?? 50, objectPositionY: updates.catalogDisplay.objectPositionY ?? 50 } : null;
    const { productType: _productType, setComponents: _setComponents, ...productUpdates } = updates;
    const setFields = resolveSetFields(updates, existing);
    const representativeCategory = setFields.productType === "SET" && setFields.setComponents ? representativeSetCategory(setFields.setComponents, updates.category ?? existing.category) : updates.category ?? existing.category;
    const refreshSetRepresentative = setFields.productType === "SET" && Boolean(setFields.setComponents);
    const categoryId = refreshSetRepresentative && updates.displayCategoryId === undefined ? undefined : updates.displayCategoryId ?? existing.displayCategoryId;
    const categoryLink = updates.displayCategoryId === undefined && !refreshSetRepresentative && updates.category === undefined ? null : await resolveDisplayCategoryId(categoryId, representativeCategory);
    const touchesSale = ["price", "priceOriginal", "discountRate", "priceSale", "saleEnabled"].some((key) => Object.prototype.hasOwnProperty.call(updates, key)) || Object.prototype.hasOwnProperty.call(setFields, "price");
    const sale = touchesSale ? resolveSaleFields({ ...productUpdates, ...setFields }, existing) : {};
    await updateAdminProduct(id, { ...productUpdates, ...setFields, ...sale, ...(categoryLink ? { displayCategoryId: categoryLink.displayCategoryId, category: categoryLink.category } : {}), ...(catalogDisplay !== undefined ? { catalogDisplay } : {}), ...(availabilityStatus ? { availabilityStatus, status: legacyStatusForAvailability(availabilityStatus) } : {}), ...(inventoryQuantity !== undefined ? { inventoryQuantity } : {}), ...(updates.isNew === 0 ? { newArrivalAt: null } : updates.isNew === 1 && !updates.newArrivalAt ? { newArrivalAt: new Date() } : {}), ...(Object.prototype.hasOwnProperty.call(updates, "purchaseQrUrl") ? { purchaseQrUpdatedAt: new Date() } : {}) });
    return { success: true };
  }),
  deleteProduct: ownerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    const result = await deleteAdminProduct(input.id);
    return { success: true, ...result };
  }),
  deleteProducts: ownerProcedure.input(z.object({ ids: z.array(z.number().int().positive()).min(1).max(1000) })).mutation(async ({ input }) => {
    const result = await deleteAdminProducts(input.ids);
    return { success: true, ...result };
  }),
  deleteAllProducts: ownerProcedure.mutation(async () => {
    const result = await deleteAllAdminProducts();
    return { success: true, ...result };
  }),
});
