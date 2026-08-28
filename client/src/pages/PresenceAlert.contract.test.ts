import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (url: URL) => readFileSync(url, "utf8");

describe("camera presence sound screen", () => {
  it("keeps camera frames local, requires a user gesture, and applies entry-only playback policy", () => {
    const page = read(new URL("./PresenceAlert.tsx", import.meta.url));
    expect(page).toContain("navigator.mediaDevices?.getUserMedia");
    expect(page).toContain("audio: false");
    expect(page).toContain("shouldPlayPresenceSound");
    expect(page).toContain("shouldRearmPresenceSound");
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
