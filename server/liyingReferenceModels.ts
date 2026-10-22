import { getCentralSettings } from "./aiUsageController";
import { FIXED_MODELS, type FixedModelKey } from "../shared/fixedModels";

export const LIYING_REFERENCE_MODEL_KEYS = ["petite", "balanced", "volume"] as const satisfies readonly FixedModelKey[];
export type LiyingReferenceImageUrls = Partial<Record<FixedModelKey, string | null>>;

export async function getLiyingReferenceImageUrls(): Promise<LiyingReferenceImageUrls> {
  const settings = await getCentralSettings();
  return settings.liyingReferenceImageUrls ?? {};
}

export function resolveLiyingReferenceImageUrl(key: FixedModelKey, uploadedUrls: LiyingReferenceImageUrls) {
  return uploadedUrls[key] || FIXED_MODELS.find((model) => model.key === key)?.imageUrl || null;
}
