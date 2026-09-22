import { z } from "zod";
import { getActiveStylePresets, getActiveStylistProducts, getEligibleCuratedOutfits, getPublishedCuratedOutfits, saveStylistFeedback } from "../db";
import { canViewVipEarlyAccess, getReleaseSettings } from "../access";
import { customerProcedure, publicProcedure, resolveCustomerVisitorId, router } from "../_core/trpc";
import { recommendCuratedTopLooks, validateRecommendedProductIds } from "../stylistEngine";
import { STYLE_PRESET_KEYS } from "../../shared/stylist";
import { invokeLLM } from "../_core/llm";
import { recommendSize } from "../../shared/sizeRecommendation";
import type { BodyMeasurements } from "../../shared/bodyMeasurements";

const styleKey = z.enum(STYLE_PRESET_KEYS);

const displayRecommendationInput = z.object({
  visitorId: z.string().min(8).max(96),
  locale: z.enum(["en", "ko", "zh"]).default("en"),
  intentText: z.string().trim().max(500).default(""),
  detailText: z.string().trim().max(500).default(""),
  height: z.number().min(80).max(240).nullable().optional(),
  weight: z.number().min(20).max(250).nullable().optional(),
  shoulderWidth: z.number().min(20).max(80).nullable().optional(),
  chest: z.number().min(40).max(180).nullable().optional(),
  waist: z.number().min(40).max(180).nullable().optional(),
  hip: z.number().min(40).max(200).nullable().optional(),
  bodyType: z.enum(["slim", "balanced", "curvy", "plus", "unknown"]).default("unknown"),
  usualSize: z.string().trim().max(32).optional(),
  photoDataUrl: z.string().regex(/^data:image\/(?:jpeg|png|webp);base64,/, "Only camera image data is supported.").max(8_000_000).nullable().optional(),
});

async function analyseDisplaySkinTone(photoDataUrl: string | null | undefined) {
  if (!photoDataUrl) return { tone: "unknown", confidence: "none" } as const;
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a privacy-preserving fashion color assistant. Inspect only the visible overall skin undertone and lighting conditions in the supplied customer photo. Do not identify the person, estimate age, gender, ethnicity, health, or any other sensitive trait. Return only a coarse fashion palette label: warm, cool, neutral, deep, or unclear. If lighting is poor or skin is not visible, return unclear. The result is only a styling hint, not a fact about the person." },
        { role: "user", content: [{ type: "text", text: "Classify the visible skin undertone for clothing color matching." }, { type: "image_url", image_url: { url: photoDataUrl, detail: "low" } }] },
      ],
      response_format: { type: "json_schema", json_schema: { name: "display_skin_palette", strict: true, schema: { type: "object", properties: { tone: { type: "string", enum: ["warm", "cool", "neutral", "deep", "unclear"] }, confidence: { type: "string", enum: ["low", "medium", "high"] } }, required: ["tone", "confidence"], additionalProperties: false } } },
    });
    const content = response.choices[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : null;
    if (parsed && ["warm", "cool", "neutral", "deep", "unclear"].includes(parsed.tone)) return parsed;
  } catch { /* recommendations remain available without photo analysis */ }
  return { tone: "unclear", confidence: "low" } as const;
}

async function understandDisplayIntent(text: string) {
  const fallback = { categoryFocus: text.includes("원피스") || text.toLowerCase().includes("dress") ? "dress" : "separates", wantsOuter: /외투|아우터|재킷|자켓|코트|outer|jacket|coat/i.test(text), keywords: text.slice(0, 180) } as const;
  if (!text.trim()) return fallback;
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You classify a customer's fashion request for a store catalog. Understand Korean, Chinese, and English. Do not diagnose body shape or invent products. Return only JSON: categoryFocus must be separates, dress, or all; wantsOuter is boolean; keywords is a short comma-separated list of concrete style, color, occasion, or fit terms useful for matching catalog text. Treat requests such as work, date, travel, casual, slimming, comfortable, warm, elegant, cover arms, avoid black, long wear, and fabric preferences as intent keywords." },
        { role: "user", content: text },
      ],
      response_format: { type: "json_schema", json_schema: { name: "display_fashion_intent", strict: true, schema: { type: "object", properties: { categoryFocus: { type: "string", enum: ["separates", "dress", "all"] }, wantsOuter: { type: "boolean" }, keywords: { type: "string", maxLength: 240 } }, required: ["categoryFocus", "wantsOuter", "keywords"], additionalProperties: false } } },
    });
    const content = response.choices[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : null;
    if (parsed && ["separates", "dress", "all"].includes(parsed.categoryFocus) && typeof parsed.wantsOuter === "boolean" && typeof parsed.keywords === "string") return parsed;
  } catch { /* keyword fallback keeps recommendations available if interpretation is unavailable */ }
  return fallback;
}

