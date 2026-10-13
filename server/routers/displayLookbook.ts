import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { displayLookbookImages } from "../../drizzle/schema";
import { getCatalog, getDb } from "../db";
import { generateImage } from "../_core/imageGeneration";
import { customerProcedure, ownerProcedure, publicProcedure, router, storeDisplayProcedure } from "../_core/trpc";
import { normaliseAvailabilityStatus } from "../../shared/productAvailability";

const editorialPosePrompts = [
  'front-facing relaxed stance with one hand at the waist',
  'front-facing stance with both hands softly clasped',
  'front-facing stance with one foot slightly forward',
  'front-facing stance with arms naturally at the sides',
  'front-facing stance with one hand touching the opposite elbow',
  'front-facing stance with a subtle shoulder tilt',
  'front-facing stance looking just past the camera',
  'front-facing stance with chin slightly raised',
  'front-facing stance with chin slightly lowered',
  'front-facing stance with hands behind the back',
  'front-facing stance holding the jacket lapel',
  'front-facing stance adjusting one cuff',
  'front-facing stance touching the neckline',
  'front-facing stance smoothing the garment front',
  'front-facing stance with one hand in a pocket',
  'front-facing stance with both hands in pockets',
  'front-facing stance holding a small neutral clutch',
  'front-facing stance with a gentle half-smile',
  'front-facing stance with a calm serious expression',
  'front-facing stance with eyes closed in a quiet editorial moment',
  'walking slowly toward the camera',
  'walking away while glancing over one shoulder',
  'walking diagonally across the frame',
  'taking a long stride with the garment in motion',
  'pausing mid-step with one heel lifted',
  'walking with one hand in a pocket',
  'walking while holding the coat open',
  'walking with the coat draped over one shoulder',
  'walking while turning the head to the side',
  'walking past the camera in profile',
  'walking with a flowing skirt captured in motion',
  'walking with a trouser hem in motion',
  'walking and adjusting a sleeve',
  'walking and touching the handbag strap',
  'walking with a relaxed runway pace',
  'walking with crossed steps like a runway model',
  'walking toward a gray studio wall',
  'walking away from a white cyclorama',
  'walking while looking down naturally',
  'walking while looking directly into the camera',
  'profile view with the body facing left',
  'profile view with the body facing right',
  'three-quarter view turning toward the camera',
  'three-quarter view turning away from the camera',
  'back view with a slight shoulder turn',
  'back view showing the garment silhouette clearly',
  'over-the-shoulder glance from the back',
  'side view adjusting the waistline',
  'side view with one hand on the hip',
  'side view with arms folded loosely',
  'leaning lightly against a white studio wall',
  'leaning lightly against a gray studio wall',
  'standing beside a minimal white plinth',
  'standing beside a minimal gray plinth',
  'sitting on a low white cube with legs angled',
  'sitting on a low gray cube with one ankle crossed',
  'sitting on a studio stool with an upright posture',
  'sitting on a studio stool turned three-quarter',
  'sitting on the floor with knees softly bent',
  'kneeling elegantly on one knee',
  'crouching gracefully to show the garment length',
  'squatting lightly with the outfit fully visible',
  'standing on a small white step',
  'standing on a small gray step',
  'resting one foot on a low plinth',
  'raising both arms slightly to show sleeve movement',
  'raising one arm above the head',
  'placing one hand behind the neck',
  'touching the hair with one hand',
  'placing both hands behind the head',
  'crossing one arm over the torso',
  'opening the arms slightly to show the outer layer',
  'holding the hem gently with both hands',
  'holding one side of the skirt for movement',
  'pulling the coat collar into a sculptural pose',
  'checking one cuff with the opposite hand',
  'adjusting a belt or waist detail',
  'adjusting a shoulder strap',
  'touching a pocket detail',
  'showing the sleeve profile with one arm extended',
  'showing the back detail with both arms relaxed',
  'showing the side seam with one hand at the hip',
  'showing the hemline with a slight pivot',
  'showing the neckline with shoulders relaxed',
  'showing fabric drape with a gentle turn',
  'dramatic high-fashion pose with one knee bent',
  'minimalist geometric pose with angular arms',
  'editorial pose with a long diagonal line',
  'editorial pose with asymmetrical shoulders',
  'editorial pose with a sculptural hand gesture',
  'quiet contemplative pose looking toward the light',
  'confident power pose with feet apart',
  'soft romantic pose with hands near the heart',
  'modern preppy pose with one knee turned inward',
  'clean quiet-luxury pose with a neutral expression',
  'playful pose with one foot lifted behind',
  'dynamic pivot with the garment moving naturally',
  'slow turn captured at three-quarter angle',
  'final runway pose centered in the frame',
  'close full-body editorial pose with the complete garment visible',
];
const studioBackgrounds = [
  "pure white seamless cyclorama, soft high-key magazine lighting",
  "light gray seamless studio backdrop, diffused editorial lighting",
  "white-to-light-gray gradient studio background, clean fashion magazine lighting",
  "matte warm-white studio wall and floor, restrained luxury editorial lighting",
  "cool pale-gray studio wall and floor, crisp softbox lighting",
];
const editorialScenePrompts = editorialPosePrompts.map((pose, index) => ({
  type: index % 3 === 0 ? "studio_front" as const : index % 3 === 1 ? "studio_side" as const : "studio_full" as const,
  editorial: true,
  description: pose + ", " + studioBackgrounds[index % studioBackgrounds.length] + ", adult Western woman fashion magazine model, complete outfit visible, pose " + (index + 1) + " of 100",
}));
const mirrorSelfiePosePrompts = [
  "standing straight facing the full-length mirror, phone held at chest height, full outfit visible",
  "three-quarter angle to the mirror, one shoulder slightly turned, phone held beside the face",
  "side-profile mirror selfie, one hand on the waist, phone held away from the garment",
  "relaxed contrapposto stance, one knee softly bent, phone held at shoulder height",
  "walking toward the mirror and pausing mid-step, phone held low so the outfit remains visible",
  "one hand adjusting the jacket lapel while the other hand holds the phone, natural reflection",
  "turning slightly away from the mirror while looking back over one shoulder, phone visible",
  "seated on a simple fitting-room bench, phone raised for a full reflection, garment unobstructed",
  "standing with one foot forward and the phone held to the side, clear front reflection",
  "checking the sleeve in the mirror, phone held in a relaxed lowered position",
  "full-body mirror selfie from a slightly lower phone angle, natural posture and complete outfit",
  "over-the-shoulder mirror selfie with the phone near the cheek, body and garment still fully visible",
];
const backgroundStyleInput = z.enum(["editorial_studio", "fitting_room_mirror"]).default("editorial_studio");
type BackgroundStyle = "editorial_studio" | "fitting_room_mirror";
function applyBackground(scene: (typeof editorialScenePrompts)[number] | undefined, backgroundStyle: BackgroundStyle, poseIndex = 0) {
  const safeScene = scene ?? editorialScenePrompts[0];
  if (!safeScene) throw new Error("LOOKBOOK_SCENE_UNAVAILABLE");
  if (backgroundStyle === "editorial_studio") return safeScene;
  const pose = mirrorSelfiePosePrompts[poseIndex % mirrorSelfiePosePrompts.length];
  return { ...safeScene, description: `${pose}, taking a natural phone photo of the outfit reflected in a full-length mirror inside a clean modern fitting room, realistic mirror reflection, phone visible in one hand, soft fitting-room lighting, no store floor or shoppers, fitting-room mirror selfie background` };
}
function persistedSceneDescription(description: string) { return description.slice(0, 600); }
function selectLookbookScene(_presentationStyle: "east_asian_female" | "western_female", backgroundStyle: BackgroundStyle = "editorial_studio") {
  const scene = randomItem(editorialScenePrompts) ?? editorialScenePrompts[0];
  return { scene: applyBackground(scene, backgroundStyle, Math.floor(Math.random() * mirrorSelfiePosePrompts.length)), style: _presentationStyle };
}
const sceneTypes = editorialScenePrompts;
const hairLengthInput = z.enum(["short", "medium", "long"]).default("medium");
const modelProfileInput = z.object({ hairLength: hairLengthInput }).default({ hairLength: "medium" });
type ModelProfile = { hairLength: "short" | "medium" | "long" };
function modelProfileDescription(profile: ModelProfile, presentationStyle: "east_asian_female" | "western_female") {
  const hair = profile.hairLength === "short" ? "short black hair" : profile.hairLength === "long" ? "long black hair" : "medium-length black hair";
  const model = presentationStyle === "east_asian_female" ? "one adult East Asian woman" : "one adult Western woman";
  return `${model}, ${hair}, natural feminine body shape and proportions that suit the supplied clothing, healthy realistic appearance`;
}

