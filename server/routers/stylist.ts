import { z } from "zod";
import { getActiveStylePresets, getActiveStylistProducts, saveStylistFeedback } from "../db";
import { getReleaseSettings } from "../access";
import { publicProcedure, router } from "../_core/trpc";
import { recommendTopLooks, validateRecommendedProductIds } from "../stylistEngine";
import { STYLE_PRESET_KEYS } from "../../shared/stylist";
import { recordRuleEngineUse } from "../aiUsageController";

const styleKey = z.enum(STYLE_PRESET_KEYS);

export const stylistRouter = router({
  presets: publicProcedure.query(getActiveStylePresets),
  recommend: publicProcedure.input(z.object({ visitorId: z.string().min(1).max(96).optional(), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), locale: z.enum(["en", "ko", "zh"]).default("en"), body: z.object({ bustCm: z.number().nullable().optional(), waistCm: z.number().nullable().optional(), hipCm: z.number().nullable().optional(), shoulderCm: z.number().nullable().optional() }).nullable().optional() })).query(async ({ input }) => {
    const [settings, presets] = await Promise.all([getReleaseSettings(), getActiveStylePresets()]);
    const activeProducts = await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder));
    const preset = presets.find((item) => item.key === input.styleKey);
    if (!preset) throw new Error("The requested style preset is not active.");
    const looks = recommendTopLooks({ activeProducts, preset, anchorProductId: input.anchorProductId ?? null, body: input.body, locale: input.locale, limit: 3 });
    await recordRuleEngineUse(input.visitorId);
    return looks;
  }),
  feedback: publicProcedure.input(z.object({ visitorId: z.string().min(8).max(96), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), productIds: z.array(z.number().int().positive()).min(1).max(5), score: z.number().int().min(0).max(100), feedback: z.enum(["good", "bad"]) })).mutation(async ({ input }) => {
    const [settings, presets] = await Promise.all([getReleaseSettings(), getActiveStylePresets()]);
    const activeProducts = await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder));
    if (!presets.some((item) => item.key === input.styleKey)) throw new Error("The requested style preset is not active.");
    validateRecommendedProductIds(input.productIds, activeProducts);
    if (input.anchorProductId && !input.productIds.includes(input.anchorProductId)) throw new Error("The selected anchor product must be retained in feedback.");
    const { styleKey: stylePresetKey, ...feedbackInput } = input;
    await saveStylistFeedback({ ...feedbackInput, stylePresetKey });
    return { success: true };
  }),
});
