import { useAuth } from "@/_core/hooks/useAuth";
import SaleAnnouncement from "@/components/SaleAnnouncement";
import { LoaderCircle } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function StoreDisplayGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate("/login?next=/store-display");
    else if (user?.role !== "store_display") navigate(user?.role === "admin" ? "/operations" : "/");
  }, [isAuthenticated, loading, navigate, user?.role]);

  if (loading || !isAuthenticated || user?.role !== "store_display") return <main className="grid min-h-svh place-items-center bg-[#fbfaf8] text-[#5f574f]"><LoaderCircle className="animate-spin" size={22} /><span className="sr-only">{t("dashboard.checkingDisplay")}</span></main>;
  return <><SaleAnnouncement />{children}</>;
}
