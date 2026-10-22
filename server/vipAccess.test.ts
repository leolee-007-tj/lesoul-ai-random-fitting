import { describe, expect, it } from "vitest";
import { hashVipPassword, normalizeVipUsername, verifyVipPassword } from "./vipAccess";

describe("VIP account credential security", () => {
  it("normalizes a unique VIP ID without changing its password semantics", () => {
    expect(normalizeVipUsername(" Customer.01 ")).toBe("customer.01");
  });

  it("uses a salted server-side hash and rejects incorrect credentials", () => {
    const password = "vip-secret-9876";
    const hash = hashVipPassword(password);
    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain(password);
    expect(verifyVipPassword(password, hash)).toBe(true);
    expect(verifyVipPassword("wrong-password", hash)).toBe(false);
  });
});
