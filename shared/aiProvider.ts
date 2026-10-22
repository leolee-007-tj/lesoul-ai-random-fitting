export const AI_PROVIDER_PREFERENCES = ["FORGE", "QWEN"] as const;

export type AiProviderPreference = (typeof AI_PROVIDER_PREFERENCES)[number];

export type AiProviderStatus = {
  preferred: AiProviderPreference;
  effective: AiProviderPreference;
  configured: boolean;
  fallbackActive: boolean;
};

/**
 * A provider selection never disables the existing working service when the
 * requested alternative is not configured. This makes the future Qwen switch
 * safe to expose before a China-region API key is supplied.
 */
export function resolveAiProviderStatus(
  preferred: AiProviderPreference,
  isQwenConfigured: boolean,
): AiProviderStatus {
  if (preferred === "QWEN" && isQwenConfigured) {
    return { preferred, effective: "QWEN", configured: true, fallbackActive: false };
  }

  return {
    preferred,
    effective: "FORGE",
    configured: preferred === "FORGE",
    fallbackActive: preferred === "QWEN",
  };
}
