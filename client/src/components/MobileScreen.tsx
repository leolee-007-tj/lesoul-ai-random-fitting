import type { ReactNode } from "react";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";

type MobileScreenProps = {
  children: ReactNode;
  action?: ReactNode;
  showHeader?: boolean;
  className?: string;
};

export default function MobileScreen({ children, action, showHeader = true, className = "" }: MobileScreenProps) {
  return <div className={`lesoul-mobile-screen ${className}`}>
    {showHeader && <div className="lesoul-mobile-header"><AppHeader /></div>}
    <main className="lesoul-mobile-content">{children}</main>
    {action && <div className="lesoul-action-dock">{action}</div>}
    <MobileBottomNav />
  </div>;
}
