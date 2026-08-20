import type { GarmentMeasurements } from "./fitEngine";
import type { BaseCategory } from "./productCategories";

export const MEASUREMENT_FIELD_KEYS = ["shoulderCm", "bustCm", "waistCm", "hipCm", "sleeveCm", "totalLengthCm", "riseCm", "thighCm", "inseamCm"] as const;
export type MeasurementFieldKey = (typeof MEASUREMENT_FIELD_KEYS)[number];

const DEFAULT_FIELDS: Record<BaseCategory, MeasurementFieldKey[]> = {
  TOP: ["shoulderCm", "bustCm", "sleeveCm", "totalLengthCm"],
  PANTS: ["waistCm", "hipCm", "riseCm", "thighCm", "inseamCm", "totalLengthCm"],
  JACKET: ["shoulderCm", "bustCm", "sleeveCm", "totalLengthCm"],
  DRESS: ["shoulderCm", "bustCm", "waistCm", "hipCm", "sleeveCm", "totalLengthCm"],
  SHOES: ["totalLengthCm"],
  BAG: ["totalLengthCm"],
};

export function defaultMeasurementFields(baseCategory: BaseCategory): MeasurementFieldKey[] {
  return [...DEFAULT_FIELDS[baseCategory]];
}

export function normalizeMeasurementFields(fields: readonly string[] | null | undefined, baseCategory: BaseCategory): MeasurementFieldKey[] {
  const valid = (fields ?? []).filter((field): field is MeasurementFieldKey => (MEASUREMENT_FIELD_KEYS as readonly string[]).includes(field));
  return valid.length ? valid.filter((field, index) => valid.indexOf(field) === index) : defaultMeasurementFields(baseCategory);
}

export function categoryMeasurementFields(category: { baseCategory: BaseCategory; measurementFields?: readonly string[] | null } | null | undefined): MeasurementFieldKey[] {
  return category ? normalizeMeasurementFields(category.measurementFields, category.baseCategory) : defaultMeasurementFields("TOP");
}

export type CategoryMeasurementValues = Pick<GarmentMeasurements, MeasurementFieldKey>;
