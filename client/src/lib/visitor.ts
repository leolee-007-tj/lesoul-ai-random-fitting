const KEY = "lesoul-visitor-id";

export function getVisitorId() {
  const current = window.localStorage.getItem(KEY);
  if (current) return current;
  const created = `visitor_${crypto.randomUUID()}`;
  window.localStorage.setItem(KEY, created);
  return created;
}

export function getAcquisitionSource() {
  const value = new URLSearchParams(window.location.search).get("source");
  return value === "wechat_moments" || value === "admin_test" ? value : "direct";
}
