import { Archive, Home, Shirt, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

const destinations = [{ href: "/", label: "home", icon: Home }, { href: "/history", label: "History", icon: Archive }, { href: "/body-model", label: "Create", icon: Sparkles }, { href: "/quick-fit", label: "QuickFit", icon: Shirt }];
export default function MobileBottomNav() {
  const [location, navigate] = useLocation(); const { t, i18n } = useTranslation(); const copy = i18n.language.startsWith("ko") ? { nav: "주요 탐색", home: "홈", quick: "퀵 핏" } : i18n.language.startsWith("zh") ? { nav: "主导航", home: "首页", quick: "快速搭配" } : { nav: "Primary navigation", home: "Home", quick: "Quick Fit" };
  return <nav className="lesoul-bottom-nav md:hidden" aria-label={copy.nav}><div className="lesoul-bottom-nav-inner">{destinations.map(({ href, label, icon: Icon }) => { const active = href === "/" ? location === "/" : location.startsWith(href); const translated = label === "History" ? t("nav.history") : label === "Create" ? t("nav.create") : label === "QuickFit" ? copy.quick : copy.home; return <button key={href} onClick={() => navigate(href)} aria-label={translated} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition ${active ? "text-[#171717]" : "text-[#89837a]"}`}><span className={`grid size-7 place-items-center rounded-full transition ${active ? "bg-[#171717] text-white" : ""}`}><Icon size={15} aria-hidden="true" /></span><span className="max-w-full truncate">{translated}</span></button>; })}</div></nav>;
}
