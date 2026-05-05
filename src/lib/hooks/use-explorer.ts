import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import * as Location from "expo-location";
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
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 2 * 60 * 1000,
    enabled:
      !!filters.search ||
      !!filters.category ||
      !!filters.city ||
      filters.isFree !== undefined,
  });
};

export const useUserLocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch {
      setPermissionDenied(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { location, permissionDenied, isLoading, requestLocation };
};

export const useNearbyEvents = (
  latitude?: number,
  longitude?: number,
  radius = 50,
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.nearby, latitude, longitude, radius],
    queryFn: () => explorerApi.getNearby(latitude!, longitude!, radius),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  });
};
