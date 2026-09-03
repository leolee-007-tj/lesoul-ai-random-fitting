import { useAuth } from "@/_core/hooks/useAuth";
import { getVisitorId, hasExplicitLogout, restoreVisitorId } from "@/lib/visitor";
import { getSiteVisitPayload } from "@/lib/siteAnalytics";
import AnonymousAnalyticsNotice from "@/components/AnonymousAnalyticsNotice";
import { trpc } from "@/lib/trpc";
import { LoaderCircle } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function CustomerGate({ children, allowAdmin = false }: { children: ReactNode; allowAdmin?: boolean }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [location, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const utils = trpc.useUtils();
  const guestLogin = trpc.auth.guestLogin.useMutation();
  const trackSiteVisit = trpc.catalog.trackSiteVisit.useMutation();
  const [visitorId] = useState(() => getVisitorId());
  const trackedVisitDay = useRef("");
  const startedGuestEntry = useRef(false);
  const explicitlyLoggedOut = hasExplicitLogout();

  useEffect(() => {
    if (loading || isAuthenticated || explicitlyLoggedOut || startedGuestEntry.current) return;
    startedGuestEntry.current = true;
    guestLogin.mutateAsync({ visitorId }).then((result) => {
      restoreVisitorId(result.visitorId);
      void utils.auth.testSession.invalidate().catch(() => undefined);
    }).catch(() => {
      startedGuestEntry.current = false;
      navigate(`/login?next=${encodeURIComponent(location)}`);
    });
  }, [explicitlyLoggedOut, guestLogin, isAuthenticated, loading, location, navigate, utils, visitorId]);

  useEffect(() => {
    if (loading || !isAuthenticated || trackedVisitDay.current) return;
    const day = new Date().toISOString().slice(0, 10);
    trackedVisitDay.current = day;
    trackSiteVisit.mutate(getSiteVisitPayload(i18n.language, location));
  }, [i18n.language, isAuthenticated, loading, location, trackSiteVisit]);

  useEffect(() => {
    if (!allowAdmin && !loading && user?.role === "admin" && location !== "/operations") navigate("/operations");
    if (!loading && user?.role === "store_trial" && location !== "/trial-store") navigate("/trial-store");
    if (!loading && user?.role === "store_display" && location !== "/store-display") navigate("/store-display");
  }, [allowAdmin, loading, location, navigate, user?.role]);

  const redirectedRole = (!allowAdmin && user?.role === "admin") || (user?.role === "store_trial" && location !== "/trial-store") || (user?.role === "store_display" && location !== "/store-display");
  useEffect(() => {
    if (!loading && !isAuthenticated && explicitlyLoggedOut && location !== "/login") navigate(`/login?next=${encodeURIComponent(location)}`);
  }, [explicitlyLoggedOut, isAuthenticated, loading, location, navigate]);

  if (loading || explicitlyLoggedOut || !isAuthenticated || guestLogin.isPending || redirectedRole) {
    return <main className="grid min-h-svh place-items-center bg-[#fbfaf8] text-[#5f574f]"><LoaderCircle className="animate-spin" size={22} /><span className="sr-only">{t("dashboard.checkingAccess")}</span></main>;
  }
  const showAnalyticsNotice = user?.role === "user" || user?.role === "vip";
  return <>{children}{showAnalyticsNotice ? <AnonymousAnalyticsNotice /> : null}</>;
}
