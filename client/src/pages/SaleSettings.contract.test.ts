import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (url: URL) => readFileSync(url, "utf8");

describe("dedicated sale settings entry", () => {
  it("keeps the storewide sale selector owner-only and makes its immediate effect explicit", () => {
    const page = read(new URL("./SaleSettings.tsx", import.meta.url));
    expect(page).toContain("trpc.operations.ownerStatus.useQuery()");
    expect(page).toContain("A seasonal format immediately replaces every product's selected base discount");
    expect(page).toContain('mode: "SEASON_FORMAT_1"');
    expect(page).toContain('mode: "SEASON_FORMAT_2"');
    expect(page).toContain('mode: "SEASON_FORMAT_3"');
    expect(page).toContain("updateReleaseConfig.useMutation");
    expect(page).toContain("excludeNewArrivalsFromSale");
    expect(page).toContain("신상품은 시즌 세일에서 제외");
  });

  it("keeps the release-control editor wired to the same exclusion setting", () => {
    const release = read(new URL("./ReleaseControl.tsx", import.meta.url));
    expect(release).toContain('toggle(c.excludeNew, "excludeNewArrivalsFromSale")');
    expect(release).toContain("excludeNewArrivalsFromSale: Number");
  });

  it("registers a dedicated administrator route and an operations entry button", () => {
    const app = read(new URL("../App.tsx", import.meta.url));
    const operations = read(new URL("./OperationsDashboard.tsx", import.meta.url));
    expect(app).toContain('path={"/sale-settings"}');
    expect(app).toContain("<AdminGate><SaleSettings /></AdminGate>");
    expect(operations).toContain('href="/sale-settings"');
    expect(operations).toContain('"세일 설정"');
  });
});
