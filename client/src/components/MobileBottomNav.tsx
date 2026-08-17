import { Archive, Home, Package, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

const destinations = [
  { href: "/", label: "Home", icon: Home },
  { href: "/history", label: "History", icon: Archive },
  { href: "/studio", label: "Create", icon: Sparkles },
  { href: "/products", label: "Products", icon: Package },
];

export default function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  return <nav className="lesoul-bottom-nav md:hidden" aria-label="Primary navigation"><div className="lesoul-bottom-nav-inner">{destinations.map(({ href, label, icon: Icon }) => {
    const active = href === "/" ? location === "/" : location.startsWith(href);
    const translated = label === "History" ? t("nav.history") : label === "Create" ? t("nav.create") : label === "Products" ? t("nav.products") : label;
    return <button key={href} onClick={() => navigate(href)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition ${active ? "text-[#171717]" : "text-[#89837a]"}`}><span className={`grid size-7 place-items-center rounded-full transition ${active ? "bg-[#171717] text-white" : ""}`}><Icon size={15} /></span><span className="max-w-full truncate">{translated}</span></button>;
  })}</div></nav>;
}
