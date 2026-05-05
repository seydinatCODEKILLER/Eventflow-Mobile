import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,   // 5 min
      gcTime: 10 * 60 * 1000,      // 10 min — garbage collection
    },
    mutations: {
      retry: 0,                     // pas de retry sur les mutations
    },
  },
});