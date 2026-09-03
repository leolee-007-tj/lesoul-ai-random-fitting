import { getVisitorId } from "./visitor";

/**
 * Privacy-minimized analytics payload. The browser never sends device,
 * operating-system, browser, screen, IP, location, or contact information.
 */
export function getSiteVisitPayload(locale: string, entryPath: string) {
  return {
    visitorId: getVisitorId(),
    locale: locale.startsWith("ko") ? ("ko" as const) : locale.startsWith("zh") ? ("zh" as const) : ("en" as const),
    entryPath: entryPath.slice(0, 160) || "/",
  };
}
