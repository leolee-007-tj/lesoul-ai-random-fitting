import { useEffect, type ReactNode } from "react";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";
import PurchaseListFab from "./PurchaseListFab";

type MobileScreenProps = {
  children: ReactNode;
  action?: ReactNode;
  showHeader?: boolean;
  className?: string;
};

export default function MobileScreen({ children, action, showHeader = true, className = "" }: MobileScreenProps) {
  useEffect(() => {
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const keyboardHeight = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
      document.documentElement.style.setProperty("--lesoul-keyboard-height", `${keyboardHeight}px`);
      document.documentElement.dataset.keyboardOpen = keyboardHeight > 120 ? "true" : "false";
    };
    const keepFocusedInputVisible = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches("input, textarea, select")) return;
      window.setTimeout(() => target.scrollIntoView({ block: "center", behavior: "smooth" }), 180);
    };
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    document.addEventListener("focusin", keepFocusedInputVisible);
    return () => {
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
      document.removeEventListener("focusin", keepFocusedInputVisible);
      document.documentElement.style.removeProperty("--lesoul-keyboard-height");
      delete document.documentElement.dataset.keyboardOpen;
    };
  }, []);

  return <div className={`lesoul-app-wrapper lesoul-mobile-screen ${className}`}>
    {showHeader && <div className="lesoul-mobile-header"><AppHeader /></div>}
    <main className="lesoul-mobile-content">{children}</main>
    {action && <div className="lesoul-action-dock">{action}</div>}
    <PurchaseListFab />
    <MobileBottomNav />
  </div>;
}
