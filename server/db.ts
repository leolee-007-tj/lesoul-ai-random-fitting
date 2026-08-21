import { count, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { backgrounds, curatedOutfitItems, curatedOutfits, generationLogs, generations, InsertUser, poses, productCategories, products, productShareVisits, releaseSettings, stylePresets, stylistFeedback, users } from "../drizzle/schema";
import { demoBackgrounds, demoPoses, demoProducts } from "./catalogSeed";
import { ENV } from "./_core/env";
import { DEFAULT_STYLE_PRESETS, type StylePresetKey } from "../shared/stylist";
import { isStylistEligible } from "../shared/productAvailability";
import { resolveCatalogDisplay } from "../shared/catalogDisplay";
import { baseCategoryToCoreCategory, DEFAULT_MANAGED_CATEGORIES, type BaseCategory } from "../shared/productCategories";
import { normalizeMeasurementFields, type MeasurementFieldKey } from "../shared/categoryMeasurementFields";

let _db: ReturnType<typeof drizzle> | null = null;
let _catalogEnsurePromise: Promise<boolean> | null = null;
let _catalogEnsured = false;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date(), role: user.openId === ENV.ownerOpenId ? "admin" : (user.role ?? "user") };
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, role: values.role } });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

async function ensureCatalogOnce() {
  const db = await getDb();
  if (!db) return false;
  const [settingsRows, [{ productCount }]] = await Promise.all([
    db.select().from(releaseSettings).where(eq(releaseSettings.id, 1)).limit(1),
    db.select({ productCount: count() }).from(products),
  ]);
  const settings = settingsRows[0];
  await ensureManagedProductCategories();
  if (settings?.catalogInitialized) return true;
  if (productCount > 0) {
    await db.insert(releaseSettings).values({ id: 1, catalogInitialized: 1 }).onDuplicateKeyUpdate({ set: { catalogInitialized: 1 } });
    return true;
  }
  await Promise.all(demoProducts.map((item) => db.insert(products).values(item).onDuplicateKeyUpdate({ set: {
    category: item.category, season: item.season, color: item.color, style: item.style, status: item.status,
    isActive: item.isActive ?? 1, availabilityStatus: item.availabilityStatus ?? (item.status === "sold_out" ? "SOLD_OUT" : "IN_STOCK"), isNew: item.isNew ?? 0, newArrivalAt: item.newArrivalAt ?? null,
    price: item.price, priceOriginal: item.priceOriginal, discountRate: item.discountRate, priceSale: item.priceSale, saleEnabled: item.saleEnabled, imageUrl: item.imageUrl, images: item.images, imageViews: item.imageViews, description: item.description,
    nameEn: item.nameEn, nameKo: item.nameKo, nameZh: item.nameZh,
    descriptionEn: item.descriptionEn, descriptionKo: item.descriptionKo, descriptionZh: item.descriptionZh,
    discountSeasonEnabled: item.discountSeasonEnabled, discountOnePercent: item.discountOnePercent, discountTwoPercent: item.discountTwoPercent,
    discountThreePercent: item.discountThreePercent, discountFourPlusPercent: item.discountFourPlusPercent,
    momentCouponEnabled: item.momentCouponEnabled, momentCouponCode: item.momentCouponCode, momentCouponPercent: item.momentCouponPercent,
    fabric: item.fabric, texture: item.texture, fit: item.fit, length: item.length, width: item.width,
    details: item.details, neckline: item.neckline, sleeve: item.sleeve,
    purchaseUrl: item.purchaseUrl, purchasePlatform: item.purchasePlatform, stylistMetadata: item.stylistMetadata,
  } })));
  await Promise.all(demoPoses.map((item) => db.insert(poses).values(item).onDuplicateKeyUpdate({ set: {
    promptKeyword: item.promptKeyword, imageUrl: item.imageUrl,
  } })));
  await Promise.all(demoBackgrounds.map((item) => db.insert(backgrounds).values(item).onDuplicateKeyUpdate({ set: {
    promptKeyword: item.promptKeyword, styleTags: item.styleTags, imageUrl: item.imageUrl,
  } })));
  await Promise.all(DEFAULT_STYLE_PRESETS.map((preset) => db.insert(stylePresets).values(preset).onDuplicateKeyUpdate({ set: {
    name: preset.name, description: preset.description, matchingTags: preset.matchingTags, weights: preset.weights, isActive: 1,
  } })));
  await db.insert(releaseSettings).values({ id: 1, catalogInitialized: 1 }).onDuplicateKeyUpdate({ set: { catalogInitialized: 1 } });
  return true;
}

