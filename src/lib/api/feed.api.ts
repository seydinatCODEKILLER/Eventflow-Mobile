import {
  FeedEvent,
  FeedEventDetail,
  FeedFilters,
  RegisterResult,
} from "../types/feed.type";
import { api } from "./client";

export const feedApi = {
  getFeed: async (cursor?: string, limit = 10, filters?: FeedFilters) => {
    const { data } = await api.get<{
      data: FeedEvent[];
      nextCursor: string | null;
    }>("/feed", {
      params: { cursor, limit, ...filters },
    });
    return data;
  },

  getEventDetail: async (eventId: string): Promise<FeedEventDetail> => {
    const { data } = await api.get<{ data: FeedEventDetail }>(
      `/feed/events/${eventId}`,
    );
    return data.data;
  },

  register: async (
    eventId: string,
    method?: string,
  ): Promise<RegisterResult> => {
    const { data } = await api.post<{ data: RegisterResult }>(
      `/feed/events/${eventId}/register`,
      method ? { method } : {},
    );
    return data.data;
  },
};
