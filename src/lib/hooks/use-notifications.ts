import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import { useNotifStore } from "../store/notif.store";
import { QUERY_KEYS } from "../utils/constants";

export const useNotifications = () => {
  const setUnreadCount = useNotifStore((s) => s.setUnreadCount);

  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      const res = await notificationsApi.getAll();
      setUnreadCount(res.pagination.unread);
      return res;
    },
    staleTime: 30 * 1000,
  });
};

export const useUnreadCount = () => {
  const setUnreadCount = useNotifStore((s) => s.setUnreadCount);

  return useQuery({
    queryKey: [...QUERY_KEYS.notifications, "count"],
    queryFn: async () => {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
      return count;
    },
    staleTime: 30 * 1000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const reset = useNotifStore((s) => s.reset);

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
};
