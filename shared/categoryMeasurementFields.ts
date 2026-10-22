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

export function reorderMeasurementFields(fields: readonly MeasurementFieldKey[], draggedField: MeasurementFieldKey, targetField: MeasurementFieldKey): MeasurementFieldKey[] {
  const sourceIndex = fields.indexOf(draggedField);
  const targetIndex = fields.indexOf(targetField);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return [...fields];
  const next = [...fields];
  next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, draggedField);
  return next;
}

export function moveMeasurementField(fields: readonly MeasurementFieldKey[], field: MeasurementFieldKey, direction: "up" | "down"): MeasurementFieldKey[] {
  const index = fields.indexOf(field);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= fields.length) return [...fields];
  return reorderMeasurementFields(fields, field, fields[targetIndex]);
}

export type CategoryMeasurementValues = Pick<GarmentMeasurements, MeasurementFieldKey>;
