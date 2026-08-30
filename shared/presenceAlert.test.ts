import { describe, expect, it } from "vitest";
import { MAX_PRESENCE_ALERT_REPEATS, normalizePresenceAlertRepeats, shouldContinuePresencePlayback, shouldStartPresencePlayback } from "./presenceAlert";

describe("camera presence alert policy", () => {
  it("starts playback only for a detected person with configured audio", () => {
    expect(shouldStartPresencePlayback({ personDetected: true, isPlaying: false, hasSound: true })).toBe(true);
    expect(shouldStartPresencePlayback({ personDetected: true, isPlaying: true, hasSound: true })).toBe(false);
    expect(shouldStartPresencePlayback({ personDetected: true, isPlaying: false, hasSound: false })).toBe(false);
  });

  it("bounds repeat count and stops exactly after the configured number of plays", () => {
    expect(normalizePresenceAlertRepeats(0)).toBe(1);
    expect(normalizePresenceAlertRepeats(999)).toBe(MAX_PRESENCE_ALERT_REPEATS);
    expect(shouldContinuePresencePlayback({ completedPlays: 1, repeatCount: 2 })).toBe(true);
    expect(shouldContinuePresencePlayback({ completedPlays: 2, repeatCount: 2 })).toBe(false);
  });
});
