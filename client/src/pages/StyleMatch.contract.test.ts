import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./StyleMatch.tsx", import.meta.url), "utf8");

describe("curated outfit purchase-list feedback", () => {
  it("reports the actual added count and excludes unavailable products", () => {
    expect(source).toContain("const availableProducts = selection.products.filter");
    expect(source).toContain("const excludedCount = selection.products.length - availableProducts.length");
    expect(source).toContain("copy.added(purchaseItems.length)");
    expect(source).toContain("copy.excluded(excludedCount)");
    expect(source).toContain("addItems(purchaseItems)");
  });

  it("keeps reservation intent and Korea–Qingdao delivery guidance localized", () => {
    expect(source).toContain("reservationQuestion");
    expect(source).toContain("한국·칭다오 배송은 내외 2~3주 정도 소요됩니다.");
    expect(source).toContain("Korea–Qingdao delivery usually takes about 2–3 weeks.");
    expect(source).toContain("韩国及青岛配送通常约需 2–3 周。");
  });
});
