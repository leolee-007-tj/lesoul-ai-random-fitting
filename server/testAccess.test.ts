import { describe, expect, it } from "vitest";
import { createTestAccessToken, isValidVisitorId, verifyTestLogin } from "./testAccess";

describe("shared test access", () => {
  it("validates the configured shared credential on the server and rejects invalid credentials", () => {
    expect(verifyTestLogin("lesoul", "8888")).toBe(true);
    expect(verifyTestLogin("lesoul", "wrong-password")).toBe(false);
  });

  it("binds test access tokens to a stable browser visitor identifier", () => {
    const visitorId = "visitor_test_device_a";
    expect(isValidVisitorId(visitorId)).toBe(true);
    expect(createTestAccessToken(visitorId)).toContain(".");
    expect(isValidVisitorId("ko")).toBe(false);
  });
});
