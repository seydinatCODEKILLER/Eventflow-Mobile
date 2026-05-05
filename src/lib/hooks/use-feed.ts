import { useInfiniteQuery, useQuery, useMutation } from "@tanstack/react-query";
import { feedApi } from "../api/feed.api";
import { FeedFilters, FeedResponse } from "../types/feed.type";
import { QUERY_KEYS } from "../utils/constants";
import Toast from "react-native-toast-message";

export const useFeed = (filters?: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.feed, filters],
    queryFn: ({ pageParam }: { pageParam?: string }): Promise<FeedResponse> =>
      feedApi.getFeed(pageParam, 10, filters),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 2 * 60 * 1000,
  });
};

export const useFeedEventDetail = (eventId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.feedEvent(eventId),
    queryFn: () => feedApi.getEventDetail(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRegisterToEvent = (eventId: string) => {
  return useMutation({
    mutationFn: (method?: string) => feedApi.register(eventId, method),
    onSuccess: (data) => {
      if (!data.requiresPayment) {
        Toast.show({
          type: "success",
          text1: "Inscription réussie ! 🎉",
          text2: "Votre ticket a été créé",
          visibilityTime: 3000,
          position: "top",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec de l'inscription",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};
