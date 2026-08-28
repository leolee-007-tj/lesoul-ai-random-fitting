export const MIN_PRESENCE_ALERT_REPEATS = 1;
export const MAX_PRESENCE_ALERT_REPEATS = 5;

export function normalizePresenceAlertRepeats(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return MIN_PRESENCE_ALERT_REPEATS;
  return Math.min(MAX_PRESENCE_ALERT_REPEATS, Math.max(MIN_PRESENCE_ALERT_REPEATS, Math.trunc(parsed)));
}

export function shouldStartPresencePlayback(input: { personDetected: boolean; isPlaying: boolean; hasSound: boolean }) {
  return input.personDetected && !input.isPlaying && input.hasSound;
}

export function shouldContinuePresencePlayback(input: { completedPlays: number; repeatCount: number }) {
  return input.completedPlays < normalizePresenceAlertRepeats(input.repeatCount);
}
