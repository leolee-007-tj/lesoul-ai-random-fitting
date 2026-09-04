import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (url: URL) => readFileSync(url, "utf8");

describe("camera presence sound screen", () => {
  it("keeps camera frames local, requires a user gesture, and stops detection for configured playback", () => {
    const page = read(new URL("./PresenceAlert.tsx", import.meta.url));
    expect(page).toContain("navigator.mediaDevices?.getUserMedia");
    expect(page).toContain("audio: false");
    expect(page).toContain("shouldStartPresencePlayback");
    expect(page).toContain("shouldContinuePresencePlayback");
    expect(page).toContain("getTracks().forEach((track) => track.stop())");
    expect(page).toContain("facingMode: { ideal: \"user\" }");
    expect(page).toContain("camera_permission_fallback");
    expect(page).toContain("VIDEO_METADATA_TIMEOUT");
    expect(page).toContain("permissionBlocked");
    expect(page).toContain("modelFailed");
    expect(page).toContain("audio_playback:");
    expect(page).toContain("카메라 다시 시도");
    expect(page).toContain("Safari가 카메라 접근을 차단했습니다");
    expect(page).toContain("HTMLMediaElement.HAVE_CURRENT_DATA");
    expect(page).toContain("Technical details");
    expect(page).toContain("navigator.clipboard?.writeText(technicalError)");
    expect(page).toContain("void audio.play().then");
    expect(page).not.toContain("await audio.play()");
    expect(page).toContain("config.data.repeatCount ?? 1");
    expect(page).toContain("Your camera feed stays on this device");
    expect(page).not.toContain("storagePut");
  });

  it("loads the person detector assets from the deployed application storage", () => {
    const page = read(new URL("./PresenceAlert.tsx", import.meta.url));
    expect(page).toContain("ObjectDetector.createFromOptions");
    expect(page).toContain("categoryAllowlist: [\"person\"]");
    expect(page).toContain("/manus-storage/efficientdet_lite0_uint8_9d794701.tflite");
  });
});
