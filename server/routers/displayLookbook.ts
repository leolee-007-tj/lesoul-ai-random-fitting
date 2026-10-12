import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { displayLookbookImages } from "../../drizzle/schema";
import { getCatalog, getDb } from "../db";
import { generateImage } from "../_core/imageGeneration";
import { ownerProcedure, router, storeDisplayProcedure } from "../_core/trpc";

const sceneTypes = [
  { type: "studio_front" as const, description: "clean studio front full-body fashion look" },
  { type: "studio_side" as const, description: "clean studio three-quarter side fashion look" },
  { type: "studio_full" as const, description: "full-body editorial studio look with the garment clearly visible" },
  { type: "store_work" as const, description: "a natural Dongdaemun boutique employee organizing a clothing rack while wearing the garment" },
  { type: "store_customer" as const, description: "a natural Dongdaemun boutique employee helping a customer while wearing the garment" },
  { type: "store_walk" as const, description: "a natural Dongdaemun boutique employee walking through a small clothing store while wearing the garment" },
];

const dongdaemunActions = [
  "hanging the garment neatly on a rack", "counting cash at the store counter", "checking a mobile calculator beside the counter", "welcoming a customer with a small bow", "helping a customer compare two garments", "taking a fitting photo in front of the customer with a confident pose", "checking the garment hem and sleeve in a mirror", "carrying a small stack of folded clothes", "steaming or smoothing the garment before display", "walking between tightly packed clothing racks",
];
const dongdaemunSettings = [
  "near the entrance in soft morning light", "beside a wall of neutral clothing racks", "at a compact checkout counter", "in a narrow Dongdaemun wholesale aisle", "near a full-length fitting mirror", "beside a neatly arranged color rack", "in a realistic afternoon store rush", "in a quiet moment before opening", "under warm boutique ceiling lights", "with subtle boxes and garment rails in the background",
];
const dongdaemunScenePrompts = dongdaemunActions.flatMap((action, actionIndex) => dongdaemunSettings.map((setting, settingIndex) => ({
  type: actionIndex === 1 || actionIndex === 2 ? "store_customer" as const : actionIndex === 5 ? "studio_front" as const : actionIndex % 3 === 0 ? "store_work" as const : "store_walk" as const,
  description: `${action}, ${setting}; natural candid Dongdaemun wholesale fashion-store moment, variation ${actionIndex * 10 + settingIndex + 1}`,
})));
const hairLengthInput = z.enum(["short", "medium", "long"]).default("medium");
const modelProfileInput = z.object({ hairLength: hairLengthInput }).default({ hairLength: "medium" });
type ModelProfile = { hairLength: "short" | "medium" | "long" };
function modelProfileDescription(profile: ModelProfile) {
  const hair = profile.hairLength === "short" ? "short black hair" : profile.hairLength === "long" ? "long black hair" : "medium-length black hair";
  return `one adult East Asian Korean female Dongdaemun boutique employee, fixed height 165 cm, ${hair}, a natural body shape and proportions that suit the supplied clothing, healthy realistic appearance`;
}

const presentationStyleInput = z.enum(["korean_staff", "western_model"]).default("western_model");
const generateInput = z.object({ productId: z.number().int().positive() });
const generateBatchInput = generateInput.extend({ presentationStyle: presentationStyleInput, modelProfile: modelProfileInput, count: z.number().int().min(1).max(10).default(10) });
const generateOutfitInput = z.object({ presentationStyle: presentationStyleInput, modelProfile: modelProfileInput, productIds: z.array(z.number().int().positive()).min(1).max(3), count: z.number().int().min(1).max(10).default(3) });
const outfitPlanInput = z.object({ mode: z.enum(["separates", "dress", "top", "bottom", "outer", "top_bottom", "top_outer", "bottom_outer", "top_bottom_outer", "dress_outer"]).default("top_bottom_outer") });
const imageIdInput = z.object({ id: z.number().int().positive() });
type LookbookProgress = { status: "idle" | "generating" | "completed" | "failed"; completed: number; failed: number; total: number; percent: number; batchId?: string; lastError?: string };
const progressByProduct = new Map<number, LookbookProgress>();

