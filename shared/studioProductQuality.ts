export const studioQualityWarningCodes = ["BACKGROUND_NOT_PURE_WHITE", "GARMENT_DETAILS_CHANGED", "FRAMING_CHANGED", "OUTPUT_ARTIFACTS", "LOW_CONFIDENCE", "ASSESSMENT_UNAVAILABLE"] as const;
export type StudioQualityWarningCode = (typeof studioQualityWarningCodes)[number];

export type StudioImageQuality = {
  status: "PASS" | "WARNING";
  confidence: number;
  warningCodes: StudioQualityWarningCode[];
};

export function normaliseStudioImageQuality(input: Partial<StudioImageQuality>): StudioImageQuality {
  const confidence = Math.max(0, Math.min(100, Math.round(Number(input.confidence) || 0)));
  const warningCodes = Array.from(new Set((input.warningCodes ?? []).filter((code): code is StudioQualityWarningCode => (studioQualityWarningCodes as readonly string[]).includes(code))));
  if (confidence < 75 && !warningCodes.includes("LOW_CONFIDENCE")) warningCodes.push("LOW_CONFIDENCE");
  return { status: warningCodes.length ? "WARNING" : "PASS", confidence, warningCodes };
}