export async function ensureCatalog() {
  if (_catalogEnsured) return true;
  if (!_catalogEnsurePromise) {
    _catalogEnsurePromise = ensureCatalogOnce()
      .then((ready) => { if (ready) _catalogEnsured = true; return ready; })
      .finally(() => { _catalogEnsurePromise = null; });
  }
  return _catalogEnsurePromise;
}

export async function getCatalog() {
  const db = await getDb();
  if (!db) throw new Error("The catalog is temporarily unavailable.");
  await ensureCatalog();
  const [catalogProducts, catalogPoses, catalogBackgrounds, catalogStylePresets, managedCategories] = await Promise.all([db.select().from(products), db.select().from(poses), db.select().from(backgrounds), db.select().from(stylePresets).where(eq(stylePresets.isActive, 1)), listProductCategories(true)]);
  const categoryById = new Map(managedCategories.map((category) => [category.id, category]));
  const enrichedProducts = catalogProducts.map((product) => ({ ...product, displayCategory: product.displayCategoryId ? categoryById.get(product.displayCategoryId) ?? null : null }));
  return { products: resolveCatalogDisplay(enrichedProducts), poses: catalogPoses, backgrounds: catalogBackgrounds, stylePresets: catalogStylePresets, productCategories: managedCategories };
}

/** Store at most one opaque visitor event per product and day for a copied WeChat share link. */
export async function recordWeChatProductShareVisit(input: { productId: number; visitorId: string }) {
  const db = await getDb();
  if (!db) return false;
  const product = (await db.select({ id: products.id, isActive: products.isActive }).from(products).where(eq(products.id, input.productId)).limit(1))[0];
  if (!product || product.isActive === 0) return false;
  const visitDay = new Date().toISOString().slice(0, 10);
  await db.insert(productShareVisits).values({ productId: input.productId, visitorId: input.visitorId, visitDay }).onDuplicateKeyUpdate({ set: { visitorId: input.visitorId } });
  return true;
}

export async function listWeChatProductShareAnalytics() {
  const db = await getDb();
  if (!db) return [];
  const counts = await db.select({ productId: productShareVisits.productId, visits: count() }).from(productShareVisits).groupBy(productShareVisits.productId).orderBy(desc(count()));
  if (!counts.length) return [];
  const rows = await db.select({ id: products.id, name: products.name, nameEn: products.nameEn, nameKo: products.nameKo, nameZh: products.nameZh, imageUrl: products.imageUrl, imageViews: products.imageViews }).from(products).where(inArray(products.id, counts.map((item) => item.productId)));
  const byId = new Map(rows.map((item) => [item.id, item]));
  return counts.flatMap((item) => {
    const product = byId.get(item.productId);
    return product ? [{ product, visits: Number(item.visits) }] : [];
  });
}

async function ensureManagedProductCategories() {
  const db = await getDb();
  if (!db) return [];
  const existing = await db.select().from(productCategories);
  const knownBaseCategories = new Set(existing.map((category) => category.baseCategory));
  const missing = DEFAULT_MANAGED_CATEGORIES.filter((category) => !knownBaseCategories.has(category.baseCategory));
  if (missing.length) await db.insert(productCategories).values(missing);
  const categories = missing.length ? await db.select().from(productCategories) : existing;
  await Promise.all(categories.map(async (category) => {
    const coreCategory = baseCategoryToCoreCategory(category.baseCategory);
    await db.update(products).set({ displayCategoryId: category.id }).where(sql`${products.displayCategoryId} IS NULL AND ${products.category} = ${coreCategory}`);
  }));
  return categories;
}

