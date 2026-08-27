import { describe, expect, it } from "vitest";
import { resolveOAuthUserRole } from "./db";

describe("owner OAuth role resolution", () => {
  it("promotes the configured owner even when the OAuth profile carries no role", () => {
    expect(resolveOAuthUserRole("owner-open-id", undefined, undefined, "owner-open-id")).toMatchObject({
      isConfiguredOwner: true,
      isPrimaryOwner: true,
      role: "admin",
    });
  });

  it("never demotes an established primary owner during a generic OAuth refresh", () => {
    expect(resolveOAuthUserRole("owner-open-id", { role: "admin", isPrimaryAdmin: 1 }, undefined, "")).toMatchObject({
      isConfiguredOwner: false,
      isPrimaryOwner: true,
      role: "admin",
    });
  });

  it("preserves non-owner account roles without granting administrator access", () => {
    expect(resolveOAuthUserRole("vip-open-id", { role: "vip", isPrimaryAdmin: 0 }, undefined, "owner-open-id")).toMatchObject({
      isConfiguredOwner: false,
      isPrimaryOwner: false,
      role: "vip",
    });
  });
});
