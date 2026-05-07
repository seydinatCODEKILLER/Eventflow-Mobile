import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "../lib/store/auth.store";
import { connectSocket, disconnectSocket } from "./socket";
import { savePushToken } from "./notifications";

export function useAppSetup() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let mounted = true;

    const setup = async () => {
      try {
        await connectSocket();
        if (mounted) console.log("✅ Socket connecté");
      } catch (err) {
        console.error("❌ Erreur setup socket:", err);
      }
    };

    setup();
    savePushToken();

    // Listeners notifications — seulement si pas Expo Go Android
    const isExpoGo = Constants.appOwnership === "expo";
    const canUseNotifs = !(isExpoGo && Platform.OS === "android");

    let foregroundListener: any = null;
    let responseListener: any = null;

    if (canUseNotifs) {
      foregroundListener = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log(
            "🔔 Notif foreground:",
            notification.request.content.title,
          );
        },
      );

      responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          console.log("👆 Notif tappée:", data);
        });
    }

    return () => {
      mounted = false;
      disconnectSocket();
      foregroundListener?.remove();
      responseListener?.remove();
    };
  }, [isAuthenticated, isLoading]);
}