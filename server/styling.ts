import type { Background, Product } from "../drizzle/schema";

export type OutfitSelection = {
  type: "dress" | "separates";
  top: Product | null;
  bottom: Product | null;
  outer: Product | null;
  dress: Product | null;
  background: Background;
};

const NEUTRALS = new Set(["블랙", "화이트", "아이보리", "베이지", "그레이", "브라운", "네이비"]);
const COLOR_PAIRS: Record<string, string[]> = {
  블루: ["아이보리", "베이지", "화이트", "그레이", "네이비"],
  그린: ["아이보리", "베이지", "화이트", "브라운", "블랙"],
  버건디: ["아이보리", "베이지", "블랙", "그레이"],
  핑크: ["아이보리", "화이트", "베이지", "그레이"],
};

export const splitTags = (value: string) => value.split(",").map((tag) => tag.trim()).filter(Boolean);
export const sharedTag = (first: string, second: string) => splitTags(first).some((tag) => splitTags(second).includes(tag));

export function seasonCompatible(first: Product, second: Product) {
  return sharedTag(first.season, second.season);
}

export function colorCompatible(first: Product, second: Product) {
  if (first.color === second.color || NEUTRALS.has(first.color) || NEUTRALS.has(second.color)) return true;
  return (COLOR_PAIRS[first.color] ?? []).includes(second.color) || (COLOR_PAIRS[second.color] ?? []).includes(first.color);
}

export function styleCompatible(first: Product, second: Product) {
  return sharedTag(first.style, second.style);
}

export function compatibleWith(anchor: Product, candidate: Product) {
  return seasonCompatible(anchor, candidate) && colorCompatible(anchor, candidate) && styleCompatible(anchor, candidate);
}

function pick<T>(items: T[], random: () => number): T {
  if (items.length === 0) throw new Error("A compatible styling candidate is required.");
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;
}

function chooseBackground(backgrounds: Background[], styles: string, random: () => number) {
  const candidates = backgrounds.filter((background) => sharedTag(background.styleTags, styles));
  return pick(candidates.length ? candidates : backgrounds, random);
}

/**
 * Curated random selection. A draw below .30 creates a dress look; all other
 * draws create a separates look. In a separates look, an outer is skipped only
 * when the outer draw is below .30.
 */
export function selectOutfit(products: Product[], backgrounds: Background[], random = Math.random): OutfitSelection {
  const sellable = products.filter((product) => product.status === "in_stock");
  if (backgrounds.length === 0 || sellable.length === 0) throw new Error("Catalog seed data is unavailable.");

  const dressLook = random() < 0.3;
  if (dressLook) {
    const dress = pick(sellable.filter((product) => product.category === "dress"), random);
    return { type: "dress", top: null, bottom: null, outer: null, dress, background: chooseBackground(backgrounds, dress.style, random) };
  }

  const tops = sellable.filter((product) => product.category === "top");
  const bottoms = sellable.filter((product) => product.category === "bottom");
  const outers = sellable.filter((product) => product.category === "outer");
  const combinations = tops.flatMap((top) => bottoms
    .filter((bottom) => compatibleWith(top, bottom))
    .map((bottom) => ({ top, bottom, outers: outers.filter((outer) => compatibleWith(top, outer) && compatibleWith(bottom, outer)) })));
  const candidatesWithOuter = combinations.filter((combination) => combination.outers.length > 0);
  if (combinations.length === 0 || candidatesWithOuter.length === 0) throw new Error("호환 가능한 코디 조합을 찾을 수 없습니다.");
  const selection = pick(candidatesWithOuter, random);
  const { top, bottom } = selection;
  const skipOuter = random() < 0.3;
  const outer = skipOuter ? null : pick(selection.outers, random);
  const styleProfile = [top.style, bottom.style, outer?.style].filter(Boolean).join(",");
  return { type: "separates", top, bottom, outer, dress: null, background: chooseBackground(backgrounds, styleProfile, random) };
}