export async function listProductCategories(includeInactive = false) {
  const db = await getDb();
  if (!db) throw new Error("Category management is temporarily unavailable.");
  const categories = await ensureManagedProductCategories();
  const visible = includeInactive ? categories : categories.filter((category) => category.isActive === 1);
  const usage = await db.select({ displayCategoryId: products.displayCategoryId, usageCount: count() }).from(products).groupBy(products.displayCategoryId);
  const usageById = new Map(usage.filter((row) => row.displayCategoryId !== null).map((row) => [row.displayCategoryId as number, Number(row.usageCount)]));
  return visible.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id).map((category) => ({ ...category, measurementFields: normalizeMeasurementFields(category.measurementFields, category.baseCategory), usageCount: usageById.get(category.id) ?? 0 }));
}

export async function getProductCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Category management is temporarily unavailable.");
  await ensureManagedProductCategories();
  return (await db.select().from(productCategories).where(eq(productCategories.id, id)).limit(1))[0];
}

export async function createProductCategory(input: { nameEn: string; nameKo: string; nameZh: string; baseCategory: BaseCategory; measurementFields?: MeasurementFieldKey[]; isActive?: number; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Category management is temporarily unavailable.");
  const result = await db.insert(productCategories).values({ ...input, measurementFields: normalizeMeasurementFields(input.measurementFields, input.baseCategory), isActive: input.isActive ?? 1, sortOrder: input.sortOrder ?? 100 });
  return getProductCategory(Number(result[0].insertId));
}

export async function updateProductCategory(id: number, input: Partial<{ nameEn: string; nameKo: string; nameZh: string; baseCategory: BaseCategory; measurementFields: MeasurementFieldKey[]; isActive: number; sortOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("Category management is temporarily unavailable.");
  const existing = await getProductCategory(id);
  if (!existing) throw new Error("The selected category no longer exists.");
  const usage = (await db.select({ usageCount: count() }).from(products).where(eq(products.displayCategoryId, id)))[0]?.usageCount ?? 0;
  if (input.baseCategory && input.baseCategory !== existing.baseCategory && Number(usage) > 0) throw new Error("The Base Category cannot change while products use this category.");
  const normalizedInput = input.measurementFields ? { ...input, measurementFields: normalizeMeasurementFields(input.measurementFields, input.baseCategory ?? existing.baseCategory) } : input;
  await db.transaction(async (tx) => {
    await tx.update(productCategories).set(normalizedInput).where(eq(productCategories.id, id));
  });
  return getProductCategory(id);
}

export async function resolveDisplayCategoryId(displayCategoryId: number | null | undefined, fallbackCategory: "top" | "bottom" | "outer" | "dress" | "shoes" | "bag", allowInactive = false) {
  const db = await getDb();
  if (!db) throw new Error("Category management is temporarily unavailable.");
  await ensureManagedProductCategories();
  if (displayCategoryId) {
    const category = await getProductCategory(displayCategoryId);
    if (!category || (!allowInactive && !category.isActive)) throw new Error("The selected product category is inactive or unavailable.");
    return { displayCategoryId: category.id, category: baseCategoryToCoreCategory(category.baseCategory) };
  }
  const fallback = (await db.select().from(productCategories).where(eq(productCategories.baseCategory, ({ top: "TOP", bottom: "PANTS", outer: "JACKET", dress: "DRESS", shoes: "SHOES", bag: "BAG" } as const)[fallbackCategory])).limit(1))[0];
  return { displayCategoryId: fallback?.id ?? null, category: fallbackCategory };
}

export async function getActiveStylistProducts(includePreorder = false) {
  const db = await getDb();
  if (!db) throw new Error("The catalog is temporarily unavailable.");
  await ensureCatalog();
  const allProducts = await db.select().from(products);
  return allProducts.filter((product) => isStylistEligible(product, includePreorder));
}

export async function getActiveStylePresets() {
  const db = await getDb();
  if (!db) throw new Error("The style catalog is temporarily unavailable.");
  await ensureCatalog();
  return db.select().from(stylePresets).where(eq(stylePresets.isActive, 1));
}

export async function saveStylistFeedback(input: { visitorId: string; stylePresetKey: StylePresetKey; anchorProductId?: number | null; productIds: number[]; score: number; feedback: "good" | "bad" }) {
  const db = await getDb();
  if (!db) throw new Error("The feedback service is temporarily unavailable.");
  await db.insert(stylistFeedback).values({ ...input, anchorProductId: input.anchorProductId ?? null });
}

export type CuratedOutfitWrite = {
  nameEn: string; nameKo: string; nameZh: string;
  reasonEn?: string | null; reasonKo?: string | null; reasonZh?: string | null;
  stylePresetKey: StylePresetKey; isActive?: number; sortOrder?: number;
  items: Array<{ productId: number; isAnchor?: number; sortOrder?: number }>;
};

export type CuratedOutfitRead = Awaited<ReturnType<typeof listCuratedOutfits>>[number];

export async function listCuratedOutfits(includeInactive = true) {
  const db = await getDb();
  if (!db) throw new Error("Curated outfits are temporarily unavailable.");
  await ensureCatalog();
  const [outfits, items, catalog] = await Promise.all([db.select().from(curatedOutfits), db.select().from(curatedOutfitItems), getCatalog()]);
  const productById = new Map(catalog.products.map((product) => [product.id, product]));
  return outfits
    .filter((outfit) => includeInactive || outfit.isActive === 1)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .map((outfit) => {
      const outfitItems = items.filter((item) => item.outfitId === outfit.id).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      return {
        ...outfit,
        items: outfitItems.map((item) => ({ ...item, product: productById.get(item.productId) ?? null })),
        anchorProductIds: outfitItems.filter((item) => item.isAnchor === 1).map((item) => item.productId),
      };
    });
}

export async function getEligibleCuratedOutfits(input: { stylePresetKey: StylePresetKey; anchorProductId?: number | null; includePreorder?: boolean }) {
  const outfits = await listCuratedOutfits(false);
  return outfits.filter((outfit) => {
    if (outfit.stylePresetKey !== input.stylePresetKey || outfit.items.length < 2) return false;
    if (input.anchorProductId && !outfit.items.some((item) => item.productId === input.anchorProductId)) return false;
    return outfit.items.every((item) => item.product && isStylistEligible(item.product, Boolean(input.includePreorder)));
  });
}

function normaliseCuratedItems(items: CuratedOutfitWrite["items"]) {
  const deduped = new Map<number, { productId: number; isAnchor: number; sortOrder: number }>();
  items.forEach((item, index) => {
    if (!deduped.has(item.productId)) deduped.set(item.productId, { productId: item.productId, isAnchor: item.isAnchor === 0 ? 0 : 1, sortOrder: item.sortOrder ?? index + 1 });
  });
  const normalized = Array.from(deduped.values());
  if (normalized.length < 2) throw new Error("CURATED_OUTFIT_NEEDS_TWO_PRODUCTS");
  return normalized;
}

async function assertCuratedProducts(productIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Curated outfits are temporarily unavailable.");
  const found = await db.select({ id: products.id }).from(products).where(inArray(products.id, productIds));
  if (found.length !== productIds.length) throw new Error("CURATED_OUTFIT_PRODUCT_NOT_FOUND");
}

export async function createCuratedOutfit(input: CuratedOutfitWrite) {
  const db = await getDb();
  if (!db) throw new Error("Curated outfits are temporarily unavailable.");
  const items = normaliseCuratedItems(input.items);
  await assertCuratedProducts(items.map((item) => item.productId));
  const result = await db.transaction(async (tx) => {
    const insert = await tx.insert(curatedOutfits).values({ nameEn: input.nameEn, nameKo: input.nameKo, nameZh: input.nameZh, reasonEn: input.reasonEn ?? null, reasonKo: input.reasonKo ?? null, reasonZh: input.reasonZh ?? null, stylePresetKey: input.stylePresetKey, isActive: input.isActive ?? 1, sortOrder: input.sortOrder ?? 100 });
    const outfitId = Number(insert[0].insertId);
    await tx.insert(curatedOutfitItems).values(items.map((item) => ({ outfitId, ...item })));
    return outfitId;
  });
  return (await listCuratedOutfits(true)).find((outfit) => outfit.id === result);
}

export async function updateCuratedOutfit(id: number, input: Partial<Omit<CuratedOutfitWrite, "items">> & { items?: CuratedOutfitWrite["items"] }) {
  const db = await getDb();
  if (!db) throw new Error("Curated outfits are temporarily unavailable.");
  const existing = (await listCuratedOutfits(true)).find((outfit) => outfit.id === id);
  if (!existing) throw new Error("CURATED_OUTFIT_NOT_FOUND");
  const items = input.items ? normaliseCuratedItems(input.items) : null;
  if (items) await assertCuratedProducts(items.map((item) => item.productId));
  await db.transaction(async (tx) => {
    const { items: _items, ...updates } = input;
    if (Object.keys(updates).length) await tx.update(curatedOutfits).set(updates).where(eq(curatedOutfits.id, id));
    if (items) {
      await tx.delete(curatedOutfitItems).where(eq(curatedOutfitItems.outfitId, id));
      await tx.insert(curatedOutfitItems).values(items.map((item) => ({ outfitId: id, ...item })));
    }
  });
  return (await listCuratedOutfits(true)).find((outfit) => outfit.id === id);
}

type GenerationLogInput = { requestId: string; retryOfRequestId?: string | null; retryCount?: number; userImageUrl: string; poseId: number; style: string; productIds: number[]; backgroundId: number; provider: string; visitorId?: string; releaseMode?: "PRIVATE" | "BETA_PUBLIC" | "REDEEM_CODE"; source?: "wechat_moments" | "direct" | "admin_test"; generationMode?: "AI_FITTING" | "QUICK_FIT"; tryOnMode?: "my_photo" | "ai_body_model" | "quick_fit"; bodyModelId?: number | null; };

export async function getGenerationLog(requestId: string) {
  const db = await getDb();
  if (!db) throw new Error("The generation log service is temporarily unavailable.");
  return (await db.select().from(generationLogs).where(eq(generationLogs.requestId, requestId)).limit(1))[0];
}

export async function createGenerationLog(input: GenerationLogInput) {
  const db = await getDb();
  if (!db) throw new Error("The generation log service is temporarily unavailable.");
  const existing = await getGenerationLog(input.requestId);
  if (existing) return { log: existing, created: false };
  await db.insert(generationLogs).values({ ...input, visitorId: input.visitorId ?? "legacy", releaseMode: input.releaseMode ?? "PRIVATE", source: input.source ?? "direct", tryOnMode: input.tryOnMode ?? "my_photo", bodyModelId: input.bodyModelId ?? null, retryOfRequestId: input.retryOfRequestId ?? null, retryCount: input.retryCount ?? 0, status: "preparing" });
  const log = await getGenerationLog(input.requestId);
  if (!log) throw new Error("Unable to create a generation log.");
  return { log, created: true };
}

export async function markGenerationLogGenerating(requestId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(generationLogs).set({ status: "generating" }).where(eq(generationLogs.requestId, requestId));
}

export async function completeGenerationLog(input: { requestId: string; status: "completed" | "fallback" | "failed"; resultImageUrl?: string | null; errorMessage?: string | null; durationMs: number; validation: import("../shared/generationValidation").GenerationValidationResult }) {
  const db = await getDb();
  if (!db) return;
  await db.update(generationLogs).set({ status: input.status, resultImageUrl: input.resultImageUrl ?? null, errorMessage: input.errorMessage ?? null, durationMs: input.durationMs, validationStatus: input.validation.status, garmentPreservationScore: input.validation.garmentPreservationScore, identityPreservationScore: input.validation.identityPreservationScore, overallQualityScore: input.validation.overallQualityScore, validationDetails: input.validation.details, completedAt: new Date() }).where(eq(generationLogs.requestId, input.requestId));
}

export async function getGenerationPerformance() {
  const db = await getDb();
  if (!db) return { completedCount: 0, averageDurationMs: null as number | null, failureCount: 0 };
  const rows = await db.select({ status: generationLogs.status, durationMs: generationLogs.durationMs }).from(generationLogs);
  const completed = rows.filter((row) => (row.status === "completed" || row.status === "fallback") && row.durationMs !== null);
  const averageDurationMs = completed.length ? Math.round(completed.reduce((sum, row) => sum + (row.durationMs ?? 0), 0) / completed.length) : null;
  return { completedCount: completed.length, averageDurationMs, failureCount: rows.filter((row) => row.status === "failed").length };
}

export async function createGeneration(input: { userId: number; userPhotoUrl: string; poseId: number; backgroundId: number; topProductId?: number | null; bottomProductId?: number | null; outerProductId?: number | null; dressProductId?: number | null; lookCode: string; }) {
  const db = await getDb();
  if (!db) throw new Error("The gallery is temporarily unavailable.");
  const result = await db.insert(generations).values({ ...input, status: "created" });
  return Number(result[0].insertId);
}

export async function getGenerationForUser(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const generation = (await db.select().from(generations).where(eq(generations.id, id)).limit(1))[0];
  if (!generation || generation.userId !== userId) return undefined;
  const ids = [generation.topProductId, generation.bottomProductId, generation.outerProductId, generation.dressProductId].filter((item): item is number => item !== null);
  const pickedProducts = ids.length ? await db.select().from(products).where(inArray(products.id, ids)) : [];
  const [pose] = await db.select().from(poses).where(eq(poses.id, generation.poseId)).limit(1);
  const [background] = await db.select().from(backgrounds).where(eq(backgrounds.id, generation.backgroundId)).limit(1);
  return { generation, products: pickedProducts, pose, background };
}

export async function listGenerationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generations).where(eq(generations.userId, userId)).orderBy(desc(generations.createdAt));
}