type OutfitGroup = "top" | "bottom" | "outer" | "dress" | "other";
function productImage(product: any) { return product.imageViews?.front?.studioCut || product.imageViews?.front?.original || product.imageUrl; }
function publicOrigin(req: { headers: Record<string, string | string[] | undefined>; protocol?: string }) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const hostValue = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.headers.host;
  const host = hostValue ? String(hostValue) : null;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = String(Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol || "https").split(",")[0].trim();
  return host ? `${protocol}://${host.split(",")[0].trim()}` : null;
}
function absoluteImageUrl(url: string, origin: string | null) {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && origin) return new URL(url, origin).toString();
  throw new Error("PRODUCT_IMAGE_URL_NOT_PUBLIC");
}
function outfitGroup(product: any): OutfitGroup {
  const text = [product.category, product.productType, product.displayCategory?.name, product.displayCategory?.nameKo, product.displayCategory?.nameEn, product.name].filter(Boolean).join(" ").toLowerCase();
  if (/dress|원피스|连衣裙/.test(text)) return "dress";
  if (/outer|coat|jacket|cardigan|외투|아우터|코트|재킷|자켓|外套/.test(text)) return "outer";
  if (/bottom|skirt|pants|하의|치마|바지|裙|裤/.test(text)) return "bottom";
  if (/top|shirt|blouse|상의|나시|티셔츠|셔츠|上衣|衬衫/.test(text)) return "top";
  return "other";
}
function randomItem<T>(items: T[]) { return items[Math.floor(Math.random() * items.length)]; }
function makeOutfitPlan(products: any[], mode: "separates" | "dress" | "top" | "bottom" | "outer" | "top_bottom" | "top_outer" | "bottom_outer" | "top_bottom_outer" | "dress_outer") {
  const groups = new Map<OutfitGroup, any[]>();
  for (const product of products) {
    const group = outfitGroup(product);
    groups.set(group, [...(groups.get(group) ?? []), product]);
  }
  const normalizedMode = mode === "separates" ? "top_bottom_outer" : mode;
  if (normalizedMode === "dress" || normalizedMode === "dress_outer") {
    const dress = randomItem(groups.get("dress") ?? []);
    if (!dress) throw new Error("OUTFIT_DRESS_REQUIRED");
    const outer = normalizedMode === "dress_outer" ? randomItem(groups.get("outer") ?? []) : null;
    if (normalizedMode === "dress_outer" && !outer) throw new Error("OUTFIT_OUTER_REQUIRED");
    return [dress, ...(outer ? [outer] : [])];
  }
  const required = normalizedMode.split("_");
  const pieces = required.map((group) => { const items = groups.get(group as OutfitGroup) ?? []; if (!items.length) throw new Error(`OUTFIT_${group.toUpperCase()}_REQUIRED`); return randomItem(items); });
  return pieces;
}
function outfitLabel(products: any[]) { return products.map((product) => product.name || product.nameKo || product.nameEn || `#${product.id}`).join(" + "); }
function buildPrompt(product: any, sceneDescription: string, index: number, presentationStyle: "korean_staff" | "western_model", modelProfile: ModelProfile) {
  const garment = [product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details].filter(Boolean).join(", ");
  return ["Create a premium, natural-looking fashion editorial photograph for a store display showroom.", presentationStyle === "korean_staff" ? `Show ${modelProfileDescription(modelProfile)} wearing the exact supplied garment reference in a Dongdaemun wholesale fashion store.` : "Show an adult Western fashion model wearing the exact supplied garment reference.", `Garment information: ${garment || "fashion garment"}.`, `Scene ${index + 1}: ${sceneDescription}.`, "Preserve the garment's exact color, silhouette, hemline, neckline, sleeves, texture, construction, and visible details from the reference image.", "Use a believable small Korean Dongdaemun wholesale boutique for store scenes, with natural daylight, realistic proportions, and an unstaged candid feeling.", "No text, no watermark, no visible brand logo added by the model, no collage, no duplicated people, no cropped garment, and keep the complete outfit visible whenever possible."].join(" ");
}
function buildOutfitPrompt(products: any[], sceneDescription: string, index: number, presentationStyle: "korean_staff" | "western_model", modelProfile: ModelProfile) {
  const garmentList = products.map((product, pieceIndex) => `Piece ${pieceIndex + 1}: ${[product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details].filter(Boolean).join(", ") || "registered garment"}`).join(". ");
  return ["Create a premium, natural-looking fashion editorial photograph for a store display showroom.", presentationStyle === "korean_staff" ? `Show ${modelProfileDescription(modelProfile)} wearing the complete coordinated outfit made only from the supplied garment references.` : "Show one adult Western fashion model wearing the complete coordinated outfit made only from the supplied garment references.",, garmentList, `Scene ${index + 1}: ${sceneDescription}.`, "Keep every supplied garment as a separate, correctly layered piece: top with bottom, and outerwear over the outfit when provided. Preserve each garment's exact color, silhouette, hemline, neckline, sleeves, texture, construction, and visible details. Do not substitute, merge, redesign, recolor, or invent any garment.", "Use a believable small Korean Dongdaemun wholesale boutique for store scenes, with natural daylight, realistic proportions, and an unstaged candid feeling.", "No text, no watermark, no collage, no duplicated people, no cropped garment, and keep the complete coordinated outfit visible whenever possible."].join(" ");
}

