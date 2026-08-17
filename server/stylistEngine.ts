import type { Product } from "../drizzle/schema";
import type { CompatibilityWeights, StylePresetKey, StylistProductMetadata } from "../shared/stylist";

export type ScoreBreakdown = { style: number; color: number; silhouette: number; season: number; material: number; formality: number };
export type StylistRecommendation = { lookId: string; productIds: number[]; score: number; scoreBreakdown: ScoreBreakdown; reason: string; styleKey: StylePresetKey; anchorProductId: number | null };
export type ActiveStylePreset = { key: string; name: string; matchingTags: string[]; weights: CompatibilityWeights };

const NEUTRALS = new Set(["black", "white", "ivory", "beige", "gray", "grey", "brown", "navy", "블랙", "화이트", "아이보리", "베이지", "그레이", "브라운", "네이비"]);
const COLOR_COMPATIBILITY: Record<string, string[]> = {
  blue: ["ivory", "beige", "white", "gray", "navy", "블루", "아이보리", "베이지", "화이트", "그레이", "네이비"],
  green: ["ivory", "beige", "white", "brown", "black", "그린", "아이보리", "베이지", "화이트", "브라운", "블랙"],
  pink: ["ivory", "white", "beige", "gray", "핑크", "아이보리", "화이트", "베이지", "그레이"],
  burgundy: ["ivory", "beige", "black", "gray", "버건디", "아이보리", "베이지", "블랙", "그레이"],
};