export async function saveGeneration(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("The gallery is temporarily unavailable.");
  await db.update(generations).set({ isSaved: 1 }).where(sql`${generations.id} = ${id} AND ${generations.userId} = ${userId}`);
}

export async function updateGenerationResult(id: number, userId: number, resultImageUrl: string, status: "complete" | "failed" = "complete") {
  const db = await getDb();
  if (!db) throw new Error("The generation service is temporarily unavailable.");
  await db.update(generations).set({ resultImageUrl, status }).where(sql`${generations.id} = ${id} AND ${generations.userId} = ${userId}`);
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) throw new Error("The admin dashboard is temporarily unavailable.");
  const [[{ productCount }], [{ generationCount }], [{ savedCount }]] = await Promise.all([
    db.select({ productCount: count() }).from(products),
    db.select({ generationCount: count() }).from(generations),
    db.select({ savedCount: count() }).from(generations).where(eq(generations.isSaved, 1)),
  ]);
  return { productCount, generationCount, savedCount };
}

export async function createAdminProduct(input: Omit<typeof products.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("The admin dashboard is temporarily unavailable.");
  await db.insert(products).values(input);
}

export async function updateAdminProduct(id: number, input: Partial<Omit<typeof products.$inferInsert, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("The admin dashboard is temporarily unavailable.");
  await db.update(products).set(input).where(eq(products.id, id));
}

