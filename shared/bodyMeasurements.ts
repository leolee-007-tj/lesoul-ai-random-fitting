export type Gender = "female" | "male" | "other";

export type BodyMeasurements = {
  height: number;
  shoulderWidth: number;
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
  armLength?: number | null;
  inseam?: number | null;
  thigh?: number | null;
  gender: Gender;
  unit: "cm";
};

export const defaultBodyMeasurements: BodyMeasurements = {
  height: 163, shoulderWidth: 42, chest: null, waist: null, hip: null, armLength: null, inseam: null, thigh: null, gender: "female", unit: "cm",
};

export type ProductImageAsset = { original: string; studioCut: string; thumbnail: string };
export type ProductImageViews = { front?: ProductImageAsset; back?: ProductImageAsset; side?: ProductImageAsset; detail?: ProductImageAsset[] };
