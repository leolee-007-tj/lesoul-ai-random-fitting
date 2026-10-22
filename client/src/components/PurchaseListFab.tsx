import { usePurchaseList } from "@/contexts/PurchaseListContext";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PurchaseListFab() {
  const { itemCount } = usePurchaseList(); const [location, navigate] = useLocation(); const { i18n } = useTranslation(); const { user } = useAuth();
  if (user?.role === "admin" || location === "/login" || location === "/setup-admin" || location.startsWith("/catalog")) return null;
  const label = i18n.language.startsWith("ko") ? "구매목록" : i18n.language.startsWith("zh") ? "购买清单" : "PURCHASE LIST";
  return <button onClick={() => navigate("/purchase-list")} className="fixed bottom-[calc(var(--mobile-nav-height)+1rem+var(--safe-area-bottom))] right-4 z-40 inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-[11px] font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,.24)] transition active:scale-[.97]"><ClipboardList size={15} />{label}<span className="grid size-5 place-items-center rounded-full bg-white text-[10px] text-black">{itemCount}</span></button>;
}
