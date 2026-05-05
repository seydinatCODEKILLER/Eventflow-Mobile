import { apiClient } from "./client";
import { tokenManager } from "../utils/storage";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/auth.type";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/login", payload);
    return data.data;
  },

  register: async (payload: RegisterPayload): Promise<void> => {
    await apiClient.post("/auth/register", payload);
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/verify-email", { token });
    return data.data;
  },

  activateAccount: async (
    token: string,
    password: string,
  ): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/activate", {
      token,
      password,
    });
    return data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = await tokenManager.getRefreshToken();
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken }).catch(() => {});
    }
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/refresh-token", {
      refreshToken,
    });
    return data.data;
  },

  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post("/auth/resend-verification", { email });
  },
};
