import { describe, expect, it } from "vitest";
import { createTestAccessToken, isValidVisitorId, readPersistedVisitorId, verifyTestLogin, VISITOR_ID_COOKIE } from "./testAccess";

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

  it("recovers a valid visitor identifier from the non-authentication cookie", () => {
    const request = { headers: { cookie: `${VISITOR_ID_COOKIE}=visitor_saved_device` } } as any;
    expect(readPersistedVisitorId(request)).toBe("visitor_saved_device");
    expect(readPersistedVisitorId({ headers: { cookie: `${VISITOR_ID_COOKIE}=bad` } } as any)).toBeNull();
  });
});
