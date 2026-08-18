import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { aiBodyModels, bodyProfiles } from "../../drizzle/schema";
import { getDb } from "../db";
import { generateImage } from "../_core/imageGeneration";
import { publicProcedure, router } from "../_core/trpc";

const profileInput = z.object({
  visitorId: z.string().min(1).max(96),
  modelKey: z.string().min(8).max(48).optional(),
  heightCm: z.number().int().min(140).max(200),
  weightKg: z.number().int().min(35).max(180),
  bustCm: z.number().int().min(60).max(160).nullable().optional(),
  waistCm: z.number().int().min(45).max(140).nullable().optional(),
  hipCm: z.number().int().min(60).max(170).nullable().optional(),
  genderPresentation: z.literal("female").default("female"),
  bodyShape: z.enum(["slim", "straight", "curvy", "petite", "tall", "plus", "custom"]).default("custom"),
  hairLength: z.enum(["short", "medium", "long"]).default("medium"),
  hairStyle: z.enum(["straight", "natural_wave", "bob"]).default("straight"),
  hairColor: z.enum(["black", "dark_brown", "brown", "light_brown"]).default("dark_brown"),
  skinTone: z.enum(["light", "light_medium", "medium", "medium_deep", "deep"]).default("light_medium"),
  consent: z.literal(true),
});

export const modelPrompt = (input: z.infer<typeof profileInput>) => `Create one persistent anonymous adult female fashion model for virtual try-on. This is a generated fashion identity, not a portrait of a real person. Full body, front-oriented neutral standing pose, full hands and feet visible, simple fitted neutral cream top and charcoal trousers, plain soft ivory studio background. Prioritise the submitted body measurements over default fashion-model proportions: height ${input.heightCm} cm, weight ${input.weightKg} kg, bust ${input.bustCm ?? "not provided"} cm, waist ${input.waistCm ?? "not provided"} cm, hip ${input.hipCm ?? "not provided"} cm. Represent the submitted body volume and proportions honestly; do not make the body slimmer to suit clothing. Appearance lock: ${input.hairLength} ${input.hairStyle.replace("_", " ")} hair in ${input.hairColor.replace("_", " ")}, ${input.skinTone.replace("_", "-")} skin tone. Natural realistic proportion, neutral expression, consistent non-identifying facial geometry, no logo, no text, no accessories, no collage.`;

const toResult = (model: typeof aiBodyModels.$inferSelect, profile: typeof bodyProfiles.$inferSelect, reused: boolean) => ({ id: model.id, imageUrl: model.imageUrl!, reused, profileId: profile.id, modelKey: model.modelKey, version: model.version, approved: Boolean(model.approved), profile: { heightCm: profile.heightCm, weightKg: profile.weightKg, bustCm: profile.bustCm, waistCm: profile.waistCm, hipCm: profile.hipCm, hairLength: profile.hairLength, hairStyle: profile.hairStyle, hairColor: profile.hairColor, skinTone: profile.skinTone } });

export const bodyModelRouter = router({
  create: publicProcedure.input(profileInput).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("AI Body Model service is temporarily unavailable.");
    const canonical = { ...input, modelKey: undefined, consent: undefined };
    const profileHash = createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
    const sameProfile = (await db.select().from(bodyProfiles).where(and(eq(bodyProfiles.visitorId, input.visitorId), eq(bodyProfiles.profileHash, profileHash))).orderBy(desc(bodyProfiles.createdAt)).limit(1))[0];
    if (sameProfile) {
      const sameModel = (await db.select().from(aiBodyModels).where(eq(aiBodyModels.bodyProfileId, sameProfile.id)).orderBy(desc(aiBodyModels.createdAt)).limit(1))[0];
      if (sameModel?.status === "ready" && sameModel.imageUrl) return toResult(sameModel, sameProfile, true);
    }
    const latestProfile = (await db.select().from(bodyProfiles).where(eq(bodyProfiles.visitorId, input.visitorId)).orderBy(desc(bodyProfiles.createdAt)).limit(1))[0];
    const modelKey = input.modelKey ?? latestProfile?.modelKey ?? `MODEL-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
    const version = latestProfile?.modelKey === modelKey ? latestProfile.version + 1 : 1;
    const insertProfile = await db.insert(bodyProfiles).values({ visitorId: input.visitorId, heightCm: input.heightCm, weightKg: input.weightKg, bustCm: input.bustCm ?? null, waistCm: input.waistCm ?? null, hipCm: input.hipCm ?? null, genderPresentation: "female", bodyShape: input.bodyShape, modelKey, hairLength: input.hairLength, hairStyle: input.hairStyle, hairColor: input.hairColor, skinTone: input.skinTone, approvalStatus: "preview", profileHash, version, consentedAt: new Date() });
    const profile = (await db.select().from(bodyProfiles).where(eq(bodyProfiles.id, Number(insertProfile[0].insertId))).limit(1))[0]!;
    const modelInsert = await db.insert(aiBodyModels).values({ bodyProfileId: profile.id, profileHash, modelKey, version, approved: 0, status: "preparing" });
    const modelId = Number(modelInsert[0].insertId);
    try {
      const result = await generateImage({ prompt: modelPrompt(input), model: "MODEL_GPT_IMAGE_2", quality: "high" });
      if (!result.url) throw new Error("AI Body Model image was not returned.");
      await db.update(aiBodyModels).set({ status: "ready", imageUrl: result.url }).where(eq(aiBodyModels.id, modelId));
      const model = (await db.select().from(aiBodyModels).where(eq(aiBodyModels.id, modelId)).limit(1))[0]!;
      return toResult(model, profile, false);
    } catch (error) { await db.update(aiBodyModels).set({ status: "failed" }).where(eq(aiBodyModels.id, modelId)); throw error; }
  }),
  approve: publicProcedure.input(z.object({ visitorId: z.string().min(1).max(96), modelId: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await getDb(); if (!db) throw new Error("AI Body Model service is temporarily unavailable.");
    const model = (await db.select().from(aiBodyModels).where(eq(aiBodyModels.id, input.modelId)).limit(1))[0];
    if (!model || model.status !== "ready" || !model.imageUrl) throw new Error("AI_MODEL_NOT_READY");
    const profile = (await db.select().from(bodyProfiles).where(and(eq(bodyProfiles.id, model.bodyProfileId), eq(bodyProfiles.visitorId, input.visitorId))).limit(1))[0];
    if (!profile) throw new Error("AI_MODEL_NOT_FOUND");
    await db.update(bodyProfiles).set({ approvalStatus: "approved" }).where(eq(bodyProfiles.id, profile.id));
    await db.update(aiBodyModels).set({ approved: 1 }).where(eq(aiBodyModels.id, model.id));
    return { ...toResult({ ...model, approved: 1 }, { ...profile, approvalStatus: "approved" }, false), approved: true };
  }),
  latest: publicProcedure.input(z.object({ visitorId: z.string().min(1).max(96) })).query(async ({ input }) => {
    const db = await getDb(); if (!db) return null;
    const profile = (await db.select().from(bodyProfiles).where(and(eq(bodyProfiles.visitorId, input.visitorId), eq(bodyProfiles.approvalStatus, "approved"))).orderBy(desc(bodyProfiles.createdAt)).limit(1))[0];
    if (!profile) return null;
    const model = (await db.select().from(aiBodyModels).where(and(eq(aiBodyModels.bodyProfileId, profile.id), eq(aiBodyModels.approved, 1))).orderBy(desc(aiBodyModels.createdAt)).limit(1))[0];
    return model?.imageUrl ? toResult(model, profile, true) : null;
  }),
});
