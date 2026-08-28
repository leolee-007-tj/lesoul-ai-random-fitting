import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (url: URL) => readFileSync(url, "utf8");

describe("presence alert server contract", () => {
  it("uses owner-only MP3 or browser recording upload and persists only alert settings", () => {
    const uploads = read(new URL("./routers/uploads.ts", import.meta.url));
    const admin = read(new URL("./routers/admin.ts", import.meta.url));
    expect(uploads).toContain("presenceAudio: ownerOnlyProcedure");
    expect(uploads).toContain("Only MP3 uploads and browser-recorded audio can be uploaded.");
    expect(admin).toContain("updatePresenceAlertConfig: ownerProcedure");
    expect(admin).toContain("presenceAlertSoundUrl");
    expect(admin).toContain("presenceAlertRepeatCount");
  });

  it("exposes a sound URL only while the global feature is enabled", () => {
    const catalog = read(new URL("./routers/catalog.ts", import.meta.url));
    expect(catalog).toContain("presenceAlertConfig: publicProcedure");
    expect(catalog).toContain("settings.presenceAlertEnabled && settings.presenceAlertSoundUrl");
    expect(catalog).toContain("soundUrl: enabled ? settings.presenceAlertSoundUrl : null");
    expect(catalog).toContain("repeatCount: Math.min(5, Math.max(1, settings.presenceAlertRepeatCount ?? 1))");
  });
});
