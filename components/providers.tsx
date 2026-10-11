"use client";

import { useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LOGIN_PATH, loginUrl } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

function redirectToLoginOnUnauthenticated(error: Error) {
  if (!(error instanceof ApiError) || error.status !== 401) {
    return;
  }
  const { pathname, search } = window.location;
  if (pathname.startsWith("/admin") && pathname !== LOGIN_PATH) {
    window.location.assign(loginUrl(`${pathname}${search}`));
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: redirectToLoginOnUnauthenticated }),
    mutationCache: new MutationCache({ onError: redirectToLoginOnUnauthenticated }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
