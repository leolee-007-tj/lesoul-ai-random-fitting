import type { GarmentMeasurements, StretchLevel } from "./fitEngine";

export const SET_COMPONENT_CATEGORIES = ["top", "bottom", "outer", "dress", "shoes", "bag"] as const;

export type SetComponentCategory = (typeof SET_COMPONENT_CATEGORIES)[number];

export type SetProductComponent = {
  componentId: string;
  sortOrder: number;
  category: SetComponentCategory;
  name: string;
  nameEn?: string | null;
  nameKo?: string | null;
  nameZh?: string | null;
  price: number;
  garmentMeasurements?: GarmentMeasurements | null;
  stretchLevel?: StretchLevel | null;
};

export type SetAwareProduct = {
  productType?: "SINGLE" | "SET" | null;
  setComponents?: SetProductComponent[] | null;
};

export function isSetProduct(product: SetAwareProduct) {
  // productType is the persisted identity of a set. Older rows may have a
  // missing or temporarily unparsed JSON component payload, but must still be
  // visible in Fit Management so the owner can repair its measurements.
  if (product.productType === "SET") return true;
  if (product.productType === "SINGLE") return false;
  return Array.isArray(product.setComponents) && product.setComponents.length >= 2;
}

export function representativeSetCategory(components: readonly Pick<SetProductComponent, "category" | "sortOrder">[] | null | undefined, fallback: SetComponentCategory = "top") {
  const first = [...(components ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  return first?.category ?? fallback;
}

export function sumSetComponentPrices(components: readonly Pick<SetProductComponent, "price">[] | null | undefined) {
  return Math.round((components ?? []).reduce((total, component) => total + Math.max(0, Number(component.price) || 0), 0));
}

export function localizedSetComponentName(component: SetProductComponent, language: string) {
  if (language.startsWith("ko")) return component.nameKo || component.name;
  if (language.startsWith("zh")) return component.nameZh || component.name;
  return component.nameEn || component.name;
}

export function localizedSetComponentCategory(category: SetComponentCategory, language: string) {
  const labels = language.startsWith("ko")
    ? { top: "상의", bottom: "하의", outer: "아우터", dress: "원피스", shoes: "신발", bag: "가방" }
    : language.startsWith("zh")
      ? { top: "上装", bottom: "下装", outer: "外套", dress: "连衣裙", shoes: "鞋履", bag: "包袋" }
      : { top: "Top", bottom: "Bottom", outer: "Outer", dress: "Dress", shoes: "Shoes", bag: "Bag" };
  return labels[category];
}
