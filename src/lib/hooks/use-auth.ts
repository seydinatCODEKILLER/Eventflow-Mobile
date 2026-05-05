import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { authApi } from "../api/auth.api";
import { LoginPayload, RegisterPayload } from "../types/auth.type";
import { useAuthStore } from "../store/auth.store";
import { tokenManager } from "../utils/storage";

export const useLogin = () => {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data) => {
      await tokenManager.saveTokens(data.accessToken, data.refreshToken);
      await setUser(data.user);

      Toast.show({
        type: "success",
        text1: "Connexion réussie",
        text2: `Bon retour ${data.user.fullName.split(" ")[0]} ! 👋`,
        visibilityTime: 3000,
        position: "top",
      });

      router.replace("/(tabs)/feed");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Identifiants incorrects";
      Toast.show({
        type: "error",
        text1: "Échec de la connexion",
        text2: message,
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (_, variables) => {
      Toast.show({
        type: "success",
        text1: "Compte créé avec succès ! 🎉",
        text2: "Vérifie ton email pour activer ton compte",
        visibilityTime: 4000,
        position: "top",
      });

      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: variables.email },
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Une erreur est survenue";
      Toast.show({
        type: "error",
        text1: "Échec de l'inscription",
        text2: message,
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Email renvoyé !",
        text2: "Vérifie ta boîte de réception",
        visibilityTime: 3000,
        position: "top",
      });
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de renvoyer l'email, réessaie plus tard",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await logout();
      Toast.show({
        type: "success",
        text1: "Déconnexion réussie",
        visibilityTime: 2000,
        position: "top",
      });
    },
  });
};
