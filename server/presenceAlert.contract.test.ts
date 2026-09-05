import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { normalizePresenceAlertRepeats, shouldContinuePresencePlayback, shouldStartPresencePlayback } from "../shared/presenceAlert";

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
    expect(admin).toContain("const presenceAlertEnabled = input.presenceAlertEnabled ?? current.presenceAlertEnabled");
  });

  it("scopes the sound URL to the store-display account and supports a local fallback tone", () => {
    const catalog = read(new URL("./routers/catalog.ts", import.meta.url));
    expect(catalog).toContain("presenceAlertConfig: storeDisplayProcedure");
    expect(catalog).toContain("ctx.user.presenceCameraEnabled !== 0");
    expect(catalog).toContain("DEFAULT_PRESENCE_ALERT_SOUND");
    expect(catalog).toContain("presenceAlertHeartbeat: storeDisplayProcedure");
    expect(catalog).toContain("presenceCameraLastSeenAt");
    expect(catalog).toContain("errorStage: z.string().trim().max(96).optional()");
    expect(catalog).toContain("safeErrorStage");
  });

  it("keeps playback bounded and only starts after a person and available sound", () => {
    expect(normalizePresenceAlertRepeats(99)).toBe(5);
    expect(normalizePresenceAlertRepeats(0)).toBe(1);
    expect(shouldStartPresencePlayback({ personDetected: true, isPlaying: false, hasSound: true })).toBe(true);
    expect(shouldStartPresencePlayback({ personDetected: true, isPlaying: false, hasSound: false })).toBe(false);
    expect(shouldContinuePresencePlayback({ completedPlays: 1, repeatCount: 2 })).toBe(true);
    expect(shouldContinuePresencePlayback({ completedPlays: 2, repeatCount: 2 })).toBe(false);
  });

  it("removes camera controls and camera status from the display account manager", () => {
    const operations = read(new URL("./routers/operations.ts", import.meta.url));
    const manager = read(new URL("../client/src/components/StoreDisplayAccountManager.tsx", import.meta.url));
    expect(operations).toContain("updateStoreDisplayCamera: ownerOnlyProcedure");
    expect(manager).not.toContain("updateStoreDisplayCamera");
    expect(manager).not.toContain("카메라 켜짐");
    expect(manager).not.toContain("cameraActive");
    expect(manager).not.toContain("최근 오류");
  });
});
