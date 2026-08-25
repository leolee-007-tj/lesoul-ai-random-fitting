import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearExplicitLogout, getScopedStorageKey, hasExplicitLogout, isValidVisitorId, markExplicitLogout } from "./visitor";

describe("visitor identity recovery", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => { storage.set(key, value); }, removeItem: (key: string) => { storage.delete(key); } } });
  });

  it("accepts stable visitor identifiers and rejects short or unsafe values", () => {
    expect(isValidVisitorId("visitor_saved_device")).toBe(true);
    expect(isValidVisitorId("visitor")).toBe(false);
    expect(isValidVisitorId("visitor/other")).toBe(false);
  });

  it("scopes browser data by owner identity rather than language", () => {
    expect(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device")).toBe("lesoulPurchaseList:visitor_saved_device");
    expect(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device")).toBe(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device"));
    expect(getScopedStorageKey("lesoulPurchaseList", "account:vip_123")).not.toBe(getScopedStorageKey("lesoulPurchaseList", "visitor_saved_device"));
  });

  it("marks explicit logout without deleting the stable visitor identity", () => {
    storage.set("lesoul-visitor-id", "visitor_saved_device");
    markExplicitLogout();
    expect(hasExplicitLogout()).toBe(true);
    expect(storage.get("lesoul-visitor-id")).toBe("visitor_saved_device");
    clearExplicitLogout();
    expect(hasExplicitLogout()).toBe(false);
    expect(storage.get("lesoul-visitor-id")).toBe("visitor_saved_device");
  });
});
