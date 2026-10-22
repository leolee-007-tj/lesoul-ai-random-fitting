const KEY = "lesoul-visitor-id";
const EXPLICIT_LOGOUT_KEY = "lesoul-explicit-logout";

export function isValidVisitorId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{8,96}$/.test(value);
}

export function getVisitorId() {
  const current = window.localStorage.getItem(KEY);
  if (isValidVisitorId(current)) return current;
  const created = `visitor_${crypto.randomUUID()}`;
  window.localStorage.setItem(KEY, created);
  return created;
}

export function markExplicitLogout() {
  try { window.localStorage.setItem(EXPLICIT_LOGOUT_KEY, "1"); } catch {}
}

export function clearExplicitLogout() {
  try { window.localStorage.removeItem(EXPLICIT_LOGOUT_KEY); } catch {}
}

export function hasExplicitLogout() {
  try { return window.localStorage.getItem(EXPLICIT_LOGOUT_KEY) === "1"; } catch { return false; }
}

/** Rehydrates the browser key after a storage reset using the server-confirmed visitor identity. */
export function restoreVisitorId(visitorId: unknown) {
  if (!isValidVisitorId(visitorId)) return false;
  window.localStorage.setItem(KEY, visitorId);
  return true;
}

export function getScopedStorageKey(base: string, ownerId: string) {
  return `${base}:${encodeURIComponent(ownerId)}`;
}

export function getClientOwnerId(openId?: string | null) {
  return openId ? `account:${openId}` : getVisitorId();
}

export function getAcquisitionSource() {
  const value = new URLSearchParams(window.location.search).get("source");
  return value === "wechat_moments" || value === "admin_test" ? value : "direct";
}
