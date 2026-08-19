import { useAuth } from "@/_core/hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

export default function CustomerGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location)}`);
    }
  }, [isAuthenticated, loading, location, navigate]);

  if (loading || !isAuthenticated) {
    return <main className="grid min-h-svh place-items-center bg-[#fbfaf8] text-[#5f574f]"><LoaderCircle className="animate-spin" size={22} /><span className="sr-only">Checking access</span></main>;
  }
  return <>{children}</>;
}
