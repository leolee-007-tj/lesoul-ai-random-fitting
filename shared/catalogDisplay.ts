import type { GarmentMeasurements } from "./fitEngine";

export type CatalogDisplaySettings = {
  manualScale?: number | null;
  objectPositionX?: number | null;
  objectPositionY?: number | null;
};

export type ResolvedCatalogDisplay = CatalogDisplaySettings & {
  autoScale: number;
  effectiveScale: number;
  objectPositionX: number;
  objectPositionY: number;
  measurementKey: keyof GarmentMeasurements | null;
  measurementCm: number | null;
  categoryMedianCm: number | null;
};

type PresentationProduct = {
  category: string;
  garmentMeasurements?: GarmentMeasurements | null;
  catalogDisplay?: CatalogDisplaySettings | null;
};

const CATEGORY_MEASUREMENT_PRIORITY: Record<string, Array<keyof GarmentMeasurements>> = {
  bottom: ["totalLengthCm", "inseamCm", "riseCm"],
  top: ["totalLengthCm", "sleeveCm"],
  outer: ["totalLengthCm", "sleeveCm"],
  dress: ["totalLengthCm"],
  shoes: [],
  bag: [],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function validCentimeters(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 300 ? Math.round(value * 10) / 10 : null;
}

export function primaryCardMeasurement(product: Pick<PresentationProduct, "category" | "garmentMeasurements">) {
  for (const key of CATEGORY_MEASUREMENT_PRIORITY[product.category] ?? []) {
    const centimeters = validCentimeters(product.garmentMeasurements?.[key]);
    if (centimeters) return { key, centimeters };
  }
  return { key: null, centimeters: null } as const;
}

export function median(values: number[]) {
  const sorted = values.filter((value) => Number.isFinite(value) && value > 0).sort((left, right) => left - right);
  if (!sorted.length) return null;
  const center = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[center] : (sorted[center - 1] + sorted[center]) / 2;
}

/**
 * Uses physical length only as a gentle category-local UI cue. It never alters
 * the source pixels, never changes garment measurements, and is intentionally
 * clamped to prevent a technical diagram-like card layout.
 */
export function calculateAutoDisplayScale(measurementCm: number | null, categoryMedianCm: number | null) {
  if (!measurementCm || !categoryMedianCm) return 1;
  const relativeLength = measurementCm / categoryMedianCm;
  return Math.round(clamp(1 + (relativeLength - 1) * 0.28, 0.76, 1.08) * 1000) / 1000;
}

export function resolveCatalogDisplay<T extends PresentationProduct>(products: T[]): Array<T & { catalogDisplay: ResolvedCatalogDisplay }> {
  const medians = new Map<string, number | null>();
  Array.from(new Set(products.map((product) => product.category))).forEach((category) => {
    medians.set(category, median(products.filter((product) => product.category === category).map((product) => primaryCardMeasurement(product).centimeters).filter((value): value is number => value !== null)));
  });
  return products.map((product) => {
    const physical = primaryCardMeasurement(product);
    const categoryMedianCm = medians.get(product.category) ?? null;
    const autoScale = calculateAutoDisplayScale(physical.centimeters, categoryMedianCm);
    const manualScale = validDisplayScale(product.catalogDisplay?.manualScale);
    const objectPositionX = clamp(product.catalogDisplay?.objectPositionX ?? 50, 0, 100);
    const objectPositionY = clamp(product.catalogDisplay?.objectPositionY ?? 50, 0, 100);
    return { ...product, catalogDisplay: { manualScale, autoScale, effectiveScale: manualScale ?? autoScale, objectPositionX, objectPositionY, measurementKey: physical.key, measurementCm: physical.centimeters, categoryMedianCm } };
  });
}

export function validDisplayScale(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(clamp(value, 0.7, 1.1) * 1000) / 1000 : null;
}

export function formatKeyMeasurement(product: Pick<PresentationProduct, "category" | "garmentMeasurements">, locale: string) {
  const physical = primaryCardMeasurement(product);
  if (!physical.key || !physical.centimeters) return null;
  const labels = locale.startsWith("ko")
    ? { totalLengthCm: "총장", inseamCm: "인심", riseCm: "밑위", sleeveCm: "소매" }
    : locale.startsWith("zh")
      ? { totalLengthCm: "衣长", inseamCm: "内长", riseCm: "裆长", sleeveCm: "袖长" }
      : { totalLengthCm: "Length", inseamCm: "Inseam", riseCm: "Rise", sleeveCm: "Sleeve" };
  const label = labels[physical.key as keyof typeof labels] ?? (locale.startsWith("ko") ? "실측" : locale.startsWith("zh") ? "实测" : "Measured");
  return `${label} ${physical.centimeters}cm`;
}
