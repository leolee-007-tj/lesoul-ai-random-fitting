import { describe, expect, it, vi } from "vitest";
import { sdk } from "./sdk";

// Isolated test configuration; never depend on a real Manus signing secret.
vi.mock("./env", async (importOriginal) => {
  const original = await importOriginal<typeof import("./env")>();
  return { ...original, ENV: { ...original.ENV, cookieSecret: "local-unit-test-signing-value", appId: "local-unit-test-app" } };
});

describe("OAuth session verification", () => {
  it("accepts a valid OAuth identity when the provider does not supply a display name", async () => {
    const token = await sdk.createSessionToken("owner-without-profile-name", { name: "" });
    await expect(sdk.verifySession(token)).resolves.toMatchObject({
      openId: "owner-without-profile-name",
      appId: expect.any(String),
      name: "",
    });
  });
});
