import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { displayLookbookImages, products } from "../../drizzle/schema";
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

const generateInput = z.object({ productId: z.number().int().positive() });
const imageIdInput = z.object({ id: z.number().int().positive() });

function productImage(product: any) {
  return product.imageViews?.front?.original || product.imageUrl;
}

function buildPrompt(product: any, sceneDescription: string, index: number) {
  const garment = [product.brand, product.name, product.color, product.style, product.fabric, product.fit, product.details]
    .filter(Boolean)
    .join(", ");
  return [
    "Create a premium, natural-looking fashion editorial photograph for a store display showroom.",
    "Show an adult Western fashion model wearing the exact supplied garment reference.",
    `Garment information: ${garment || "fashion garment"}.`,
    `Scene ${index + 1}: ${sceneDescription}.`,
    "Preserve the garment's exact color, silhouette, hemline, neckline, sleeves, texture, construction, and visible details from the reference image.",
    "Use a believable small Korean Dongdaemun wholesale boutique for store scenes, with natural daylight, realistic proportions, and an unstaged candid feeling.",
    "No text, no watermark, no visible brand logo added by the model, no collage, no duplicated people, no cropped garment, and keep the complete outfit visible whenever possible.",
  ].join(" ");
}

async function generateBatch(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.id === productId);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  const originalUrl = productImage(product);
  if (!originalUrl) throw new Error("PRODUCT_IMAGE_REQUIRED");
  const batchId = `LOOKBOOK_${productId}_${crypto.randomUUID()}`;
  const startedAt = Date.now();
  const jobs = Array.from({ length: 10 }, (_, index) => {
    const scene = sceneTypes[index % sceneTypes.length];
    return generateImage({
      prompt: buildPrompt(product, scene.description, index),
      originalImages: [{ url: originalUrl, mimeType: "image/jpeg" }],
      model: "MODEL_GPT_IMAGE_2",
      quality: "medium",
      storageKey: `display-lookbook/products/${productId}/${batchId}/shot-${String(index + 1).padStart(2, "0")}.png`,
    }).then((result) => ({ index, scene, result }));
  });
  const settled = await Promise.allSettled(jobs);
  const rows = settled.flatMap((outcome) => {
    if (outcome.status !== "fulfilled") return [];
    const { index, scene, result } = outcome.value;
    const imageUrl = result.url;
    const storageKey = result.key;
    if (typeof imageUrl !== "string" || typeof storageKey !== "string") return [];
    return [{ productId, batchId, shotIndex: index + 1, sceneType: scene.type, sceneDescription: scene.description, imageUrl, storageKey, isApproved: 0, isActive: 1 }];
  });
  if (rows.length) {
    await db.insert(displayLookbookImages).values(rows);
    await db.update(displayLookbookImages).set({ isActive: 0, isApproved: 0 }).where(and(eq(displayLookbookImages.productId, productId), ne(displayLookbookImages.batchId, batchId)));
  }
  return { batchId, productId, generated: rows.length, requested: 10, durationMs: Date.now() - startedAt, images: rows };
}

export const displayLookbookRouter = router({
  /** Only approved assets are available to the physical-store display account. */
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
  adminList: ownerProcedure.input(generateInput).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(displayLookbookImages).where(and(eq(displayLookbookImages.productId, input.productId), eq(displayLookbookImages.isActive, 1))).orderBy(desc(displayLookbookImages.createdAt), displayLookbookImages.shotIndex);
  }),
  generateBatch: ownerProcedure.input(generateInput).mutation(async ({ input }) => generateBatch(input.productId)),
  approve: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_UNAVAILABLE");
    await db.update(displayLookbookImages).set({ isApproved: 1 }).where(eq(displayLookbookImages.id, input.id));
    return { success: true };
  }),
  revoke: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_UNAVAILABLE");
    await db.update(displayLookbookImages).set({ isApproved: 0 }).where(eq(displayLookbookImages.id, input.id));
    return { success: true };
  }),
  remove: ownerProcedure.input(imageIdInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_UNAVAILABLE");
    await db.update(displayLookbookImages).set({ isActive: 0, isApproved: 0 }).where(eq(displayLookbookImages.id, input.id));
    return { success: true };
  }),
});
