"use client";
import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { authKey } from "@/features/auth/queries";
import { ApiError } from "@/lib/api/client";
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            refetchOnWindowFocus: false,
            retry: (attempt, error) =>
              !(error instanceof ApiError && error.status < 500) && attempt < 1,
          },
          mutations: { retry: false },
        },
      })
  );
  useEffect(() => {
    const clear = () => {
      void client.cancelQueries();
      client.setQueryData(authKey, null);
      client.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
    };
    window.addEventListener("studback:session-expired", clear);
    return () => window.removeEventListener("studback:session-expired", clear);
  }, [client]);
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey="studback-theme-v1"
    >
      <QueryClientProvider client={client}>
        {children}
        <Toaster position="bottom-right" closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
