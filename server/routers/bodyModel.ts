import { createHash } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { aiBodyModels, bodyProfiles } from "../../drizzle/schema";
import { getDb } from "../db";
import { generateImage } from "../_core/imageGeneration";
import { publicProcedure, router } from "../_core/trpc";

const profileInput = z.object({
  visitorId: z.string().min(1).max(96),
  heightCm: z.number().int().min(140).max(200),
  weightKg: z.number().int().min(35).max(180),
  bustCm: z.number().int().min(60).max(160).nullable().optional(),
  waistCm: z.number().int().min(45).max(140).nullable().optional(),
  hipCm: z.number().int().min(60).max(170).nullable().optional(),
  genderPresentation: z.enum(["female", "masculine", "androgynous", "custom"]).default("female"),
  bodyShape: z.enum(["slim", "straight", "curvy", "petite", "tall", "plus", "custom"]).default("custom"),
  consent: z.literal(true),
});

export const modelPrompt = (input: z.infer<typeof profileInput>) => `Create a single anonymous full-body fashion fitting model for a virtual try-on system. This is not a portrait and must not resemble or infer a real person's identity. Natural proportional adult ${input.genderPresentation} fashion figure, approximately ${input.heightCm} cm / ${input.weightKg} kg visual proportion, ${input.bodyShape} body shape. Use the optional proportion information only to guide overall body balance: bust ${input.bustCm ?? "not provided"} cm, waist ${input.waistCm ?? "not provided"} cm, hip ${input.hipCm ?? "not provided"} cm. Neutral expression, non-identifying features, full hands and feet visible, relaxed straight standing pose, simple fitted neutral beige top and charcoal straight trousers, plain soft ivory studio background, diffused editorial lighting, accurate realistic garment-fitting silhouette, no logo, no text, no accessories, no collage.`;

export const bodyModelRouter = router({
  create: publicProcedure.input(profileInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("AI Body Model service is temporarily unavailable.");
    const profileHash = createHash("sha256").update(JSON.stringify({ ...input, consent: undefined })).digest("hex");
    const existingProfile = (await db.select().from(bodyProfiles).where(eq(bodyProfiles.profileHash, profileHash)).orderBy(desc(bodyProfiles.createdAt)).limit(1))[0];
    if (existingProfile) {
      const existingModel = (await db.select().from(aiBodyModels).where(eq(aiBodyModels.bodyProfileId, existingProfile.id)).orderBy(desc(aiBodyModels.createdAt)).limit(1))[0];
      if (existingModel?.status === "ready" && existingModel.imageUrl) return { id: existingModel.id, imageUrl: existingModel.imageUrl, reused: true, profileId: existingProfile.id };
    }
    const profile = existingProfile ?? (await (async () => {
      const result = await db.insert(bodyProfiles).values({ ...input, bustCm: input.bustCm ?? null, waistCm: input.waistCm ?? null, hipCm: input.hipCm ?? null, profileHash, consentedAt: new Date() });
      return (await db.select().from(bodyProfiles).where(eq(bodyProfiles.id, Number(result[0].insertId))).limit(1))[0]!;
    })());
    const insert = await db.insert(aiBodyModels).values({ bodyProfileId: profile.id, profileHash, status: "preparing" });
    const modelId = Number(insert[0].insertId);
    try {
      const result = await generateImage({ prompt: modelPrompt(input), model: "MODEL_GPT_IMAGE_2", quality: "medium" });
      if (!result.url) throw new Error("AI Body Model image was not returned.");
      await db.update(aiBodyModels).set({ status: "ready", imageUrl: result.url }).where(eq(aiBodyModels.id, modelId));
      return { id: modelId, imageUrl: result.url, reused: false, profileId: profile.id };
    } catch (error) {
      await db.update(aiBodyModels).set({ status: "failed" }).where(eq(aiBodyModels.id, modelId));
      throw error;
    }
  }),
  latest: publicProcedure.input(z.object({ visitorId: z.string().min(1).max(96) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const profiles = await db.select().from(bodyProfiles).where(eq(bodyProfiles.visitorId, input.visitorId)).orderBy(desc(bodyProfiles.createdAt)).limit(1);
    if (!profiles[0]) return null;
    return (await db.select().from(aiBodyModels).where(eq(aiBodyModels.bodyProfileId, profiles[0].id)).orderBy(desc(aiBodyModels.createdAt)).limit(1))[0] ?? null;
  }),
});
