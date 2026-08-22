import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("original-quality product upload contract", () => {
  it("uploads the selected production product file without browser-side compression", () => {
    const manager = source("client/src/pages/ProductManagerV2.tsx");
    expect(manager).toContain("reader.readAsDataURL(file)");
    expect(manager).not.toContain("compressProductImage");
    expect(manager).not.toContain("productImageCompression");
  });

  it("uploads the selected isolated trial-store file without browser-side compression", () => {
    const trialStore = source("client/src/pages/TrialStoreConsole.tsx");
    expect(trialStore).toContain("reader.readAsDataURL(file)");
    expect(trialStore).not.toContain("compressProductImage");
    expect(trialStore).not.toContain("productImageCompression");
  });
});
