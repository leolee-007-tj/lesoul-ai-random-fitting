import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { PurchaseListProvider } from "./contexts/PurchaseListContext";
import "./i18n";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js").catch(() => undefined));
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 3_000),
    },
  },
});

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        const requestInit = { ...(init ?? {}), credentials: "include" as const };
        // Retrying GETs is safe and masks the brief disconnect that can happen
        // while the dev/proxy server is restarting. Never retry mutations.
        const method = (requestInit.method ?? "GET").toUpperCase();
        const attempts = method === "GET" ? 3 : 1;
        let lastError: unknown;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
          try {
            return await globalThis.fetch(input, requestInit);
          } catch (error) {
            lastError = error;
            if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
          }
        }
        throw lastError;
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <PurchaseListProvider><App /></PurchaseListProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
