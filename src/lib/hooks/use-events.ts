import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { eventsApi } from "../api/events.api";
import { CreateEventPayload } from "../types/event.type";
import { QUERY_KEYS } from "../utils/constants";

export const useCreateEvent = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsApi.create(payload),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvents });
      Toast.show({
        type: "success",
        text1: "Événement créé ! 🎉",
        text2: event.title,
        visibilityTime: 3000,
        position: "top",
      });
      router.push(`/(tabs)/profile/events/${event.id}` as Href);
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec de la création",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};