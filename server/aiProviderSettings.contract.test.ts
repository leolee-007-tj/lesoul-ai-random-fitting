import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolveAiProviderStatus } from "../shared/aiProvider";

describe("AI provider settings contract", () => {
  it("keeps Qwen unconfigured on the current no-key deployment", () => {
    expect(resolveAiProviderStatus("QWEN", false)).toMatchObject({
      effective: "FORGE",
      configured: false,
      fallbackActive: true,
    });
  });

  it("restricts provider settings and status to the owner operations router", () => {
    const source = readFileSync(new URL("./routers/operations.ts", import.meta.url), "utf8");
    expect(source).toContain("providerStatus: ownerProcedure");
    expect(source).toContain("aiImageProviderPreference");
    expect(source).toContain("aiTextProviderPreference");
    expect(source).toContain("const qwenConfigured = false");
  });
});
