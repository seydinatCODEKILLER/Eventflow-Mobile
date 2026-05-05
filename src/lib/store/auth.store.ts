import { create } from "zustand";
import { User } from "../types/auth.type";
import * as SecureStore from "expo-secure-store";
import { tokenManager } from "../utils/storage";

const USER_KEY = "eventflow_user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: async (user) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: async (reason?) => {
    if (reason) console.log("🔒 Logout:", reason);
    await Promise.all([
      tokenManager.clearTokens(),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const [userRaw, token] = await Promise.all([
        SecureStore.getItemAsync(USER_KEY),
        tokenManager.getAccessToken(),
      ]);

      if (userRaw && token) {
        const user: User = JSON.parse(userRaw);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error("❌ Erreur initialisation auth:", error);
      await Promise.all([
        tokenManager.clearTokens(),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
    } finally {
      set({ isLoading: false });
    }
  },
}));

tokenManager.setLogoutHandler(async (reason?) => {
  await useAuthStore.getState().logout(reason);
});