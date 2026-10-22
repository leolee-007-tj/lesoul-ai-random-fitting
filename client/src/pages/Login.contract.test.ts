import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Login.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("login navigation", () => {
  it("offers credential-free normal entry and restores the visitor scope", () => {
    expect(source).toContain("trpc.auth.guestLogin.useMutation()");
    expect(source).toContain("restoreVisitorId(result.visitorId);");
    expect(source).toContain("t(\"auth.guestSubmit\")");
    expect(source).toContain('item === "normal" ? "normalTab"');
  });

  it("restores VIP, store-display, and store-trial credential entry without changing server-side verification", () => {
    expect(source).toContain('type LoginMode = "normal" | "vip" | "trial" | "display" | "admin"');
    expect(source).toContain("trpc.auth.vipLogin.useMutation()");
    expect(source).toContain("trpc.auth.trialStoreLogin.useMutation()");
    expect(source).toContain("trpc.auth.storeDisplayLogin.useMutation()");
    expect(source).toContain('item === "vip" ? "vipTab"');
    expect(source).toContain('item === "trial" ? "trialTab"');
    expect(source).toContain('item === "display" ? displayCopy.tab');
    expect(source).toContain("navigate(\"/trial-store\")");
    expect(router).toContain("vipLogin:");
    expect(router).toContain("trialStoreLogin:");
    expect(router).toContain("storeDisplayLogin:");
  });

  it("keeps the administrator credential form separate from customer accounts", () => {
    expect(source).toContain("trpc.auth.adminLogin.useMutation()");
    expect(source).toContain('"adminTab"');
    expect(router).toContain("adminLogin:");
  });

  it("exposes connected owner authentication from the ADMIN tab", () => {
    expect(source).toContain('import { startLogin } from "@/const";');
    expect(source).toContain('startLogin("/operations")');
    expect(source).toContain('t("auth.ownerSubmit")');
  });

  it("preserves the existing role-specific routes and navigation guards", () => {
    const gate = readFileSync(new URL("../components/CustomerGate.tsx", import.meta.url), "utf8");
    const nav = readFileSync(new URL("../components/MobileBottomNav.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/AppHeader.tsx", import.meta.url), "utf8");
    expect(gate).toContain('user?.role === "store_trial"');
    expect(gate).toContain('navigate("/trial-store")');
    expect(nav).toContain('const isTrial = user?.role === "store_trial"');
    expect(nav).toContain('href: "/trial-store"');
    expect(header).toContain('path: "/account-management"');
  });

  it("navigates immediately after the server confirms login", () => {
    expect(source).toContain("void utils.auth.testSession.invalidate().catch(() => undefined);");
    expect(source).toContain("void utils.auth.me.invalidate().catch(() => undefined);");
    expect(source).toContain("void utils.auth.me.refetch().catch(() => undefined);");
    expect(source).toContain("restoreVisitorId(result.visitorId);");
    expect(source).not.toContain("await utils.auth.testSession.invalidate();");
    expect(source).not.toContain("await utils.auth.me.invalidate();");
  });

  it("redirects an already-authenticated session away from the login screen", () => {
    expect(source).toContain("const auth = useAuth();");
    expect(source).toContain('window.location.pathname !== "/login"');
    expect(source).toContain('auth.user?.role === "admin" ? "/operations"');
    expect(source).toContain('auth.user?.role === "store_trial" ? "/trial-store"');
    expect(source).toContain('auth.user?.role === "store_display" ? "/store-display"');
    expect(source).toContain('next !== "/login"');
    expect(source).toContain('!next.startsWith("/login?")');
  });

  it("clears explicit logout state when normal entry succeeds", () => {
    expect(source).toContain('import { clearExplicitLogout, getVisitorId, restoreVisitorId } from "@/lib/visitor";');
    expect(source).toContain("clearExplicitLogout();");
  });

  it("routes explicit logout away from CustomerGate and blocks immediate guest recreation", () => {
    const gate = readFileSync(new URL("../components/CustomerGate.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("../components/AppHeader.tsx", import.meta.url), "utf8");
    const auth = readFileSync(new URL("../_core/hooks/useAuth.ts", import.meta.url), "utf8");
    expect(gate).toContain("hasExplicitLogout");
    expect(gate).toContain('location !== "/login"');
    expect(header).toContain('navigate(`/login?next=${encodeURIComponent(location || "/")}`)');
    expect(auth).toContain("markExplicitLogout();");
  });
});
