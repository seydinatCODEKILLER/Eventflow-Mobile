import { api } from "./client";
import { NotificationsResponse } from "../types/notification.type";

export const notificationsApi = {
  getAll: async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    const { data } = await api.get<NotificationsResponse>("/notifications", {
      params: { page, limit },
    });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<{
      success: boolean;
      data: { count: number };
    }>("/notifications/unread-count");
    return data.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
