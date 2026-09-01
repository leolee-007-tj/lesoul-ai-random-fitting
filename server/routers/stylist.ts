import { z } from "zod";
import { getActiveStylePresets, getActiveStylistProducts, getEligibleCuratedOutfits, getPublishedCuratedOutfits, saveStylistFeedback } from "../db";
import { canViewVipEarlyAccess, getReleaseSettings } from "../access";
import { customerProcedure, publicProcedure, resolveCustomerVisitorId, router } from "../_core/trpc";
import { recommendCuratedTopLooks, validateRecommendedProductIds } from "../stylistEngine";
import { STYLE_PRESET_KEYS } from "../../shared/stylist";

const styleKey = z.enum(STYLE_PRESET_KEYS);

export const stylistRouter = router({
  presets: publicProcedure.query(getActiveStylePresets),
  products: publicProcedure.query(async ({ ctx }) => {
    const settings = await getReleaseSettings();
    return (await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder))).filter((product) => canViewVipEarlyAccess(product, ctx.user?.role));
  }),
  published: customerProcedure.input(z.object({ locale: z.enum(["en", "ko", "zh"]).default("en") })).query(async ({ input, ctx }) => {
    const settings = await getReleaseSettings();
    const outfits = await getPublishedCuratedOutfits({ includePreorder: Boolean(settings.stylistIncludePreorder), role: ctx.user?.role, limit: 3 });
    return outfits.map((outfit) => ({
      lookId: `CURATED_${outfit.id}`,
      name: input.locale === "ko" ? outfit.nameKo : input.locale === "zh" ? outfit.nameZh : outfit.nameEn,
      reason: input.locale === "ko" ? outfit.reasonKo : input.locale === "zh" ? outfit.reasonZh : outfit.reasonEn,
      stylePresetKey: outfit.stylePresetKey,
      products: outfit.items.map((item) => item.product).filter(Boolean),
    }));
  }),
  recommend: customerProcedure.input(z.object({ visitorId: z.string().min(1).max(96), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), locale: z.enum(["en", "ko", "zh"]).default("en") })).query(async ({ input, ctx }) => {
    const [settings, presets] = await Promise.all([getReleaseSettings(), getActiveStylePresets()]);
    const activeProducts = (await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder))).filter((product) => canViewVipEarlyAccess(product, ctx.user?.role));
    const preset = presets.find((item) => item.key === input.styleKey);
    if (!preset) throw new Error("The requested style preset is not active.");
    const curatedOutfits = await getEligibleCuratedOutfits({ stylePresetKey: input.styleKey, anchorProductId: input.anchorProductId ?? null, includePreorder: Boolean(settings.stylistIncludePreorder) });
    return recommendCuratedTopLooks({ curatedOutfits, activeProducts, preset, anchorProductId: input.anchorProductId ?? null, locale: input.locale, limit: 3 });
  }),
  feedback: customerProcedure.input(z.object({ visitorId: z.string().min(8).max(96), styleKey, anchorProductId: z.number().int().positive().nullable().optional(), productIds: z.array(z.number().int().positive()).min(1).max(5), score: z.number().int().min(0).max(100), feedback: z.enum(["good", "bad"]) })).mutation(async ({ input, ctx }) => {
    const visitorId = resolveCustomerVisitorId(ctx, input.visitorId);
    const [settings, presets] = await Promise.all([getReleaseSettings(), getActiveStylePresets()]);
    const activeProducts = (await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder))).filter((product) => canViewVipEarlyAccess(product, ctx.user?.role));
    if (!presets.some((item) => item.key === input.styleKey)) throw new Error("The requested style preset is not active.");
    validateRecommendedProductIds(input.productIds, activeProducts);
    if (input.anchorProductId && !input.productIds.includes(input.anchorProductId)) throw new Error("The selected anchor product must be retained in feedback.");
    const { styleKey: stylePresetKey, ...feedbackInput } = input;
    await saveStylistFeedback({ ...feedbackInput, visitorId, stylePresetKey });
    return { success: true };
  }),
});
