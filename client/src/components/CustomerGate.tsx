import { useAuth } from "@/_core/hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

export default function CustomerGate({ children, allowAdmin = false }: { children: ReactNode; allowAdmin?: boolean }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location)}`);
    }
    if (!allowAdmin && !loading && user?.role === "admin" && location !== "/operations") navigate("/operations");
  }, [allowAdmin, isAuthenticated, loading, location, navigate, user?.role]);

  if (loading || !isAuthenticated || (!allowAdmin && user?.role === "admin")) {
    return <main className="grid min-h-svh place-items-center bg-[#fbfaf8] text-[#5f574f]"><LoaderCircle className="animate-spin" size={22} /><span className="sr-only">Checking access</span></main>;
  }
  return <>{children}</>;
}
