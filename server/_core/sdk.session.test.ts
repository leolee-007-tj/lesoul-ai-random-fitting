import { describe, expect, it } from "vitest";
import { sdk } from "./sdk";

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
