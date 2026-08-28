import { describe, expect, it } from "vitest";
import { PRESENCE_REARM_AFTER_MS, shouldPlayPresenceSound, shouldRearmPresenceSound } from "./presenceAlert";

describe("camera presence alert policy", () => {
  it("plays only on a new person entry when a sound is configured", () => {
    expect(shouldPlayPresenceSound({ personDetected: true, isLatched: false, hasSound: true })).toBe(true);
    expect(shouldPlayPresenceSound({ personDetected: true, isLatched: true, hasSound: true })).toBe(false);
    expect(shouldPlayPresenceSound({ personDetected: true, isLatched: false, hasSound: false })).toBe(false);
  });

  it("requires a sustained absence before rearming", () => {
    expect(shouldRearmPresenceSound({ personDetected: false, absentSince: 100, now: 100 + PRESENCE_REARM_AFTER_MS - 1 })).toBe(false);
    expect(shouldRearmPresenceSound({ personDetected: false, absentSince: 100, now: 100 + PRESENCE_REARM_AFTER_MS })).toBe(true);
    expect(shouldRearmPresenceSound({ personDetected: true, absentSince: 100, now: 100 + PRESENCE_REARM_AFTER_MS + 1 })).toBe(false);
  });
});
