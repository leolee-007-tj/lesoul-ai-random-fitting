import { count, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { backgrounds, generations, InsertUser, poses, products, stylePresets, stylistFeedback, users } from "../drizzle/schema";
import { demoBackgrounds, demoPoses, demoProducts } from "./catalogSeed";
import { ENV } from "./_core/env";
import { DEFAULT_STYLE_PRESETS, type StylePresetKey } from "../shared/stylist";

let _db: ReturnType<typeof drizzle> | null = null;

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
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date(), role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user") };
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, role: values.role } });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function ensureCatalog() {
  const db = await getDb();
  if (!db) return false;
  await Promise.all(demoProducts.map((item) => db.insert(products).values(item).onDuplicateKeyUpdate({ set: {
    category: item.category, season: item.season, color: item.color, style: item.style, status: item.status,
    price: item.price, imageUrl: item.imageUrl, images: item.images, imageViews: item.imageViews, description: item.description,
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
  return true;
}

export async function getCatalog() {
  const db = await getDb();
  if (!db) throw new Error("The catalog is temporarily unavailable.");
  await ensureCatalog();
  const [catalogProducts, catalogPoses, catalogBackgrounds, catalogStylePresets] = await Promise.all([db.select().from(products), db.select().from(poses), db.select().from(backgrounds), db.select().from(stylePresets).where(eq(stylePresets.isActive, 1))]);
  return { products: catalogProducts, poses: catalogPoses, backgrounds: catalogBackgrounds, stylePresets: catalogStylePresets };
}

export async function getActiveStylistProducts() {
  const db = await getDb();
  if (!db) throw new Error("The catalog is temporarily unavailable.");
  await ensureCatalog();
  return db.select().from(products).where(eq(products.status, "in_stock"));
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
  const db = await getDb();
  if (!db) throw new Error("The admin dashboard is temporarily unavailable.");
  await db.delete(products).where(eq(products.id, id));
}
