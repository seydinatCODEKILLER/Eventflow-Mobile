import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { usersApi } from "../lib/api/users.api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async (): Promise<
  string | null
> => {
  // ← Bloquer si Expo Go sur Android SDK 53+
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo && Platform.OS === "android") {
    console.log("⚠️ Push notifications non disponibles dans Expo Go Android");
    return null;
  }

  if (!Device.isDevice) {
    console.log("Push notifications non disponibles sur simulateur");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission notifications refusée");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "EventFlow",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366f1",
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: "3da59647-ff88-48ec-8252-bf0d9dce50d5",
  });

  return token.data;
};

export const savePushToken = async (): Promise<void> => {
  try {
    const token = await registerForPushNotifications();
    if (token) {
      await usersApi.updatePushToken(token);
      console.log("✅ Push token sauvegardé:", token);
    }
  } catch (err) {
    console.error("❌ Erreur push token:", err);
  }
};
