import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("presence alert owner control", () => {
  it("keeps MP3 upload and global ON/OFF inside the protected release-control surface", () => {
    const page = readFileSync(new URL("./ReleaseControl.tsx", import.meta.url), "utf8");
    expect(page).toContain("trpc.uploads.presenceAudio.useMutation");
    expect(page).toContain("trpc.admin.updatePresenceAlertConfig.useMutation");
    expect(page).toContain('accept="audio/mpeg,.mp3"');
    expect(page).toContain("maximum 12MB");
    expect(page).toContain("Video is never stored or uploaded");
  });
});
