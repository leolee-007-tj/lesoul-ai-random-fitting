import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("presence alert owner control", () => {
  it("keeps upload, microphone recording, repeat control, and global ON/OFF inside the protected release-control surface", () => {
    const page = readFileSync(new URL("./ReleaseControl.tsx", import.meta.url), "utf8");
    expect(page).toContain("trpc.uploads.presenceAudio.useMutation");
    expect(page).toContain("trpc.admin.updatePresenceAlertConfig.useMutation");
    expect(page).toContain("PresenceAudioRecorder");
    expect(page).toContain("presenceAlertRepeatCount");
    expect(page).toContain('accept="audio/mpeg,.mp3"');
    expect(page).toContain("maximum 12MB");
    expect(page).toContain("Video is never stored or uploaded");
    expect(page).toContain("toggleSavedSoundPreview");
    expect(page).toContain("presenceUi.enabled");
    expect(page).toContain("bg-emerald-600");
    expect(page).toContain("bg-rose-50");
  });
});
