import { api } from "./client";
import { FeedFilters, FeedResponse, NearbyEvent } from "../types/feed.type";

export const explorerApi = {
  search: async (
    filters: FeedFilters & { cursor?: string; limit?: number },
  ): Promise<FeedResponse> => {
    const { data } = await api.get<FeedResponse>("/feed", {
      params: {
        ...filters,
        limit: filters.limit ?? 10,
      },
    });
    return data;
  },

  getNearby: async (
    latitude: number,
    longitude: number,
    radius = 50,
    limit = 10,
  ): Promise<{ data: NearbyEvent[] }> => {
    const { data } = await api.get<{ data: NearbyEvent[] }>("/feed/nearby", {
      params: { latitude, longitude, radius, limit },
    });
    return data;
  },
};
