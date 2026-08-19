export const BASE_CATEGORY_OPTIONS = ["TOP", "PANTS", "JACKET", "DRESS", "SHOES", "BAG"] as const;

export type BaseCategory = (typeof BASE_CATEGORY_OPTIONS)[number];
export type CoreProductCategory = "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";

const BASE_TO_CORE_CATEGORY: Record<BaseCategory, CoreProductCategory> = {
  TOP: "top",
  PANTS: "bottom",
  JACKET: "outer",
  DRESS: "dress",
  SHOES: "shoes",
  BAG: "bag",
};

const CORE_TO_BASE_CATEGORY: Record<CoreProductCategory, BaseCategory> = {
  top: "TOP",
  bottom: "PANTS",
  outer: "JACKET",
  dress: "DRESS",
  shoes: "SHOES",
  bag: "BAG",
};

export const baseCategoryToCoreCategory = (category: BaseCategory): CoreProductCategory => BASE_TO_CORE_CATEGORY[category];

export const coreCategoryToBaseCategory = (category: CoreProductCategory): BaseCategory => CORE_TO_BASE_CATEGORY[category];

export const DEFAULT_MANAGED_CATEGORIES: Array<{ nameEn: string; nameKo: string; nameZh: string; baseCategory: BaseCategory; sortOrder: number }> = [
  { nameEn: "Top", nameKo: "상의", nameZh: "上装", baseCategory: "TOP", sortOrder: 10 },
  { nameEn: "Bottom", nameKo: "하의", nameZh: "下装", baseCategory: "PANTS", sortOrder: 20 },
  { nameEn: "Outer", nameKo: "아우터", nameZh: "外套", baseCategory: "JACKET", sortOrder: 30 },
  { nameEn: "Dress", nameKo: "원피스", nameZh: "连衣裙", baseCategory: "DRESS", sortOrder: 40 },
  { nameEn: "Shoes", nameKo: "신발", nameZh: "鞋履", baseCategory: "SHOES", sortOrder: 50 },
  { nameEn: "Bag", nameKo: "가방", nameZh: "包袋", baseCategory: "BAG", sortOrder: 60 },
];

export function localizedCategoryName(category: { nameEn?: string | null; nameKo?: string | null; nameZh?: string | null; baseCategory?: BaseCategory | null } | null | undefined, language: string) {
  const locale = language.startsWith("ko") ? "ko" : language.startsWith("zh") ? "zh" : "en";
  const fallback = category?.baseCategory ? baseCategoryToCoreCategory(category.baseCategory) : "top";
  const names: Record<CoreProductCategory, Record<"en" | "ko" | "zh", string>> = {
    top: { en: "Top", ko: "상의", zh: "上装" }, bottom: { en: "Bottom", ko: "하의", zh: "下装" }, outer: { en: "Outer", ko: "아우터", zh: "外套" }, dress: { en: "Dress", ko: "원피스", zh: "连衣裙" }, shoes: { en: "Shoes", ko: "신발", zh: "鞋履" }, bag: { en: "Bag", ko: "가방", zh: "包袋" },
  };
  return locale === "ko" ? category?.nameKo || category?.nameEn || category?.nameZh || names[fallback].ko : locale === "zh" ? category?.nameZh || category?.nameEn || category?.nameKo || names[fallback].zh : category?.nameEn || category?.nameKo || category?.nameZh || names[fallback].en;
}
