export type ValidationStatus = "not_enabled" | "pending" | "passed" | "acceptable" | "retry_recommended" | "failed";

export type GenerationValidationResult = {
  status: ValidationStatus;
  garmentPreservationScore: number | null;
  identityPreservationScore: number | null;
  overallQualityScore: number | null;
  details: Record<string, unknown> | null;
  evaluator: "not_configured" | "vision";
};

export type GenerationValidationInput = {
  resultImageUrl: string;
  userImageUrl: string;
  productIds: number[];
  poseId: number;
  backgroundId: number;
};

export function validationNotEnabled(): GenerationValidationResult {
  return { status: "not_enabled", garmentPreservationScore: null, identityPreservationScore: null, overallQualityScore: null, details: null, evaluator: "not_configured" };
}

/**
 * Boundary reserved for a future Vision evaluator. It intentionally emits no
 * synthetic quality scores until an actual vision model is connected.
 */
export async function validateGeneratedLook(_input: GenerationValidationInput): Promise<GenerationValidationResult> {
  return validationNotEnabled();
}