export async function deleteAdminProduct(id: number) {
  return deleteAdminProducts([id]);
}

export async function deleteAdminProducts(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("The admin dashboard is temporarily unavailable.");
  const uniqueIds = Array.from(new Set(ids));
  if (!uniqueIds.length) return { deletedCount: 0 };
  const existing = await db.select({ id: products.id }).from(products).where(inArray(products.id, uniqueIds));
  const existingIds = existing.map((item) => item.id);
  if (!existingIds.length) return { deletedCount: 0 };
  await db.transaction(async (tx) => {
    await tx.update(generations).set({ topProductId: null }).where(inArray(generations.topProductId, existingIds));
    await tx.update(generations).set({ bottomProductId: null }).where(inArray(generations.bottomProductId, existingIds));
    await tx.update(generations).set({ outerProductId: null }).where(inArray(generations.outerProductId, existingIds));
    await tx.update(generations).set({ dressProductId: null }).where(inArray(generations.dressProductId, existingIds));
    await tx.update(stylistFeedback).set({ anchorProductId: null }).where(inArray(stylistFeedback.anchorProductId, existingIds));
    await tx.delete(curatedOutfitItems).where(inArray(curatedOutfitItems.productId, existingIds));
    await tx.delete(products).where(inArray(products.id, existingIds));
    await tx.insert(releaseSettings).values({ id: 1, catalogInitialized: 1 }).onDuplicateKeyUpdate({ set: { catalogInitialized: 1 } });
  });
  return { deletedCount: existingIds.length };
}

export async function deleteAllAdminProducts() {
  const db = await getDb();
  if (!db) throw new Error("The admin dashboard is temporarily unavailable.");
  const rows = await db.select({ id: products.id }).from(products);
  return deleteAdminProducts(rows.map((item) => item.id));
}
