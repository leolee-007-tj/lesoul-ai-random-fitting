export const PRESENCE_REARM_AFTER_MS = 3_000;

export function shouldPlayPresenceSound(input: { personDetected: boolean; isLatched: boolean; hasSound: boolean }) {
  return input.personDetected && !input.isLatched && input.hasSound;
}

export function shouldRearmPresenceSound(input: { personDetected: boolean; absentSince: number | null; now: number }) {
  return !input.personDetected && input.absentSince !== null && input.now - input.absentSince >= PRESENCE_REARM_AFTER_MS;
}
