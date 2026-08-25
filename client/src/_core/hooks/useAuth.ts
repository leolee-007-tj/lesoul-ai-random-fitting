import { startLogin } from "@/const";
import { setHistoryScope } from "@/lib/mvpStore";
import { clearExplicitLogout, markExplicitLogout } from "@/lib/visitor";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // Login is started via startLogin() in the effect below, only when we actually
  // navigate — never during render. startLogin() mints a one-time nonce + writes
  // the state cookie, so calling it per render would overwrite the cookie and
  // desync it from an in-flight login's `state`.
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const testSessionQuery = trpc.auth.testSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      utils.auth.testSession.setData(undefined, { active: false, visitorId: null });
    },
  });

  const logout = useCallback(async () => {
    markExplicitLogout();
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      clearExplicitLogout();
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      // Clear the Preview auto-login token mirrored into sessionStorage, so
      // header-based sessions (Safari ITP / WebView) are logged out too. The
      // backend cookie is cleared by the logout mutation.
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      utils.auth.me.setData(undefined, null);
      utils.auth.testSession.setData(undefined, { active: false, visitorId: null });
      await utils.auth.me.invalidate();
      await utils.auth.testSession.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    const account = meQuery.data ?? null;
    const testAccess = testSessionQuery.data?.active ? testSessionQuery.data : null;
    setHistoryScope(account ? `account:${account.openId}` : testAccess?.visitorId ? `visitor:${testAccess.visitorId}` : "normal:legacy");
    return {
      user: account,
      testAccess,
      loading: meQuery.isLoading || testSessionQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? testSessionQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data || testSessionQuery.data?.active),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    testSessionQuery.data,
    testSessionQuery.error,
    testSessionQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || testSessionQuery.isLoading || logoutMutation.isPending) return;
    if (state.isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    // Navigate at this moment only. startLogin() mints the nonce + cookie itself.
    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    testSessionQuery.isLoading,
    state.isAuthenticated,
  ]);

  return {
    ...state,
    refresh: () => Promise.all([meQuery.refetch(), testSessionQuery.refetch()]),
    logout,
  };
}
