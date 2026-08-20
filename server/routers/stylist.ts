import { z } from "zod";
import { getActiveStylePresets, getActiveStylistProducts, getEligibleCuratedOutfits, saveStylistFeedback } from "../db";
import { getReleaseSettings } from "../access";
import { customerProcedure, publicProcedure, resolveCustomerVisitorId, router } from "../_core/trpc";
import { prioritizeCuratedTopLooks, recommendCuratedTopLooks, recommendTopLooks, validateRecommendedProductIds } from "../stylistEngine";
import { STYLE_PRESET_KEYS } from "../../shared/stylist";
import { beginAiUsage, finishAiUsage } from "../aiUsageController";

const styleKey = z.enum(STYLE_PRESET_KEYS);

export const stylistRouter = router({
  presets: publicProcedure.query(getActiveStylePresets),
  products: publicProcedure.query(async () => {
    const settings = await getReleaseSettings();
    return getActiveStylistProducts(Boolean(settings.stylistIncludePreorder));
  }),
  recommend: customerProcedure.input(z.object({ visitorId: z.string().min(1).max(96), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), locale: z.enum(["en", "ko", "zh"]).default("en"), body: z.object({ bustCm: z.number().nullable().optional(), waistCm: z.number().nullable().optional(), hipCm: z.number().nullable().optional(), shoulderCm: z.number().nullable().optional() }).nullable().optional() })).query(async ({ input, ctx }) => {
    const visitorId = resolveCustomerVisitorId(ctx, input.visitorId);
    const actor = ctx.user ? { openId: ctx.user.openId, role: ctx.user.role } : null;
    let usage: Awaited<ReturnType<typeof beginAiUsage>> | null = null;
    let startedAt = 0;
    try {
      const [settings, presets] = await Promise.all([getReleaseSettings(), getActiveStylePresets()]);
      const activeProducts = await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder));
      const preset = presets.find((item) => item.key === input.styleKey);
      if (!preset) throw new Error("The requested style preset is not active.");
      const curatedLooks = settings.curatedOutfitsPriority
        ? recommendCuratedTopLooks({ curatedOutfits: await getEligibleCuratedOutfits({ stylePresetKey: input.styleKey, anchorProductId: input.anchorProductId ?? null, includePreorder: Boolean(settings.stylistIncludePreorder) }), activeProducts, preset, anchorProductId: input.anchorProductId ?? null, body: input.body, locale: input.locale, limit: 3 })
        : [];
      if (curatedLooks.length >= 3) return curatedLooks;
      startedAt = Date.now();
      usage = await beginAiUsage({ visitorId, feature: "AI_STYLIST", provider: "lesoul_rule_engine", model: "compatibility_v1", actor });
      const dynamicLooks = recommendTopLooks({ activeProducts, preset, anchorProductId: input.anchorProductId ?? null, body: input.body, locale: input.locale, limit: 6 });
      const looks = prioritizeCuratedTopLooks(curatedLooks, dynamicLooks, 3);
      await finishAiUsage(usage.eventId, "SUCCESS", { durationMs: Date.now() - startedAt });
      return looks;
    } catch (error) {
      if (usage) await finishAiUsage(usage.eventId, "FAILED", { durationMs: Date.now() - startedAt, errorMessage: error instanceof Error ? error.message : "AI Style Match failed." });
      throw error;
    }
  }),
  feedback: customerProcedure.input(z.object({ visitorId: z.string().min(8).max(96), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), productIds: z.array(z.number().int().positive()).min(1).max(5), score: z.number().int().min(0).max(100), feedback: z.enum(["good", "bad"]) })).mutation(async ({ input, ctx }) => {
    const visitorId = resolveCustomerVisitorId(ctx, input.visitorId);
    const [settings, presets] = await Promise.all([getReleaseSettings(), getActiveStylePresets()]);
    const activeProducts = await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder));
    if (!presets.some((item) => item.key === input.styleKey)) throw new Error("The requested style preset is not active.");
    validateRecommendedProductIds(input.productIds, activeProducts);
    if (input.anchorProductId && !input.productIds.includes(input.anchorProductId)) throw new Error("The selected anchor product must be retained in feedback.");
    const { styleKey: stylePresetKey, ...feedbackInput } = input;
    await saveStylistFeedback({ ...feedbackInput, visitorId, stylePresetKey });
    return { success: true };
  }),
});
