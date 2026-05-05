import { create } from "zustand";

interface NotifState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  reset: () => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  reset: () => set({ unreadCount: 0 }),
}));