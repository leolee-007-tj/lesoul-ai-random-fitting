export const MIN_PRESENCE_ALERT_REPEATS = 1;
export const MAX_PRESENCE_ALERT_REPEATS = 5;

// Short in-app fallback tone. It is not uploaded or persisted; it only lets the
// owner verify camera detection before uploading a custom MP3 or recording.
export const DEFAULT_PRESENCE_ALERT_SOUND = "data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAEkA4QAtAakAT/+7/eT8jP2//6ICxgTdBHsCcf6Q+tn4c/r9/pAEhQi/CL8EEv639830Bve8/QsGlgufC2oGiP6h98j0G/dT/XkESQm0Cb8FZ/+l+Qj3k/hb/Q8DEQeuB9QEAAB8+0f5OPqp/eMB9ASTBa4DUgAh/YH7Bfw7/vkA9wJqA1ECXgCP/q399f0P/1IAIQE5AcEAIwDE/8b/";

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