const presentationStyleInput = z.enum(["east_asian_female", "western_female"]).default("western_female");
const generateInput = z.object({ productId: z.number().int().positive() });
const lookbookMetaInput = z.object({ lookbookTitle: z.string().trim().max(200).nullable().optional(), recommendationName: z.string().trim().max(200).nullable().optional() });
const generateBatchInput = generateInput.extend(lookbookMetaInput.shape).extend({ presentationStyle: presentationStyleInput, modelProfile: modelProfileInput, backgroundStyle: backgroundStyleInput, count: z.number().int().min(1).max(10).default(10) });
const generateOutfitInput = lookbookMetaInput.extend({ presentationStyle: presentationStyleInput, modelProfile: modelProfileInput, backgroundStyle: backgroundStyleInput, productIds: z.array(z.number().int().positive()).min(1).max(3), count: z.number().int().min(1).max(10).default(3) });
const guestPreviewInput = z.object({ productId: z.number().int().positive(), hairLength: hairLengthInput, presentationStyle: presentationStyleInput, backgroundStyle: backgroundStyleInput });
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
function completeOutfitWithCatalog(selectedProducts: any[], catalogProducts: any[]) {
  const selectedGroups = new Set(selectedProducts.map(outfitGroup));
  const missingGroup: OutfitGroup | null = selectedGroups.has("outer") && selectedGroups.has("bottom") && !selectedGroups.has("top") ? "top" : selectedGroups.has("outer") && selectedGroups.has("top") && !selectedGroups.has("bottom") ? "bottom" : selectedGroups.has("top") && selectedGroups.has("bottom") && !selectedGroups.has("outer") ? "outer" : null;
  if (!missingGroup) return { products: selectedProducts, addedGroup: null as OutfitGroup | null, addedFromCatalog: false };
  const candidates = catalogProducts.filter((product) => outfitGroup(product) === missingGroup && !selectedProducts.some((selected) => selected.id === product.id) && normaliseAvailabilityStatus(product.availabilityStatus, product.status) !== "SOLD_OUT" && product.isActive !== 0 && productImage(product));
  const addition = candidates.length ? randomItem(candidates) : null;
  return addition ? { products: [...selectedProducts, addition], addedGroup: missingGroup, addedFromCatalog: true } : { products: selectedProducts, addedGroup: missingGroup, addedFromCatalog: false };
}
function missingOutfitDirection(products: any[], addedGroup: OutfitGroup | null, addedFromCatalog: boolean) {
  if (!addedGroup) return "The selected pieces already form a complete outfit; do not add another garment.";
  const outer = products.find((product) => outfitGroup(product) === "outer");
  const top = products.find((product) => outfitGroup(product) === "top");
  const bottom = products.find((product) => outfitGroup(product) === "bottom");
  const anchor = outer || top || bottom;
  const tone = colorTone(anchor?.color);
  const color = tone === "dark" ? "a lighter neutral, cream, white, light gray, or light-wash denim" : tone === "light" ? "a darker neutral, charcoal, navy, black, chocolate, or deep denim" : "a balanced neutral or medium denim";
  const source = addedFromCatalog ? "Use the added registered store garment reference exactly as supplied." : "If no registered store garment reference is available, create only a simple unbranded companion garment";
  return `COMPLETE THE PARTIAL OUTFIT: add the missing ${addedGroup} layer so the look is a complete womenswear outfit. ${source} Choose ${color} for clear contrast with the selected pieces, following clean SNS fashion styling. Never alter, recolor, replace, or remove any user-selected garment.`;
}
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
function buildPrompt(product: any, sceneDescription: string, index: number, presentationStyle: "east_asian_female" | "western_female", modelProfile: ModelProfile, catalogProducts: any[] = [], backgroundStyle: BackgroundStyle = "editorial_studio") {
  const garment = [product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details].filter(Boolean).join(", ");
  return ["Create a premium, natural-looking fashion editorial photograph for a store display showroom.", presentationStyle === "east_asian_female" ? `Show ${modelProfileDescription(modelProfile, presentationStyle)} wearing the exact supplied garment reference.` : "Show an adult Western fashion model wearing the exact supplied garment reference.", `Garment information: ${garment || "fashion garment"}.`, product.lookbookPrompt ? `OWNER GARMENT NOTES (follow these factual notes exactly): ${product.lookbookPrompt}.` : "", missingGarmentColorDirection(product, catalogProducts), backgroundStyle === "fitting_room_mirror" ? "Use the selected fitting-room mirror selfie background: a clean modern fitting room, full-length mirror reflection, phone visible in one hand, realistic mirror perspective, no shop floor or shoppers." : "Use the selected white/gray Western fashion magazine studio background only.", `Scene ${index + 1}: ${sceneDescription}.`, "Preserve the garment's exact color, silhouette, hemline, neckline, sleeves, texture, construction, and visible details from the reference image.", "Use only a clean white, light-gray, or soft neutral studio background with professional Western fashion-magazine lighting; never use a shop, boutique, street, checkout, rack, or workplace setting.", "No text, no watermark, no visible brand logo added by the model, no collage, no duplicated people, no cropped garment, and keep the complete outfit visible whenever possible."].join(" ");
}
function buildOutfitPrompt(products: any[], sceneDescription: string, index: number, presentationStyle: "east_asian_female" | "western_female", modelProfile: ModelProfile, backgroundStyle: BackgroundStyle = "editorial_studio", addedGroup: OutfitGroup | null = null, addedFromCatalog = false) {
  const garmentList = products.map((product, pieceIndex) => `Piece ${pieceIndex + 1}: ${[product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details].filter(Boolean).join(", ") || "registered garment"}`).join(". ");
  return ["Create a premium, natural-looking fashion editorial photograph for a store display showroom.", presentationStyle === "east_asian_female" ? `Show ${modelProfileDescription(modelProfile, presentationStyle)} wearing the complete coordinated outfit made only from the supplied garment references.` : "Show one adult Western woman wearing the complete coordinated outfit made only from the supplied garment references.", garmentList, products.map((product) => product.lookbookPrompt ? `Owner notes for ${product.name || "garment"}: ${product.lookbookPrompt}.` : "").filter(Boolean).join(" "), missingOutfitDirection(products, addedGroup, addedFromCatalog), backgroundStyle === "fitting_room_mirror" ? "Use the selected fitting-room mirror selfie background: a clean modern fitting room, full-length mirror reflection, phone visible in one hand, realistic mirror perspective, no shop floor or shoppers." : "Use the selected white/gray Western fashion magazine studio background only.", `Scene ${index + 1}: ${sceneDescription}.`, "Keep every supplied garment as a separate, correctly layered piece: top with bottom, and outerwear over the outfit when provided. Preserve each garment's exact color, silhouette, hemline, neckline, sleeves, texture, construction, and visible details. Do not substitute, merge, redesign, recolor, or invent any garment.", "Use only a clean white, light-gray, or soft neutral studio background with professional Western fashion-magazine lighting; never use a shop, boutique, street, checkout, rack, or workplace setting.", "No text, no watermark, no collage, no duplicated people, no cropped garment, and keep the complete coordinated outfit visible whenever possible."].join(" ");
}

