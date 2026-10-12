import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { displayLookbookImages } from "../../drizzle/schema";
import { getCatalog, getDb } from "../db";
import { generateImage } from "../_core/imageGeneration";
import { customerProcedure, ownerProcedure, publicProcedure, router, storeDisplayProcedure } from "../_core/trpc";

const sceneTypes = [
  { type: "studio_front" as const, description: "clean studio front full-body fashion look" },
  { type: "studio_side" as const, description: "clean studio three-quarter side fashion look" },
  { type: "studio_full" as const, description: "full-body editorial studio look with the garment clearly visible" },
  { type: "store_work" as const, description: "a natural Dongdaemun boutique employee organizing a clothing rack while wearing the garment" },
  { type: "store_customer" as const, description: "a natural Dongdaemun boutique employee helping a customer while wearing the garment" },
  { type: "store_walk" as const, description: "a natural Dongdaemun boutique employee walking through a small clothing store while wearing the garment" },
];

const dongdaemunActions = [
  // Rack and display
  "hanging the selected garment on a rack", "removing the garment from a rack", "re-spacing hangers by color", "straightening a crooked hanger", "checking the shoulder shape on a hanger", "moving a garment to the front display", "matching a garment to nearby colors", "adjusting a rack height", "counting hangers on a rail", "brushing lint from a hanging garment",
  // Checkout and stock
  "counting cash at the checkout counter", "checking a mobile calculator at checkout", "writing a small stock note", "checking a customer order on a phone", "folding a receipt beside the register", "placing a paper shopping bag on the counter", "checking a barcode tag", "organizing change in the cash tray", "speaking with a nearby supplier", "marking a sold item on a clipboard",
  // Customer service
  "welcoming a customer with a small bow", "showing a customer the garment color", "helping a customer compare two garments", "pointing out the sleeve detail", "holding a garment up for a customer", "answering a customer question", "walking beside a customer through the aisle", "offering a different size", "checking the garment label with a customer", "smiling while listening to a customer",
  // Fitting and posing
  "taking a fitting photo in front of a customer", "holding a phone while the customer poses", "checking a fitting photo on the phone", "standing in front of a mirror with a confident pose", "turning slightly to show the side silhouette", "showing the back fit in a mirror", "adjusting the camera angle for a fitting photo", "giving a small styling pose to the customer", "reviewing a full-body outfit photo", "posing naturally beside the fitting mirror",
  // Garment inspection
  "checking the garment hem in a mirror", "checking the sleeve length", "checking the neckline construction", "smoothing the front panel with both hands", "checking the fabric texture closely", "looking for a loose thread", "checking the inside label", "measuring a garment with a tape measure", "comparing garment lengths on a rail", "folding the garment after inspection",
  // Crouching and organizing
  "crouching to organize a low shelf", "squatting to sort folded clothes", "sitting briefly on a low stool while folding clothes", "kneeling beside a garment box", "reaching into a low storage bin", "sorting clothes on the floor beside a rack", "tying a bundle of garments while crouching", "lifting a folded stack from a low shelf", "organizing shoe-level stock near the wall", "resting in a low crouch while checking a tag",
  // Walking and carrying
  "walking between tightly packed clothing racks", "carrying a small stack of folded clothes", "rolling a compact garment rack", "walking toward the checkout counter", "carrying a garment to the fitting mirror", "returning a hanger to the back rail", "walking past a customer with a clothing bundle", "opening a stockroom curtain with one hand", "bringing a new box from the back", "walking through the entrance while holding a garment",
  // Steaming and preparation
  "steaming the garment before display", "using a small lint roller", "preparing a garment on a tabletop", "folding tissue paper around a garment", "removing a protective cover", "checking a garment under warm lights", "placing a garment in a clear protective bag", "preparing a new arrival tag", "arranging a display mannequin nearby", "polishing a small mirror beside the display",
  // Team and store moments
  "talking quietly with another store worker", "handing a hanger to a coworker", "checking a shared inventory list", "opening the store entrance curtain", "turning on a display light", "refreshing the front rack after a customer visit", "sharing a styling idea with a coworker", "organizing a delivery pile with a coworker", "greeting a customer arriving at the entrance", "checking the aisle before the next customer",
  // Natural candid details
  "tucking loose hair behind one ear while working", "looking up from a garment as a customer arrives", "smiling naturally while holding the outfit", "pausing to check the store aisle", "stretching one arm after organizing stock", "taking a short water break beside the counter", "looking through a rack for a matching piece", "holding a garment against the body to check proportions", "standing with one hand on a rack between tasks", "finishing a task and looking toward the camera",
];
const dongdaemunSettings = [
  "inside a slightly spacious Dongdaemun wholesale fashion store with a few customers browsing, realistic afternoon activity",
  "near broad clothing aisles with several customers softly blurred in the background",
  "at a busy but believable store counter with a few shoppers waiting naturally",
  "under warm shop lights in a moderately large Dongdaemun store with garment racks and customer movement",
  "in a candid moment with a few customers browsing without blocking the full outfit",
];
const dongdaemunScenePrompts = dongdaemunActions.map((action, index) => ({
  type: index % 4 === 1 ? "store_customer" as const : index % 4 === 2 ? "studio_front" as const : index % 3 === 0 ? "store_work" as const : "store_walk" as const,
  description: `${action}, ${dongdaemunSettings[index % dongdaemunSettings.length]}; natural candid Dongdaemun wholesale fashion-store moment, action ${index + 1} of 100`,
}));
const editorialScenePrompts = [
  { type: "studio_front" as const, editorial: true, description: "a pure white seamless studio background, soft high-key lighting, full-body Western fashion magazine model composition, centered editorial pose" },
  { type: "studio_side" as const, editorial: true, description: "a clean white cyclorama background, bright softbox lighting, three-quarter side pose by an adult Western fashion magazine model" },
  { type: "studio_full" as const, editorial: true, description: "a minimal white fashion magazine set, crisp high-key light, elegant full-body Western runway editorial composition" },
];
function selectLookbookScene(presentationStyle: "korean_staff" | "western_model") {
  if (presentationStyle === "korean_staff" && Math.random() < 0.35) {
    return { scene: randomItem(editorialScenePrompts), style: "western_model" as const };
  }
  const pool = presentationStyle === "korean_staff" ? dongdaemunScenePrompts : sceneTypes;
  return { scene: randomItem(pool), style: presentationStyle };
}
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
const guestPreviewInput = z.object({ productId: z.number().int().positive(), hairLength: hairLengthInput });
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
function colorTone(value: unknown): "light" | "dark" | "mid" {
  const text = String(value ?? "").toLowerCase();
  if (/white|ivory|cream|beige|ecru|oat|butter|yellow|pink|sky|light|white|흰|아이보리|크림|베이지|연|밝|白|米|浅|奶油|浅色/.test(text)) return "light";
  if (/black|charcoal|navy|brown|chocolate|burgundy|wine|olive|khaki|dark|black|검정|블랙|차콜|네이비|브라운|버건디|와인|카키|어두|黑|藏青|棕|深色/.test(text)) return "dark";
  return "mid";
}
function missingGarmentColorDirection(product: any, catalogProducts: any[] = []) {
  const tone = colorTone(product.color);
  const category = String(product.category ?? product.productType ?? "").toLowerCase();
  const isTop = /top|상의|나시|shirt|blouse|上衣|衬衫/.test(category);
  const isBottom = /bottom|하의|바지|치마|pants|skirt|下装|裤|裙/.test(category);
  const isOuter = /outer|아우터|자켓|재킷|코트|jacket|coat|外套/.test(category);
  const candidates = catalogProducts.filter((item) => item.id !== product.id && item.color && ((isTop && /bottom|하의|바지|치마|pants|skirt|下装|裤|裙/.test(String(item.category ?? "").toLowerCase())) || (isBottom && /top|상의|나시|shirt|blouse|上衣|衬衫/.test(String(item.category ?? "").toLowerCase())) || (isOuter && /top|상의|bottom|하의|上衣|下装/.test(String(item.category ?? "").toLowerCase())))).slice(0, 4).map((item) => `${item.name || "registered item"} (${item.color})`);
  let direction = "Use balanced neutral and denim styling for the missing garments, with a wearable social-fashion look rather than random colors.";
  if (isTop && tone === "light") direction = "The supplied top is light-toned: style the missing bottom in a clearly darker color such as charcoal, black, deep navy, chocolate brown, or medium/deep blue denim; avoid a washed-out all-light outfit.";
  else if (isTop && tone === "dark") direction = "The supplied top is dark-toned: style the missing bottom in a comparatively lighter color such as light-wash blue denim, ecru, stone, light gray, or cream; avoid an unnecessarily heavy all-black outfit.";
  else if (isBottom && tone === "light") direction = "The supplied bottom is light-toned: style the missing top in a darker color such as black, charcoal, navy, chocolate, or rich denim for clear contrast.";
  else if (isBottom && tone === "dark") direction = "The supplied bottom is dark-toned: style the missing top in a comparatively lighter color such as white, cream, oatmeal, light gray, butter yellow, or light-wash denim.";
  else if (isOuter && tone === "light") direction = "The supplied outerwear is light-toned: use a darker inner top and balanced dark or medium denim bottoms so the silhouette remains defined.";
  else if (isOuter && tone === "dark") direction = "The supplied outerwear is dark-toned: use a lighter inner top and light-to-medium denim or stone bottoms to create a clean layered contrast.";
  const catalogCue = candidates.length ? `Registered complementary color cues available in this catalog: ${candidates.join(", ")}. Prefer a harmonious cue when it fits the silhouette, but do not replace or alter the supplied garment.` : "If a complementary registered garment is not available, create a simple neutral or denim companion garment.";
  return `COLOR COORDINATION FOR SINGLE-GARMENT STYLING: ${direction} Use current wearable SNS fashion styling principles such as clean neutrals, denim contrast, chocolate/burgundy accents, and one clear focal color. ${catalogCue}`;
}
function buildPrompt(product: any, sceneDescription: string, index: number, presentationStyle: "korean_staff" | "western_model", modelProfile: ModelProfile, catalogProducts: any[] = []) {
  const garment = [product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details].filter(Boolean).join(", ");
  return ["Create a premium, natural-looking fashion editorial photograph for a store display showroom.", presentationStyle === "korean_staff" ? `Show ${modelProfileDescription(modelProfile)} wearing the exact supplied garment reference in a Dongdaemun wholesale fashion store.` : "Show an adult Western fashion model wearing the exact supplied garment reference.", `Garment information: ${garment || "fashion garment"}.`, missingGarmentColorDirection(product, catalogProducts), `Scene ${index + 1}: ${sceneDescription}.`, "Preserve the garment's exact color, silhouette, hemline, neckline, sleeves, texture, construction, and visible details from the reference image.", "For store scenes use a believable Korean Dongdaemun wholesale boutique with natural daylight and candid activity; for editorial scenes use a pure white seamless studio with high-key magazine lighting.", "No text, no watermark, no visible brand logo added by the model, no collage, no duplicated people, no cropped garment, and keep the complete outfit visible whenever possible."].join(" ");
}
function buildOutfitPrompt(products: any[], sceneDescription: string, index: number, presentationStyle: "korean_staff" | "western_model", modelProfile: ModelProfile) {
  const garmentList = products.map((product, pieceIndex) => `Piece ${pieceIndex + 1}: ${[product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details].filter(Boolean).join(", ") || "registered garment"}`).join(". ");
  return ["Create a premium, natural-looking fashion editorial photograph for a store display showroom.", presentationStyle === "korean_staff" ? `Show ${modelProfileDescription(modelProfile)} wearing the complete coordinated outfit made only from the supplied garment references.` : "Show one adult Western fashion model wearing the complete coordinated outfit made only from the supplied garment references.", garmentList, `Scene ${index + 1}: ${sceneDescription}.`, "Keep every supplied garment as a separate, correctly layered piece: top with bottom, and outerwear over the outfit when provided. Preserve each garment's exact color, silhouette, hemline, neckline, sleeves, texture, construction, and visible details. Do not substitute, merge, redesign, recolor, or invent any garment.", "For store scenes use a believable Korean Dongdaemun wholesale boutique with natural daylight and candid activity; for editorial scenes use a pure white seamless studio with high-key magazine lighting.", "No text, no watermark, no collage, no duplicated people, no cropped garment, and keep the complete coordinated outfit visible whenever possible."].join(" ");
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
  const rows: Array<{ productId: number; compositionLabel: string; batchId: string; shotIndex: number; sceneType: typeof sceneTypes[number]["type"]; sceneDescription: string; imageUrl: string; storageKey: string; isApproved: number; isActive: number }> = [];
  for (const index of Array.from({ length: requestedCount }, (_, value) => value)) {
    const { scene, style: shotStyle } = selectLookbookScene(presentationStyle);
    try {
      const result = await generateImage({ prompt: buildPrompt(product, scene.description, index, shotStyle, modelProfile, catalog.products), originalImages: [{ url: originalUrl, mimeType: "image/jpeg" }], model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/products/${productId}/${batchId}/shot-${String(index + 1).padStart(2, "0")}.png` });
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
  const rows: Array<{ productId: number; compositionProductIds: number[]; compositionLabel: string; batchId: string; shotIndex: number; sceneType: typeof sceneTypes[number]["type"]; sceneDescription: string; imageUrl: string; storageKey: string; isApproved: number; isActive: number }> = [];
  for (const index of Array.from({ length: requestedCount }, (_, value) => value)) {
    const { scene, style: shotStyle } = selectLookbookScene(presentationStyle);
    try {
      const result = await generateImage({ prompt: buildOutfitPrompt(products, scene.description, index, shotStyle, modelProfile), originalImages: sources.map((url) => ({ url, mimeType: "image/jpeg" })), model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/outfits/${batchId}/shot-${String(index + 1).padStart(2, "0")}.png` });
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
  guestPreview: customerProcedure.input(guestPreviewInput).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_UNAVAILABLE");
    const catalog = await getCatalog();
    const product = catalog.products.find((item) => item.id === input.productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    const originalPath = productImage(product);
    if (!originalPath) throw new Error("PRODUCT_IMAGE_REQUIRED");
    const originalUrl = absoluteImageUrl(originalPath, publicOrigin(ctx.req));
    const hair = input.hairLength === "short" ? "short black hair" : input.hairLength === "long" ? "long black hair" : "medium-length black hair";
    const garment = [product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details].filter(Boolean).join(", ");
    const editorial = Math.random() < 0.5;
    const scene = editorial ? randomItem(editorialScenePrompts) : randomItem(dongdaemunScenePrompts);
    const modelLine = editorial ? "Show one adult Western fashion magazine model wearing the exact supplied garment reference." : `Show one adult East Asian Korean woman, fixed height 165 cm, ${hair}, with a natural body shape suited to the supplied garment, wearing the exact supplied garment reference in a Dongdaemun boutique.`;
    const batchId = `GUEST_PREVIEW_${input.productId}_${crypto.randomUUID()}`;
    const result = await generateImage({ prompt: ["Create one premium, natural fashion editorial photo for a customer preview.", modelLine, `Scene: ${scene.description}.`, `Garment information: ${garment || "registered fashion garment"}.`, missingGarmentColorDirection(product, catalog.products), "Preserve the exact color, silhouette, length, sleeves, neckline, texture, construction, and visible details. Show the complete garment clearly, with no text, logo additions, collage, or cropped clothing."].join(" "), originalImages: [{ url: originalUrl, mimeType: "image/jpeg" }], model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/previews/${input.productId}/${batchId}.png` });
    if (typeof result.url !== "string" || typeof result.key !== "string") throw new Error("IMAGE_RESULT_INVALID");
    await db.insert(displayLookbookImages).values({ productId: input.productId, compositionLabel: product.name || product.nameKo || product.nameEn || `#${product.id}`, batchId, shotIndex: 1, sceneType: scene.type, sceneDescription: scene.description, imageUrl: result.url, storageKey: result.key, isApproved: 1, isActive: 1 });
    return { imageUrl: result.url, productId: input.productId, visitorId: ctx.user?.openId ?? null, savedPublicly: true };
  }),
  randomOutfitPlan: ownerProcedure.input(outfitPlanInput).query(async ({ input }) => {
    const catalog = await getCatalog();
    const selected = makeOutfitPlan(catalog.products, input.mode);
    return { productIds: selected.map((product) => product.id), label: outfitLabel(selected), groups: selected.map((product) => outfitGroup(product)) };
  }),
  publicForProduct: publicProcedure.input(generateInput).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(displayLookbookImages).where(and(eq(displayLookbookImages.productId, input.productId), eq(displayLookbookImages.isApproved, 1), eq(displayLookbookImages.isActive, 1))).orderBy(desc(displayLookbookImages.createdAt), displayLookbookImages.shotIndex);
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
