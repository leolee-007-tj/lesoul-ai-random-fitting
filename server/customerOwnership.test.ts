import { describe, expect, it } from "vitest";
import { resolveCustomerVisitorId } from "./_core/trpc";

describe("customer ownership boundary", () => {
  it("allows only the browser-bound visitorId for the NORMAL shared test session", () => {
    const ctx = { user: null, testAccess: { visitorId: "visitor_device_a", expiresAt: Date.now() + 60_000 } } as any;
    expect(resolveCustomerVisitorId(ctx, "visitor_device_a")).toBe("visitor_device_a");
    expect(() => resolveCustomerVisitorId(ctx, "visitor_device_b")).toThrow("VISITOR_OWNERSHIP_MISMATCH");
  });

  it("keeps VIP and OWNER/ADMIN requests on their own authenticated account identity", () => {
    const vip = { user: { id: 21, openId: "vip_unique_user", role: "user" }, testAccess: null } as any;
    const admin = { user: { id: 1, openId: "owner_unique_user", role: "admin" }, testAccess: null } as any;
    expect(resolveCustomerVisitorId(vip, "account:vip_unique_user")).toBe("account:vip_unique_user");
    expect(resolveCustomerVisitorId(admin, "account:owner_unique_user")).toBe("account:owner_unique_user");
    expect(() => resolveCustomerVisitorId(vip, "visitor_device_a")).toThrow("ACCOUNT_OWNERSHIP_MISMATCH");
    expect(() => resolveCustomerVisitorId(admin, "visitor_device_a")).toThrow("ACCOUNT_OWNERSHIP_MISMATCH");
  });
});
