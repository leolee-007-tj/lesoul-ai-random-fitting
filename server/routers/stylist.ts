import { z } from "zod";
import { getActiveStylePresets, getActiveStylistProducts, saveStylistFeedback } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { recommendTopLooks, validateRecommendedProductIds } from "../stylistEngine";
import { STYLE_PRESET_KEYS } from "../../shared/stylist";

const styleKey = z.enum(STYLE_PRESET_KEYS);

export const stylistRouter = router({
  presets: publicProcedure.query(getActiveStylePresets),
  recommend: publicProcedure.input(z.object({ styleKey, anchorProductId: z.number().int().positive().nullable().optional() })).query(async ({ input }) => {
    const [activeProducts, presets] = await Promise.all([getActiveStylistProducts(), getActiveStylePresets()]);
    const preset = presets.find((item) => item.key === input.styleKey);
    if (!preset) throw new Error("The requested style preset is not active.");
    return recommendTopLooks({ activeProducts, preset, anchorProductId: input.anchorProductId ?? null, limit: 3 });
  }),
  feedback: publicProcedure.input(z.object({ visitorId: z.string().min(8).max(96), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), productIds: z.array(z.number().int().positive()).min(1).max(5), score: z.number().int().min(0).max(100), feedback: z.enum(["good", "bad"]) })).mutation(async ({ input }) => {
    const [activeProducts, presets] = await Promise.all([getActiveStylistProducts(), getActiveStylePresets()]);
    if (!presets.some((item) => item.key === input.styleKey)) throw new Error("The requested style preset is not active.");
    validateRecommendedProductIds(input.productIds, activeProducts);
    if (input.anchorProductId && !input.productIds.includes(input.anchorProductId)) throw new Error("The selected anchor product must be retained in feedback.");
    const { styleKey: stylePresetKey, ...feedbackInput } = input;
    await saveStylistFeedback({ ...feedbackInput, stylePresetKey });
    return { success: true };
  }),
});
