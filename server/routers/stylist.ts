import { z } from "zod";
import { getActiveStylePresets, getActiveStylistProducts, getEligibleCuratedOutfits, saveStylistFeedback } from "../db";
import { getReleaseSettings } from "../access";
import { customerProcedure, publicProcedure, resolveCustomerVisitorId, router } from "../_core/trpc";
import { recommendCuratedTopLooks, validateRecommendedProductIds } from "../stylistEngine";
import { STYLE_PRESET_KEYS } from "../../shared/stylist";

const styleKey = z.enum(STYLE_PRESET_KEYS);

export const stylistRouter = router({
  presets: publicProcedure.query(getActiveStylePresets),
  products: publicProcedure.query(async () => {
    const settings = await getReleaseSettings();
    return getActiveStylistProducts(Boolean(settings.stylistIncludePreorder));
  }),
  recommend: customerProcedure.input(z.object({ visitorId: z.string().min(1).max(96), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), locale: z.enum(["en", "ko", "zh"]).default("en") })).query(async ({ input }) => {
    const [settings, presets] = await Promise.all([getReleaseSettings(), getActiveStylePresets()]);
    const activeProducts = await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder));
    const preset = presets.find((item) => item.key === input.styleKey);
    if (!preset) throw new Error("The requested style preset is not active.");
    const curatedOutfits = await getEligibleCuratedOutfits({ stylePresetKey: input.styleKey, anchorProductId: input.anchorProductId ?? null, includePreorder: Boolean(settings.stylistIncludePreorder) });
    return recommendCuratedTopLooks({ curatedOutfits, activeProducts, preset, anchorProductId: input.anchorProductId ?? null, locale: input.locale, limit: 3 });
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
