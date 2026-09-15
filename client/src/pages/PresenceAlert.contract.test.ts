import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const display = readFileSync(new URL("./StoreDisplayCatalog.tsx", import.meta.url), "utf8");

describe("camera feature removal", () => {
  it("removes the camera-greeting route and component from the app", () => {
    expect(app).not.toContain("PresenceAlert");
    expect(app).not.toContain("camera-greeting");
  });

  it("keeps the Store Display catalog camera-free", () => {
    expect(display).not.toContain("getUserMedia");
    expect(display).not.toContain("runPreflight");
  });
});
