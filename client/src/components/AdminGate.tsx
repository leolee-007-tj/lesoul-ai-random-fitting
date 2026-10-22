import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LoaderCircle } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import AdminTrialExpiredDialog from "./AdminTrialExpiredDialog";

export default function AdminGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  const owner = trpc.operations.ownerStatus.useQuery(undefined, { enabled: !loading && isAuthenticated, retry: false });
  const isOwner = Boolean(owner.data?.isOwner);
  const trial = trpc.adminTrial.status.useQuery(undefined, { enabled: !loading && isAuthenticated && user?.role === "admin" && !isOwner, retry: false });
  const hasAdminAccess = user?.role === "admin" || isOwner;

  useEffect(() => {
    if (loading || owner.isLoading) return;
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location)}`);
      return;
    }
    if (!hasAdminAccess) navigate("/");
  }, [hasAdminAccess, isAuthenticated, loading, location, navigate, owner.isLoading]);

  if (loading || !isAuthenticated || !hasAdminAccess || owner.isLoading || (!isOwner && trial.isLoading)) {
    return <main className="grid min-h-svh place-items-center bg-[#fbfaf8] text-[#5f574f]"><LoaderCircle className="animate-spin" size={22} /><span className="sr-only">{t("dashboard.checkingAdmin")}</span></main>;
  }
  if (!isOwner && trial.data?.status === "expired") return <AdminTrialExpiredDialog trial={trial.data} />;
  return <>{children}</>;
}
