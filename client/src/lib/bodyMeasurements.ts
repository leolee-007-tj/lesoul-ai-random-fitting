import { defaultBodyMeasurements, type BodyMeasurements, type Gender } from "@shared/bodyMeasurements";

export const bodyMeasurementsKey = "lesoul-body-measurements";
export const studioPhotoKey = "lesoul-studio-photo";

export function readBodyMeasurements(): BodyMeasurements {
  try {
    const parsed = JSON.parse(localStorage.getItem(bodyMeasurementsKey) ?? "{}") as Partial<BodyMeasurements>;
    return { ...defaultBodyMeasurements, ...parsed, unit: "cm", gender: "female" };
  } catch { return defaultBodyMeasurements; }
}

export function saveBodyMeasurements(measurements: BodyMeasurements) { localStorage.setItem(bodyMeasurementsKey, JSON.stringify({ ...measurements, unit: "cm", gender: "female" })); }
export function saveStudioPhoto(photo: string) { sessionStorage.setItem(studioPhotoKey, photo); }
export function readStudioPhoto() { return sessionStorage.getItem(studioPhotoKey); }

export const measurementRanges = {
  height: [140, 200], shoulderWidth: [30, 55], chest: [70, 130], waist: [55, 110], hip: [75, 130], armLength: [45, 75], inseam: [60, 90], thigh: [40, 70],
} as const;

export function validateMeasurements(measurements: BodyMeasurements) {
  const entries = Object.entries(measurementRanges) as Array<[keyof typeof measurementRanges, readonly [number, number]]>;
  const errors = entries.flatMap(([key, [min, max]]) => { const value = measurements[key as keyof BodyMeasurements]; return value != null && (typeof value !== "number" || value < min || value > max) ? [key] : []; });
  return { valid: errors.length === 0, errors };
}

export function normalizeGender(_value: string): Gender { return "female"; }