function tags(value: string | null | undefined) { return (value ?? "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean); }
function metadata(product: Product): StylistProductMetadata { return product.stylistMetadata ?? {}; }
function color(product: Product) { return (metadata(product).mainColor ?? product.color).trim().toLowerCase(); }
function formality(product: Product) { return metadata(product).formality ?? (tags(product.style).some((tag) => ["출근", "고급", "office", "elegant"].includes(tag)) ? 4 : 2); }
function presetKey(value: string): StylePresetKey { return value as StylePresetKey; }

function styleScore(products: Product[], preset: ActiveStylePreset) {
  if (preset.key === "ai_choice") return 92;
  const desired = new Set([...preset.matchingTags, preset.key].map((tag) => tag.toLowerCase()));
  const scores = products.map((product) => {
    const productTags = new Set([...tags(product.style), ...(metadata(product).recommendedStyles ?? []), ...(metadata(product).fashionMood ?? []).map((tag) => tag.toLowerCase())]);
    return Array.from(desired).some((tag) => productTags.has(tag)) ? 100 : productTags.size ? 45 : 35;
  });
  return Math.round(scores.reduce((total, score) => total + score, 0) / Math.max(scores.length, 1));
}

function colorScore(products: Product[]) {
  if (products.length < 2) return 88;
  const colors = products.map(color);
  const pairs = colors.flatMap((first, firstIndex) => colors.slice(firstIndex + 1).map((second) => {
    if (first === second || NEUTRALS.has(first) || NEUTRALS.has(second)) return 100;
    if ((COLOR_COMPATIBILITY[first] ?? []).includes(second) || (COLOR_COMPATIBILITY[second] ?? []).includes(first)) return 88;
    return 54;
  }));
  return Math.round(pairs.reduce((total, score) => total + score, 0) / Math.max(pairs.length, 1));
}

function silhouetteScore(products: Product[]) {
  const top = products.find((product) => product.category === "top"); const bottom = products.find((product) => product.category === "bottom");
  if (!top || !bottom) return 86;
  const topFit = `${top.fit ?? ""} ${top.width ?? ""}`.toLowerCase(); const bottomFit = `${bottom.fit ?? ""} ${bottom.width ?? ""}`.toLowerCase();
  if ((/oversized|wide|boxy/.test(topFit) && /slim|fitted|narrow|straight/.test(bottomFit)) || (/slim|fitted/.test(topFit) && /wide|flared|relaxed/.test(bottomFit))) return 100;
  if (/regular|straight/.test(topFit) && /regular|straight/.test(bottomFit)) return 88;
  return 74;
}

function seasonScore(products: Product[]) {
  if (products.length < 2) return 90;
  const sets = products.map((product) => new Set(tags(product.season)));
  const overlap = Array.from(sets[0]).filter((season) => sets.every((set) => set.has(season)));
  return overlap.length ? 100 : 55;
}

function materialScore(products: Product[]) {
  const textures = products.map((product) => (metadata(product).materialAppearance ?? product.texture ?? product.fabric ?? "").toLowerCase()).filter(Boolean);
  if (textures.length < 2) return 84;
  return new Set(textures).size === 1 ? 80 : 94;
}

function formalityScore(products: Product[]) {
  const values = products.map(formality); const spread = Math.max(...values) - Math.min(...values);
  return spread === 0 ? 100 : spread === 1 ? 88 : spread === 2 ? 66 : 35;
}

function scoreOutfit(products: Product[], preset: ActiveStylePreset) {
  const raw: ScoreBreakdown = { style: styleScore(products, preset), color: colorScore(products), silhouette: silhouetteScore(products), season: seasonScore(products), material: materialScore(products), formality: formalityScore(products) };
  const weights = preset.weights;
  const score = Math.round((raw.style * weights.style + raw.color * weights.color + raw.silhouette * weights.silhouette + raw.season * weights.season + raw.material * weights.material + raw.formality * weights.formality) / 100);
  return { score, raw };
}

function createReason(products: Product[], score: number, preset: ActiveStylePreset) {
  const names = products.map((product) => product.name).slice(0, 3).join(" + ");
  const palette = Array.from(new Set(products.map((product) => product.color).filter(Boolean))).join(" and ");
  return `${names} pairs ${palette || "balanced"} tones with aligned proportions for a ${preset.name.toLowerCase()} look (${score}/100).`;
}

export function validateRecommendedProductIds(productIds: number[], activeProducts: Product[]) {
  if (!productIds.length || new Set(productIds).size !== productIds.length) throw new Error("A recommendation requires unique product IDs.");
  const activeIds = new Set(activeProducts.filter((product) => product.status === "in_stock").map((product) => product.id));
  if (!productIds.every((id) => activeIds.has(id))) throw new Error("Recommendations may only contain existing active product IDs.");
}

function outfitCandidates(activeProducts: Product[], anchorProductId?: number | null) {
  const tops = activeProducts.filter((product) => product.category === "top"); const bottoms = activeProducts.filter((product) => product.category === "bottom"); const outers = activeProducts.filter((product) => product.category === "outer"); const dresses = activeProducts.filter((product) => product.category === "dress"); const shoes = activeProducts.filter((product) => product.category === "shoes"); const bags = activeProducts.filter((product) => product.category === "bag");
  const optional = (items: Product[]) => items[0] ? [items[0]] : [];
  const candidates: Product[][] = [];
  for (const dress of dresses) candidates.push([dress, ...optional(shoes), ...optional(bags)]);
  for (const top of tops) for (const bottom of bottoms) {
    candidates.push([top, bottom, ...optional(shoes), ...optional(bags)]);
    for (const outer of outers) candidates.push([top, bottom, outer, ...optional(shoes), ...optional(bags)]);
  }
  return anchorProductId ? candidates.filter((outfit) => outfit.some((product) => product.id === anchorProductId)) : candidates;
}

export function recommendTopLooks(input: { activeProducts: Product[]; preset: ActiveStylePreset; anchorProductId?: number | null; limit?: number }) {
  const active = input.activeProducts.filter((product) => product.status === "in_stock");
  if (!active.length) throw new Error("No active inventory is available for AI Stylist recommendations.");
  if (input.anchorProductId && !active.some((product) => product.id === input.anchorProductId)) throw new Error("The selected item is not active inventory.");
  const seen = new Set<string>();
  const candidates = outfitCandidates(active, input.anchorProductId).flatMap((products) => {
    const productIds = products.map((product) => product.id); const identity = [...productIds].sort((first, second) => first - second).join("-");
    if (seen.has(identity)) return []; seen.add(identity);
    validateRecommendedProductIds(productIds, active);
    const { score, raw } = scoreOutfit(products, input.preset);
    return [{ products, productIds, score, raw }];
  });
  return candidates.sort((first, second) => second.score - first.score || first.productIds.join("-").localeCompare(second.productIds.join("-"))).slice(0, input.limit ?? 3).map((candidate, index) => ({ lookId: `LOOK_${String(index + 1).padStart(2, "0")}`, productIds: candidate.productIds, score: candidate.score, scoreBreakdown: candidate.raw, reason: createReason(candidate.products, candidate.score, input.preset), styleKey: presetKey(input.preset.key), anchorProductId: input.anchorProductId ?? null } satisfies StylistRecommendation));
}
