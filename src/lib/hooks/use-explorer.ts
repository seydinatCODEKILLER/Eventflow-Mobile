import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { explorerApi } from "../api/explorer.api";
import { FeedFilters } from "../types/feed.type";
import { QUERY_KEYS } from "../utils/constants";

export const useExplorer = (filters: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.explorer, filters],
    queryFn: ({ pageParam }) =>
      explorerApi.search({
        ...filters,
        cursor: pageParam as string | undefined,
        limit: 10,
      }),
    initialPageParam: undefined as string | undefined, // ← typage explicite
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 2 * 60 * 1000,
    enabled:
      !!filters.search ||
      !!filters.category ||
      !!filters.city ||
      filters.isFree !== undefined,
  });
};

export const useNearbyEvents = (
  latitude?: number,
  longitude?: number,
  radius = 50,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.nearby, latitude, longitude, radius],
    queryFn: () => explorerApi.getNearby(latitude!, longitude!, radius),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  });
};