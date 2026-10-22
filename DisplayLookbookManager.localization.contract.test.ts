import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("./DisplayLookbookManager.tsx", import.meta.url), "utf8");
describe("localized lookbook UI", () => {
  it("localizes every outfit option and tab", () => {
    expect(source).toContain("topOnly");
    expect(source).toContain("bottomOnly");
    expect(source).toContain("topTab");
    expect(source).toContain("sceneCopy");
  });
  it("does not render raw scene descriptions or composition labels", () => {
    expect(source).toContain("sceneFor(image)");
    expect(source).toContain("compositionFor(image)");
  });
});
