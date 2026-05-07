import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "./api";
import { tokenManager } from "../lib/utils/storage";
import { useNotifStore } from "../lib/store/notif.store";
import { queryClient } from "../lib/query-client";
import { QUERY_KEYS } from "../lib/utils/constants";
import { Notification } from "../lib/types/notification.type";

let socket: Socket | null = null;

// ✅ Fonction utilitaire pour nettoyer l'URL
const getSocketUrl = (): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ""); // Enlève le slash de fin s'il y en a un
  
  // Si l'URL contient un chemin (ex: /api), on l'enlève pour Socket.io
  try {
    const urlObj = new URL(baseUrl);
    urlObj.pathname = ""; // Force le chemin à être vide (racine)
    return urlObj.toString().replace(/\/$/, ""); // Nettoie le slash final que URL peut rajouter
  } catch (e) {
    return baseUrl;
  }
};

export const connectSocket = async (): Promise<void> => {
  if (socket?.connected) return;

  const token = await tokenManager.getAccessToken();
  if (!token) return;

  // ✅ Utilisation de l'URL nettoyée
  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connecté:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket déconnecté:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Erreur socket:", err.message);
  });

  // ── Notification in-app temps réel ──────────────────────
  socket.on("notification:new", (notif: Notification) => {
    useNotifStore.getState().increment();
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.notifications,
    });
    console.log("🔔 Nouvelle notification:", notif.title);
  });

  // ── Stats scan live (organisateur) ──────────────────────
  socket.on("scan:result", (data) => {
    console.log("📱 Scan reçu:", data.result);
    queryClient.invalidateQueries({
      queryKey: [...QUERY_KEYS.myEvent(data.eventId), "stats"],
    });
  });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket déconnecté proprement");
  }
};

export const joinEventRoom = (eventId: string): void => {
  socket?.emit("join:event", { eventId });
  console.log("📡 Rejoint room event:", eventId);
};

export const leaveEventRoom = (eventId: string): void => {
  socket?.emit("leave:event", { eventId });
  console.log("📡 Quitté room event:", eventId);
};

export const getSocket = (): Socket | null => socket;