async function generateBatch(productId: number, requestedCount: number, presentationStyle: "east_asian_female" | "western_female", modelProfile: ModelProfile, backgroundStyle: BackgroundStyle, origin: string | null, lookbookTitle: string | null = null, recommendationName: string | null = null) {
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
  const rows: Array<{ productId: number; compositionLabel: string; batchId: string; shotIndex: number; sceneType: typeof sceneTypes[number]["type"]; sceneDescription: string; lookbookTitle: string | null; recommendationName: string | null; imageUrl: string; storageKey: string; isApproved: number; isActive: number }> = [];
  for (const index of Array.from({ length: requestedCount }, (_, value) => value)) {
    const { scene, style: shotStyle } = selectLookbookScene(presentationStyle, backgroundStyle);
    try {
      const result = await generateImage({ prompt: buildPrompt(product, scene.description, index, shotStyle, modelProfile, catalog.products, backgroundStyle), originalImages: [{ url: originalUrl, mimeType: "image/jpeg" }], model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/products/${productId}/${batchId}/shot-${String(index + 1).padStart(2, "0")}.png` });
      if (typeof result.url !== "string" || typeof result.key !== "string") throw new Error("IMAGE_RESULT_INVALID");
      rows.push({ productId, compositionLabel: product.name || product.nameKo || product.nameEn || `#${product.id}`, batchId, shotIndex: index + 1, sceneType: scene.type, sceneDescription: persistedSceneDescription(scene.description), lookbookTitle, recommendationName, imageUrl: result.url, storageKey: result.key, isApproved: 0, isActive: 1 });
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

async function generateOutfitBatch(productIds: number[], requestedCount: number, presentationStyle: "east_asian_female" | "western_female", modelProfile: ModelProfile, backgroundStyle: BackgroundStyle, origin: string | null, lookbookTitle: string | null = null, recommendationName: string | null = null) {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const catalog = await getCatalog();
  const selectedProducts = productIds.map((id) => catalog.products.find((item) => item.id === id)).filter(Boolean) as any[];
  if (selectedProducts.length !== productIds.length) throw new Error("PRODUCT_NOT_FOUND");
  if (selectedProducts.some((product) => normaliseAvailabilityStatus(product.availabilityStatus, product.status) === "SOLD_OUT")) throw new Error("PRODUCT_SOLD_OUT");
  const completed = completeOutfitWithCatalog(selectedProducts, catalog.products);
  const products = completed.products;
  const sources = products.map((product) => productImage(product)).filter(Boolean).map((url) => absoluteImageUrl(url, origin));
  if (sources.length !== products.length) throw new Error("PRODUCT_IMAGE_REQUIRED");
  const anchor = selectedProducts[0];
  const batchId = `LOOKBOOK_OUTFIT_${anchor.id}_${crypto.randomUUID()}`;
  const label = outfitLabel(products);
  progressByProduct.set(anchor.id, { status: "generating", completed: 0, failed: 0, total: requestedCount, percent: 0, batchId });
  const rows: Array<{ productId: number; compositionProductIds: number[]; compositionLabel: string; batchId: string; shotIndex: number; sceneType: typeof sceneTypes[number]["type"]; sceneDescription: string; lookbookTitle: string | null; recommendationName: string | null; imageUrl: string; storageKey: string; isApproved: number; isActive: number }> = [];
  for (const index of Array.from({ length: requestedCount }, (_, value) => value)) {
    const { scene, style: shotStyle } = selectLookbookScene(presentationStyle, backgroundStyle);
    try {
      const result = await generateImage({ prompt: buildOutfitPrompt(products, scene.description, index, shotStyle, modelProfile, backgroundStyle, completed.addedGroup, completed.addedFromCatalog), originalImages: sources.map((url) => ({ url, mimeType: "image/jpeg" })), model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/outfits/${batchId}/shot-${String(index + 1).padStart(2, "0")}.png` });
      if (typeof result.url !== "string" || typeof result.key !== "string") throw new Error("IMAGE_RESULT_INVALID");
      rows.push({ productId: anchor.id, compositionProductIds: products.map((product) => product.id), compositionLabel: label, batchId, shotIndex: index + 1, sceneType: scene.type, sceneDescription: persistedSceneDescription(scene.description), lookbookTitle, recommendationName, imageUrl: result.url, storageKey: result.key, isApproved: 0, isActive: 1 });
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
  return { batchId, productId: anchor.id, productIds: products.map((product) => product.id), generated: rows.length, requested: requestedCount, label, images: rows };
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
    const scene = applyBackground(randomItem(editorialScenePrompts) ?? editorialScenePrompts[0], input.backgroundStyle, Math.floor(Math.random() * mirrorSelfiePosePrompts.length));
    const modelLine = `${input.presentationStyle === "east_asian_female" ? "Show one adult East Asian woman" : "Show one adult Western woman"} with ${hair} wearing the exact supplied garment reference.`;
    const batchId = `GUEST_PREVIEW_${input.productId}_${crypto.randomUUID()}`;
    const result = await generateImage({ prompt: ["Create one premium, natural fashion editorial photo for a customer preview.", modelLine, `Scene: ${scene.description}.`, `Garment information: ${garment || "registered fashion garment"}.`, product.lookbookPrompt ? `OWNER GARMENT NOTES (follow these factual notes exactly): ${product.lookbookPrompt}.` : "", missingGarmentColorDirection(product, catalog.products), "Preserve the exact color, silhouette, length, sleeves, neckline, texture, construction, and visible details. Show the complete garment clearly, with no text, logo additions, collage, or cropped clothing."].join(" "), originalImages: [{ url: originalUrl, mimeType: "image/jpeg" }], model: "MODEL_GPT_IMAGE_2", quality: "medium", storageKey: `display-lookbook/previews/${input.productId}/${batchId}.png` });
    if (typeof result.url !== "string" || typeof result.key !== "string") throw new Error("IMAGE_RESULT_INVALID");
    await db.insert(displayLookbookImages).values({ productId: input.productId, compositionLabel: product.name || product.nameKo || product.nameEn || `#${product.id}`, batchId, shotIndex: 1, sceneType: scene.type, sceneDescription: persistedSceneDescription(scene.description), imageUrl: result.url, storageKey: result.key, isApproved: 1, isActive: 1 });
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
  generateBatch: ownerProcedure.input(generateBatchInput).mutation(async ({ ctx, input }) => generateBatch(input.productId, input.count, input.presentationStyle, input.modelProfile, input.backgroundStyle, publicOrigin(ctx.req), input.lookbookTitle ?? null, input.recommendationName ?? null)),
  generateOutfitBatch: ownerProcedure.input(generateOutfitInput).mutation(async ({ ctx, input }) => generateOutfitBatch(input.productIds, input.count, input.presentationStyle, input.modelProfile, input.backgroundStyle, publicOrigin(ctx.req), input.lookbookTitle ?? null, input.recommendationName ?? null)),
  approve: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("DATABASE_UNAVAILABLE"); await db.update(displayLookbookImages).set({ isApproved: 1 }).where(eq(displayLookbookImages.id, input.id)); return { success: true }; }),
  revoke: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("DATABASE_UNAVAILABLE"); await db.update(displayLookbookImages).set({ isApproved: 0 }).where(eq(displayLookbookImages.id, input.id)); return { success: true }; }),
  remove: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("DATABASE_UNAVAILABLE"); await db.update(displayLookbookImages).set({ isActive: 0, isApproved: 0 }).where(eq(displayLookbookImages.id, input.id)); return { success: true }; }),
});

export { buildPrompt, buildOutfitPrompt, makeOutfitPlan, outfitGroup };
