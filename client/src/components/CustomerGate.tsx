import { useAuth } from "@/_core/hooks/useAuth";
import { getVisitorId, restoreVisitorId } from "@/lib/visitor";
import { trpc } from "@/lib/trpc";
import { LoaderCircle } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function CustomerGate({ children, allowAdmin = false }: { children: ReactNode; allowAdmin?: boolean }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [location, navigate] = useLocation();
  const utils = trpc.useUtils();
  const guestLogin = trpc.auth.guestLogin.useMutation();
  const [visitorId] = useState(() => getVisitorId());
  const startedGuestEntry = useRef(false);

  useEffect(() => {
    if (loading || isAuthenticated || startedGuestEntry.current) return;
    startedGuestEntry.current = true;
    guestLogin.mutateAsync({ visitorId }).then((result) => {
      restoreVisitorId(result.visitorId);
      void utils.auth.testSession.invalidate().catch(() => undefined);
    }).catch(() => {
      startedGuestEntry.current = false;
      navigate(`/login?next=${encodeURIComponent(location)}`);
    });
  }, [guestLogin, isAuthenticated, loading, location, navigate, utils, visitorId]);

  useEffect(() => {
    if (!allowAdmin && !loading && user?.role === "admin" && location !== "/operations") navigate("/operations");
  }, [allowAdmin, loading, location, navigate, user?.role]);

  if (loading || !isAuthenticated || guestLogin.isPending || (!allowAdmin && user?.role === "admin")) {
    return <main className="grid min-h-svh place-items-center bg-[#fbfaf8] text-[#5f574f]"><LoaderCircle className="animate-spin" size={22} /><span className="sr-only">Checking access</span></main>;
  }
  return <>{children}</>;
}