async function generateBatch(productId: number, requestedCount: number, presentationStyle: "korean_staff" | "western_model", modelProfile: ModelProfile, origin: string | null) {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.id === productId);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  const originalPath = productImage(product);
  if (!originalPath) throw new Error("PRODUCT_IMAGE_REQUIRED");
  const originalUrl = absoluteImageUrl(originalPath, origin);
  const batchId = `LOOKBOOK_${productId}_${crypto.randomUUID()}`;
  const startedAt = Date.now();
  progressByProduct.set(productId, { status: "generating", completed: 0, failed: 0, total: requestedCount, percent: 0, batchId });
  const selectedScenes = presentationStyle === "korean_staff" ? dongdaemunScenePrompts : sceneTypes;
  const rows: Array<{ productId: number; compositionLabel: string; batchId: string; shotIndex: number; sceneType: typeof sceneTypes[number]["type"]; sceneDescription: string; imageUrl: string; storageKey: string; isApproved: number; isActive: number }> = [];
  for (const index of Array.from({ length: requestedCount }, (_, value) => value)) {
    const scene = presentationStyle === "korean_staff" ? randomItem(selectedScenes) : selectedScenes[index % selectedScenes.length];
    try {
      const result = await generateImage({ prompt: buildPrompt(product, scene.description, index, presentationStyle, modelProfile), originalImages: [{ url: originalUrl, mimeType: "image/jpeg" }], model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/products/${productId}/${batchId}/shot-${String(index + 1).padStart(2, "0")}.png` });
      if (typeof result.url !== "string" || typeof result.key !== "string") throw new Error("IMAGE_RESULT_INVALID");
      rows.push({ productId, compositionLabel: product.name || product.nameKo || product.nameEn || `#${product.id}`, batchId, shotIndex: index + 1, sceneType: scene.type, sceneDescription: scene.description, imageUrl: result.url, storageKey: result.key, isApproved: 0, isActive: 1 });
    } catch (error) {
      const lastError = error instanceof Error ? error.message : String(error);
      const current = progressByProduct.get(productId)!;
      console.error(`[display-lookbook] shot ${index + 1} failed for product ${productId}: ${lastError}`);
      progressByProduct.set(productId, { ...current, lastError, failed: current.failed + 1, completed: current.completed + 1, percent: Math.round(((current.completed + 1) / current.total) * 100) });
      continue;
    }
    const current = progressByProduct.get(productId)!;
    progressByProduct.set(productId, { ...current, completed: current.completed + 1, percent: Math.round(((current.completed + 1) / current.total) * 100) });
  }
  if (rows.length) {
    await db.insert(displayLookbookImages).values(rows);
    await db.update(displayLookbookImages).set({ isActive: 0, isApproved: 0 }).where(and(eq(displayLookbookImages.productId, productId), ne(displayLookbookImages.batchId, batchId)));
  }
  const current = progressByProduct.get(productId)!;
  progressByProduct.set(productId, { ...current, status: rows.length ? "completed" : "failed", percent: 100 });
  if (!rows.length) throw new Error(current.lastError || "ALL_LOOKBOOK_IMAGES_FAILED");
  return { batchId, productId, generated: rows.length, requested: requestedCount, durationMs: Date.now() - startedAt, images: rows };
}

async function generateOutfitBatch(productIds: number[], requestedCount: number, presentationStyle: "korean_staff" | "western_model", modelProfile: ModelProfile, origin: string | null) {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const catalog = await getCatalog();
  const products = productIds.map((id) => catalog.products.find((item) => item.id === id)).filter(Boolean) as any[];
  if (products.length !== productIds.length) throw new Error("PRODUCT_NOT_FOUND");
  const sources = products.map((product) => productImage(product)).filter(Boolean).map((url) => absoluteImageUrl(url, origin));
  if (sources.length !== products.length) throw new Error("PRODUCT_IMAGE_REQUIRED");
  const anchor = products[0];
  const batchId = `LOOKBOOK_OUTFIT_${anchor.id}_${crypto.randomUUID()}`;
  const label = outfitLabel(products);
  progressByProduct.set(anchor.id, { status: "generating", completed: 0, failed: 0, total: requestedCount, percent: 0, batchId });
  const selectedScenes = presentationStyle === "korean_staff" ? dongdaemunScenePrompts : sceneTypes;
  const rows: Array<{ productId: number; compositionProductIds: number[]; compositionLabel: string; batchId: string; shotIndex: number; sceneType: typeof sceneTypes[number]["type"]; sceneDescription: string; imageUrl: string; storageKey: string; isApproved: number; isActive: number }> = [];
  for (const index of Array.from({ length: requestedCount }, (_, value) => value)) {
    const scene = presentationStyle === "korean_staff" ? randomItem(selectedScenes) : selectedScenes[index % selectedScenes.length];
    try {
      const result = await generateImage({ prompt: buildOutfitPrompt(products, scene.description, index, presentationStyle, modelProfile), originalImages: sources.map((url) => ({ url, mimeType: "image/jpeg" })), model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/outfits/${batchId}/shot-${String(index + 1).padStart(2, "0")}.png` });
      if (typeof result.url !== "string" || typeof result.key !== "string") throw new Error("IMAGE_RESULT_INVALID");
      rows.push({ productId: anchor.id, compositionProductIds: productIds, compositionLabel: label, batchId, shotIndex: index + 1, sceneType: scene.type, sceneDescription: scene.description, imageUrl: result.url, storageKey: result.key, isApproved: 0, isActive: 1 });
    } catch (error) {
      const lastError = error instanceof Error ? error.message : String(error);
      const current = progressByProduct.get(anchor.id)!;
      console.error(`[display-lookbook] outfit shot ${index + 1} failed for ${label}: ${lastError}`);
      progressByProduct.set(anchor.id, { ...current, lastError, failed: current.failed + 1, completed: current.completed + 1, percent: Math.round(((current.completed + 1) / current.total) * 100) });
      continue;
    }
    const current = progressByProduct.get(anchor.id)!;
    progressByProduct.set(anchor.id, { ...current, completed: current.completed + 1, percent: Math.round(((current.completed + 1) / current.total) * 100) });
  }
  if (rows.length) {
    await db.insert(displayLookbookImages).values(rows);
    await db.update(displayLookbookImages).set({ isActive: 0, isApproved: 0 }).where(and(eq(displayLookbookImages.productId, anchor.id), ne(displayLookbookImages.batchId, batchId)));
  }
  const current = progressByProduct.get(anchor.id)!;
  progressByProduct.set(anchor.id, { ...current, status: rows.length ? "completed" : "failed", percent: 100 });
  if (!rows.length) throw new Error(current.lastError || "ALL_LOOKBOOK_IMAGES_FAILED");
  return { batchId, productId: anchor.id, productIds, generated: rows.length, requested: requestedCount, label, images: rows };
}

export const displayLookbookRouter = router({
  randomOutfitPlan: ownerProcedure.input(outfitPlanInput).query(async ({ input }) => {
    const catalog = await getCatalog();
    const selected = makeOutfitPlan(catalog.products, input.mode);
    return { productIds: selected.map((product) => product.id), label: outfitLabel(selected), groups: selected.map((product) => outfitGroup(product)) };
  }),
  approvedAll: storeDisplayProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(displayLookbookImages).where(and(eq(displayLookbookImages.isApproved, 1), eq(displayLookbookImages.isActive, 1))).orderBy(displayLookbookImages.productId, displayLookbookImages.shotIndex);
  }),
  approved: storeDisplayProcedure.input(generateInput).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(displayLookbookImages).where(and(eq(displayLookbookImages.productId, input.productId), eq(displayLookbookImages.isApproved, 1), eq(displayLookbookImages.isActive, 1))).orderBy(displayLookbookImages.shotIndex);
  }),
  progress: ownerProcedure.input(generateInput).query(({ input }) => progressByProduct.get(input.productId) ?? { status: "idle" as const, completed: 0, failed: 0, total: 10, percent: 0, lastError: undefined as string | undefined }),
  adminListAll: ownerProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(displayLookbookImages).where(eq(displayLookbookImages.isActive, 1)).orderBy(desc(displayLookbookImages.createdAt), displayLookbookImages.productId, displayLookbookImages.shotIndex);
  }),
  adminList: ownerProcedure.input(generateInput).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(displayLookbookImages).where(and(eq(displayLookbookImages.productId, input.productId), eq(displayLookbookImages.isActive, 1))).orderBy(desc(displayLookbookImages.createdAt), displayLookbookImages.shotIndex);
  }),
  generateBatch: ownerProcedure.input(generateBatchInput).mutation(async ({ ctx, input }) => generateBatch(input.productId, input.count, input.presentationStyle, input.modelProfile, publicOrigin(ctx.req))),
  generateOutfitBatch: ownerProcedure.input(generateOutfitInput).mutation(async ({ ctx, input }) => generateOutfitBatch(input.productIds, input.count, input.presentationStyle, input.modelProfile, publicOrigin(ctx.req))),
  approve: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("DATABASE_UNAVAILABLE"); await db.update(displayLookbookImages).set({ isApproved: 1 }).where(eq(displayLookbookImages.id, input.id)); return { success: true }; }),
  revoke: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("DATABASE_UNAVAILABLE"); await db.update(displayLookbookImages).set({ isApproved: 0 }).where(eq(displayLookbookImages.id, input.id)); return { success: true }; }),
  remove: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("DATABASE_UNAVAILABLE"); await db.update(displayLookbookImages).set({ isActive: 0, isApproved: 0 }).where(eq(displayLookbookImages.id, input.id)); return { success: true }; }),
});

export { buildPrompt, buildOutfitPrompt, makeOutfitPlan, outfitGroup };
