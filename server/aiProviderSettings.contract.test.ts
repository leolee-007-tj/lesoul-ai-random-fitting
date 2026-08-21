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

  it("keeps raw provider credentials out of application routes and client panels", () => {
    const operations = readFileSync(new URL("./routers/operations.ts", import.meta.url), "utf8");
    const panel = readFileSync(new URL("../client/src/components/AiProviderPanel.tsx", import.meta.url), "utf8");
    expect(operations).not.toContain("OPENAI_API_KEY");
    expect(operations).not.toContain("ALIBABA_QWEN_API_KEY");
    expect(panel).not.toContain('type="password"');
    expect(panel).toContain("secureKey");
  });
});
