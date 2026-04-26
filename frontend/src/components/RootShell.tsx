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

const isBrowser = typeof window !== 'undefined';

export function RootShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {isBrowser && import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