function displayScore(product: any, keywords: string[], skinTone: string) {
  const haystack = [product.name, product.nameKo, product.nameZh, product.nameEn, product.brand, product.color, product.style, product.description, product.fit].filter(Boolean).join(" ").toLowerCase();
  const toneWords: Record<string, string[]> = { warm: ["베이지", "브라운", "카멜", "오렌지", "코랄", "아이보리", "brown", "camel", "beige", "coral"], cool: ["네이비", "블루", "그레이", "핑크", "라벤더", "navy", "blue", "gray", "pink", "lavender"], neutral: ["블랙", "화이트", "그레이", "베이지", "black", "white", "gray", "beige"], deep: ["화이트", "아이보리", "카멜", "블루", "white", "ivory", "camel", "blue"] };
  const toneScore = (toneWords[skinTone] ?? []).some((word) => haystack.includes(word.toLowerCase())) ? 4 : 0;
  return keywords.reduce((score, keyword) => haystack.includes(keyword.toLowerCase()) ? score + 3 : score, 0) + toneScore + (product.inventoryQuantity == null || product.inventoryQuantity > 0 ? 2 : -100);
}

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
  displayRecommend: customerProcedure.input(displayRecommendationInput).query(async ({ input, ctx }) => {
    const settings = await getReleaseSettings();
    const [intent, skinPalette] = await Promise.all([understandDisplayIntent(`${input.intentText}\n${input.detailText}`.trim()), analyseDisplaySkinTone(input.photoDataUrl)]);
    const activeProducts = (await getActiveStylistProducts(Boolean(settings.stylistIncludePreorder))).filter((product) => canViewVipEarlyAccess(product, ctx.user?.role));
    const keywords = [...intent.keywords.split(/[,、，\s]+/).map((value: string) => value.trim()).filter((value: string) => value.length >= 2), ...(input.usualSize ? [input.usualSize] : [])].slice(0, 12);
    const measurements: BodyMeasurements | null = input.height && input.shoulderWidth ? { height: input.height, shoulderWidth: input.shoulderWidth, chest: input.chest, waist: input.waist, hip: input.hip, gender: "other", unit: "cm" } : null;
    const candidates = activeProducts.filter((product) => {
      if (intent.categoryFocus === "dress" && product.category !== "dress") return false;
      if (intent.categoryFocus === "separates" && product.category === "dress") return false;
      if (input.bodyType === "plus" && product.fit?.toLowerCase().includes("slim")) return false;
      return true;
    }).map((product) => ({ product, score: displayScore(product, keywords, skinPalette.tone) + (intent.wantsOuter && product.category === "outer" ? 8 : 0) + (intent.categoryFocus === "dress" && product.category === "dress" ? 8 : 0) })).sort((a, b) => b.score - a.score).slice(0, 12);
    const selected = candidates.filter(({ product }) => product.category !== "shoes" && product.category !== "bag");
    const grouped = { tops: selected.filter(({ product }) => product.category === "top").slice(0, 3), bottoms: selected.filter(({ product }) => product.category === "bottom").slice(0, 3), outers: selected.filter(({ product }) => product.category === "outer").slice(0, 2), dresses: selected.filter(({ product }) => product.category === "dress").slice(0, 2) };
    const products = (intent.categoryFocus === "dress" ? grouped.dresses : [...grouped.tops, ...grouped.bottoms, ...(intent.wantsOuter ? grouped.outers : [])]).slice(0, 8);
    return { intent, skinTone: skinPalette, bodyType: input.bodyType, usualSize: input.usualSize ?? null, products: products.map(({ product }) => ({ ...product, recommendedSize: measurements ? recommendSize(product, measurements) : null })), groups: { tops: grouped.tops.map(({ product }) => product), bottoms: grouped.bottoms.map(({ product }) => product), outers: grouped.outers.map(({ product }) => product), dresses: grouped.dresses.map(({ product }) => product) } };
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
