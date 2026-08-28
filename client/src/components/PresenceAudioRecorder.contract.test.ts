import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("owner alert-sound recorder", () => {
  it("uses browser microphone recording and releases microphone tracks when recording stops", () => {
    const component = readFileSync(new URL("./PresenceAudioRecorder.tsx", import.meta.url), "utf8");
    expect(component).toContain("new MediaRecorder(stream)");
    expect(component).toContain("getUserMedia({ audio: true, video: false })");
    expect(component).toContain("reader.readAsDataURL(blob)");
    expect(component).toContain("getTracks().forEach((track) => track.stop())");
  });
});
