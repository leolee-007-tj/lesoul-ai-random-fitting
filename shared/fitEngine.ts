export type StretchLevel = "none" | "low" | "medium" | "high";
export type FitStatus = "RELAXED" | "REGULAR" | "FITTED" | "TIGHT" | "VERY_TIGHT" | "UNLIKELY_TO_FIT";
export type GarmentMeasurements = { shoulderCm?: number | null; bustCm?: number | null; waistCm?: number | null; hipCm?: number | null; sleeveCm?: number | null; totalLengthCm?: number | null; riseCm?: number | null; thighCm?: number | null; inseamCm?: number | null };
export type GarmentSizeOption = GarmentMeasurements & { label: string; available?: boolean };

export type FitBody = { bustCm?: number | null; waistCm?: number | null; hipCm?: number | null; shoulderCm?: number | null };
export type FitAssessment = { status: FitStatus; score: number; limitingArea: "bust" | "waist" | "hip" | "shoulder" | null; easeCm: number | null; reason: string; visualInstruction: string; mayNotFit: boolean; recommendedSize?: string };

const stretchAllowance: Record<StretchLevel, number> = { none: 0, low: 2, medium: 5, high: 8 };
const priorityByCategory: Record<string, Array<[keyof GarmentMeasurements, keyof FitBody, FitAssessment["limitingArea"]]>> = {
  top: [["bustCm", "bustCm", "bust"], ["shoulderCm", "shoulderCm", "shoulder"]],
  outer: [["bustCm", "bustCm", "bust"], ["shoulderCm", "shoulderCm", "shoulder"]],
  bottom: [["waistCm", "waistCm", "waist"], ["hipCm", "hipCm", "hip"]],
  dress: [["bustCm", "bustCm", "bust"], ["waistCm", "waistCm", "waist"], ["hipCm", "hipCm", "hip"]],
  shoes: [], bag: [],
};

export function assessFit(body: FitBody, garment: GarmentMeasurements | null | undefined, category: string, stretch: StretchLevel = "low", silhouette = "regular"): FitAssessment {
  const comparisons = (priorityByCategory[category] ?? []).map(([garmentKey, bodyKey, area]) => {
    const garmentValue = garment?.[garmentKey] as number | null | undefined; const bodyValue = body[bodyKey] as number | null | undefined;
    return garmentValue && bodyValue ? { area, ease: garmentValue - bodyValue + stretchAllowance[stretch] } : null;
  }).filter((item): item is { area: FitAssessment["limitingArea"]; ease: number } => Boolean(item));
  if (!comparisons.length) return { status: "REGULAR", score: 65, limitingArea: null, easeCm: null, reason: "Actual body or garment measurements are not available for this item.", visualInstruction: `Preserve the original ${silhouette} garment silhouette without reshaping the body.`, mayNotFit: false };
  const limiting = comparisons.reduce((lowest, item) => item.ease < lowest.ease ? item : lowest);
  const ease = limiting.ease; const status: FitStatus = ease < -5 ? "UNLIKELY_TO_FIT" : ease < 0 ? "VERY_TIGHT" : ease < 3 ? "TIGHT" : ease < 8 ? "FITTED" : ease < 16 ? "REGULAR" : "RELAXED";
  const score = status === "UNLIKELY_TO_FIT" ? 5 : status === "VERY_TIGHT" ? 20 : status === "TIGHT" ? 40 : status === "FITTED" ? 70 : status === "REGULAR" ? 90 : 85;
  const visualInstruction = status === "UNLIKELY_TO_FIT" ? "Do not shrink or reshape the body. Show that this garment may not close or comfortably fit; preserve its actual design." : status === "VERY_TIGHT" || status === "TIGHT" ? "Maintain the fixed body volume. Represent reduced ease, natural fabric tension, and a tighter silhouette without changing the garment design." : status === "RELAXED" ? "Maintain the original loose or oversized silhouette and natural ease; do not shrink the garment to contour the body." : "Maintain fixed body proportions and the original garment silhouette with natural ease.";
  return { status, score, limitingArea: limiting.area, easeCm: Math.round(ease * 10) / 10, reason: `${limiting.area ? limiting.area[0].toUpperCase() + limiting.area.slice(1) : "Garment"} ease is ${Math.round(ease * 10) / 10} cm after ${stretch} stretch allowance.`, visualInstruction, mayNotFit: status === "UNLIKELY_TO_FIT" };
}

export function assessSizes(body: FitBody, sizes: GarmentSizeOption[] | null | undefined, category: string, stretch: StretchLevel, silhouette = "regular") {
  const assessments = (sizes ?? []).filter((size) => size.available !== false).map((size) => ({ label: size.label, assessment: assessFit(body, size, category, stretch, silhouette) }));
  const recommended = assessments.filter((item) => !item.assessment.mayNotFit).sort((a, b) => Math.abs((a.assessment.easeCm ?? 0) - 10) - Math.abs((b.assessment.easeCm ?? 0) - 10))[0];
  return { assessments, recommendedSize: recommended?.label };
}
