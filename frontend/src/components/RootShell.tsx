import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (
            msg.includes('unauthorized') ||
            msg.includes('forbidden') ||
            msg.includes('not found')
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export function RootShell() {
  // Devtools render only after the client has hydrated. Gating on
  // `typeof window` directly causes a server/client DOM mismatch (server omits
  // the devtools span, client renders it on first pass) — start `false` on
  // both sides so initial render matches, then flip in an effect.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {mounted && import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
