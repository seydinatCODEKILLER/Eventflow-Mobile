import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { eventsApi } from "../api/events.api";
import { CreateEventPayload } from "../types/event.type";
import { QUERY_KEYS } from "../utils/constants";
import { useAuthStore } from "../store/auth.store";

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

export const useOrganizedEvents = (status?: string) => {
  return useQuery({
    queryKey: ["events", "organized", status],
    queryFn: () => eventsApi.getOrganizedEvents({ status }),
    staleTime: 2 * 60 * 1000,
  });
};

// ─── Détail event ─────────────────────────────────────────────
export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.myEvent(eventId),
    queryFn: () => eventsApi.getById(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
  });
};

// ─── Modifier ────────────────────────────────────────────────
export const useUpdateEvent = (eventId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateEventPayload>) =>
      eventsApi.update(eventId, payload),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvent(eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed });

      Toast.show({
        type: "success",
        text1: "Événement mis à jour ✓",
        text2: event.title,
        visibilityTime: 3000,
        position: "top",
      });
      router.back();
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec de la mise à jour",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

// ─── Stats ───────────────────────────────────────────────────
export const useEventStats = (eventId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.myEvent(eventId), "stats"],
    queryFn: () => eventsApi.getStats(eventId),
    enabled: !!eventId,
    staleTime: 30 * 1000,
  });
};

// ─── Tickets ─────────────────────────────────────────────────
export const useEventTickets = (eventId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.myEvent(eventId), "tickets"],
    queryFn: () => eventsApi.getTickets(eventId),
    enabled: !!eventId,
    staleTime: 30 * 1000,
  });
};

// ─── Modérateurs ─────────────────────────────────────────────
export const useEventModerators = (eventId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.myEvent(eventId), "moderators"],
    queryFn: () => eventsApi.getModerators(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAddModerator = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => eventsApi.addModerator(eventId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.myEvent(eventId), "moderators"],
      });
      Toast.show({
        type: "success",
        text1: "Modérateur ajouté ✓",
        visibilityTime: 3000,
        position: "top",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

export const useRemoveModerator = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moderatorId: string) =>
      eventsApi.removeModerator(eventId, moderatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.myEvent(eventId), "moderators"],
      });
      Toast.show({
        type: "success",
        text1: "Modérateur retiré",
        visibilityTime: 3000,
        position: "top",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

// ─── Publier ──────────────────────────────────────────────────
export const usePublishEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.publish(eventId),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvent(eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvents });
      Toast.show({
        type: "success",
        text1: "Événement publié ! 🚀",
        text2: event.title,
        visibilityTime: 3000,
        position: "top",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec de la publication",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

// ─── Clôturer ─────────────────────────────────────────────────
export const useCloseEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.close(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvent(eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvents });
      Toast.show({
        type: "success",
        text1: "Événement clôturé",
        visibilityTime: 3000,
        position: "top",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

// ─── Supprimer ────────────────────────────────────────────────
export const useDeleteEvent = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myEvents });
      Toast.show({
        type: "success",
        text1: "Événement supprimé",
        visibilityTime: 3000,
        position: "top",
      });
      router.back();
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec de la suppression",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

// ─── Scan ────────────────────────────────────────────────────
export const useValidateTicket = () => {
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({
      qrPayload,
      deviceId,
    }: {
      qrPayload: string;
      deviceId: string;
    }) => eventsApi.validateTicket(qrPayload, deviceId, user?.id ?? ""),
  });
};
