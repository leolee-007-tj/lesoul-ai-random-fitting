import { useAuth } from "@/_core/hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminTrialExpiredDialog from "./AdminTrialExpiredDialog";

export default function AdminGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [location, navigate] = useLocation();
  const trial = trpc.adminTrial.status.useQuery(undefined, { enabled: !loading && isAuthenticated && user?.role === "admin", retry: false });

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location)}`);
      return;
    }
    if (user?.role !== "admin") navigate("/");
  }, [isAuthenticated, loading, location, navigate, user?.role]);

  if (loading || !isAuthenticated || user?.role !== "admin" || trial.isLoading) {
    return <main className="grid min-h-svh place-items-center bg-[#fbfaf8] text-[#5f574f]"><LoaderCircle className="animate-spin" size={22} /><span className="sr-only">Checking administrator access</span></main>;
  }
  if (trial.data?.status === "expired") return <AdminTrialExpiredDialog trial={trial.data} />;
  return <>{children}</>;
}
