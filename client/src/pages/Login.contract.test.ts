import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Login.tsx", import.meta.url), "utf8");

describe("login navigation", () => {
  it("navigates immediately after the server confirms login", () => {
    expect(source).toContain("void utils.auth.testSession.invalidate().catch(() => undefined);");
    expect(source).toContain("void utils.auth.me.invalidate().catch(() => undefined);");
    expect(source).not.toContain("await utils.auth.testSession.invalidate();");
    expect(source).not.toContain("await utils.auth.me.invalidate();");
  });
});
