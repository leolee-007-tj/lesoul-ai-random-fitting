import { z } from "zod";
import { generateFashionLook } from "../fashionProvider";
import { publicProcedure, router } from "../_core/trpc";
import { completeGenerationLog, createGenerationLog, getGenerationLog, getGenerationPerformance, markGenerationLogGenerating } from "../db";
import { validateGeneratedLook, validationNotEnabled } from "../../shared/generationValidation";
import { canGenerate, consumeRedeemAllowance } from "../access";

const lookRequest = z.object({
  visitorId: z.string().min(1).max(96),
  source: z.enum(["wechat_moments", "direct", "admin_test"]).default("direct"),
  tryOnMode: z.enum(["my_photo", "ai_body_model"]).default("my_photo"),
  bodyModelId: z.number().int().positive().nullable().optional(),
  userImage: z.string().min(1),
  pose: z.object({ id: z.number().int(), name: z.string(), promptKeyword: z.string() }),
  clothing: z.array(z.object({ id: z.number().int(), name: z.string(), category: z.string(), imageUrl: z.string(), images: z.array(z.string()).nullable().optional(), imageViews: z.object({ front: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), back: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), side: z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() }).optional(), detail: z.array(z.object({ original: z.string(), studioCut: z.string(), thumbnail: z.string() })).max(4).optional() }).nullable().optional(), description: z.string(), color: z.string().nullable().optional(), fabric: z.string().nullable().optional(), texture: z.string().nullable().optional(), fit: z.string().nullable().optional(), length: z.string().nullable().optional(), width: z.string().nullable().optional(), details: z.string().nullable().optional(), neckline: z.string().nullable().optional(), sleeve: z.string().nullable().optional() })).min(1),
  background: z.object({ id: z.number().int(), name: z.string(), promptKeyword: z.string() }),
  style: z.string().min(1).max(64),
  adjustments: z.object({ overallFit: z.enum(["looser", "as_is", "tighter"]).optional(), proportion: z.enum(["shorter_torso", "as_is", "longer_legs"]).optional(), lighting: z.enum(["darker", "as_is", "brighter"]).optional(), items: z.record(z.string(), z.object({ length: z.enum(["shorter", "as_is", "longer"]).optional(), width: z.enum(["narrower", "as_is", "wider"]).optional(), color: z.enum(["muted", "as_is", "vibrant"]).optional(), details: z.enum(["simpler", "as_is", "detailed"]).optional() })).optional() }).optional(),
  bodyMeasurements: z.object({ height: z.number().min(140).max(200), shoulderWidth: z.number().min(30).max(55), chest: z.number().min(70).max(130).nullable().optional(), waist: z.number().min(55).max(110).nullable().optional(), hip: z.number().min(75).max(130).nullable().optional(), armLength: z.number().min(45).max(75).nullable().optional(), inseam: z.number().min(60).max(90).nullable().optional(), thigh: z.number().min(40).max(70).nullable().optional(), gender: z.enum(["female", "male", "other"]), unit: z.literal("cm") }).optional(),
  generationId: z.string().uuid(),
  retryOfGenerationId: z.string().uuid().nullable().optional(),
});

export const lookRouter = router({
  generate: publicProcedure.input(lookRequest).mutation(async ({ input }) => {
    const existing = await getGenerationLog(input.generationId);
    if (existing?.resultImageUrl && (existing.status === "completed" || existing.status === "fallback")) {
      return { generatedImage: existing.resultImageUrl, generationStatus: "completed" as const, provider: existing.status === "completed" ? "external" as const : "mock" as const, metadata: { pose: input.pose.name, background: input.background.name, style: input.style, clothingCount: input.clothing.length, generatedAt: existing.completedAt?.toISOString() ?? existing.updatedAt.toISOString(), preservationPrompt: "Reused completed generation", negativePrompt: "Reused completed generation" }, generationId: input.generationId, validation: validationNotEnabled(), reused: true };
    }
    if (existing && (existing.status === "preparing" || existing.status === "generating")) throw new Error("This generation is already in progress.");
    const access = await canGenerate(input.visitorId);
    if (!access.allowed) throw new Error(`GENERATION_ACCESS_DENIED:${access.reason}`);
    const retryParent = input.retryOfGenerationId ? await getGenerationLog(input.retryOfGenerationId) : undefined;
    const retryCount = (retryParent?.retryCount ?? -1) + 1;
    const { created } = await createGenerationLog({ requestId: input.generationId, retryOfRequestId: input.retryOfGenerationId ?? null, retryCount: Math.max(0, retryCount), userImageUrl: input.userImage, poseId: input.pose.id, style: input.style, productIds: input.clothing.map((item) => item.id), backgroundId: input.background.id, provider: "manus_gpt_image_2", visitorId: input.visitorId, releaseMode: access.releaseMode, source: input.source, tryOnMode: input.tryOnMode, bodyModelId: input.bodyModelId ?? null });
    if (!created) throw new Error("Unable to reserve a unique generation request.");
    const startedAt = Date.now();
    try {
      await markGenerationLogGenerating(input.generationId);
      const response = await generateFashionLook(input);
      const validation = await validateGeneratedLook({ resultImageUrl: response.generatedImage, userImageUrl: input.userImage, productIds: input.clothing.map((item) => item.id), poseId: input.pose.id, backgroundId: input.background.id });
      await completeGenerationLog({ requestId: input.generationId, status: response.provider === "external" ? "completed" : "fallback", resultImageUrl: response.generatedImage, durationMs: Date.now() - startedAt, validation });
      if (response.provider === "external" && access.releaseMode === "REDEEM_CODE") await consumeRedeemAllowance(input.visitorId);
      return { ...response, generationId: input.generationId, validation, reused: false, access };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed.";
      await completeGenerationLog({ requestId: input.generationId, status: "failed", errorMessage: message, durationMs: Date.now() - startedAt, validation: validationNotEnabled() });
      throw error;
    }
  }),
  status: publicProcedure.input(z.object({ generationId: z.string().uuid() })).query(async ({ input }) => getGenerationLog(input.generationId)),
  performance: publicProcedure.query(getGenerationPerformance),
});
