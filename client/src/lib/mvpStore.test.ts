import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearHistory, readHistory, removeHistoryByIds, replaceHistory, saveHistory, setHistoryScope, type LookHistory } from "./mvpStore";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const look = (id: string): LookHistory => ({ id, imageUrl: `https://example.invalid/${id}.jpg`, pose: "Natural Standing", background: "Paris Cafe", style: "MINIMAL", productNames: [id], products: [], createdAt: "2026-08-19T00:00:00.000Z", language: "en", adjustmentParams: {}, shareUrl: null, selectedStylistLookId: null, stylistCandidates: [] });

describe("My Looks locale-independent storage", () => {
  beforeEach(() => { vi.stubGlobal("localStorage", new MemoryStorage()); setHistoryScope("normal:legacy"); });

  it("migrates legacy locale keys only once and deduplicates by lookId", () => {
    localStorage.setItem("myLooks_ko", JSON.stringify([look("LOOK_A"), look("LOOK_B")]));
    localStorage.setItem("myLooks_zh", JSON.stringify([look("LOOK_A")]));
    expect(readHistory().map((item) => item.id)).toEqual(["LOOK_A", "LOOK_B"]);
    expect(localStorage.getItem("myLooks_ko")).toBeNull();
    expect(localStorage.getItem("myLooks_zh")).toBeNull();
  });

  it("does not revive a deleted look when language-specific legacy data appears later", () => {
    replaceHistory([look("LOOK_A"), look("LOOK_B")]);
    removeHistoryByIds(["LOOK_A"]);
    localStorage.setItem("myLooks_zh", JSON.stringify([look("LOOK_A")]));
    expect(readHistory().map((item) => item.id)).toEqual(["LOOK_B"]);
  });

  it("removes selected IDs and clearHistory leaves an empty persistent source of truth", () => {
    saveHistory(look("LOOK_A")); saveHistory(look("LOOK_B")); saveHistory(look("LOOK_C"));
    removeHistoryByIds(["LOOK_A", "LOOK_C"]);
    expect(readHistory().map((item) => item.id)).toEqual(["LOOK_B"]);
    clearHistory();
    expect(readHistory()).toEqual([]);
  });

  it("never migrates NORMAL browser looks into a VIP or administrator account scope", () => {
    saveHistory(look("NORMAL_LOOK"));
    setHistoryScope("account:vip:unique-account");
    expect(readHistory()).toEqual([]);
    saveHistory(look("VIP_LOOK"));
    setHistoryScope("normal:legacy");
    expect(readHistory().map((item) => item.id)).toEqual(["NORMAL_LOOK"]);
  });
});
