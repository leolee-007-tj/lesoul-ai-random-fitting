import { describe, expect, it } from "vitest";
import { resolveAiProviderStatus } from "./aiProvider";

describe("resolveAiProviderStatus", () => {
  it("keeps the current Forge service active by default", () => {
    expect(resolveAiProviderStatus("FORGE", false)).toEqual({
      preferred: "FORGE",
      effective: "FORGE",
      configured: true,
      fallbackActive: false,
    });
  });

  it("does not disable Forge when Qwen has not been connected", () => {
    expect(resolveAiProviderStatus("QWEN", false)).toEqual({
      preferred: "QWEN",
      effective: "FORGE",
      configured: false,
      fallbackActive: true,
    });
  });

  it("uses Qwen only after its credentials are configured", () => {
    expect(resolveAiProviderStatus("QWEN", true).effective).toBe("QWEN");
  });
});
