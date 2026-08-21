import { describe, expect, it } from "vitest";
import { resolveAdminTrialWindow } from "./adminTrial";

describe("administrator-only trial window", () => {
  const start = new Date("2026-08-21T00:00:00.000Z");

  it("remains active strictly before the configured two-day expiry", () => {
    const result = resolveAdminTrialWindow(start, 48, new Date("2026-08-22T23:59:59.999Z").getTime());
    expect(result.status).toBe("active");
    expect(result.remainingMs).toBe(1);
  });

  it("expires at 48 hours without relying on a scheduled timer", () => {
    const result = resolveAdminTrialWindow(start, 48, new Date("2026-08-23T00:00:00.000Z").getTime());
    expect(result.status).toBe("expired");
    expect(result.remainingMs).toBe(0);
  });
});
