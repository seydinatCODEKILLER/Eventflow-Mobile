import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { usersApi } from "../api/users.api";
import { useAuthStore } from "../store/auth.store";
import { QUERY_KEYS } from "../utils/constants";
import { UpdateProfilePayload } from "../types/user.type";

export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: usersApi.getProfile,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      usersApi.updateProfile(payload),
    onSuccess: async (user) => {
      await setUser(user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      Toast.show({
        type: "success",
        text1: "Profil mis à jour ✓",
        visibilityTime: 3000,
        position: "top",
      });
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

export const useMyTickets = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tickets,
    queryFn: usersApi.getMyTickets,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMyEvents = () => {
  return useQuery({
    queryKey: QUERY_KEYS.myEvents,
    queryFn: usersApi.getMyEvents,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMyPayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: usersApi.getMyPayments,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDeleteAccount = () => {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: usersApi.deleteAccount,
    onSuccess: async () => {
      await logout();
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Impossible de supprimer le compte",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};
