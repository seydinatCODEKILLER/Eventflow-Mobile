import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_CONFIG, DEFAULT_HEADERS, EXPECTED_401_ENDPOINTS } from "@/src/config/api";
import { tokenManager } from "../utils/storage";

// ─────────────────────────────────────────────────────────────
// Instance Axios
// ─────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: DEFAULT_HEADERS,
});

// ─────────────────────────────────────────────────────────────
// Intercepteur de REQUÊTE
// ─────────────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? "";

    if (!tokenManager.isPublicEndpoint(url)) {
      const token = await tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    (config as any).metadata = {
      startTime: Date.now(),
      retryCount: (config as any).metadata?.retryCount ?? 0,
    };

    console.log(`📤 ${config.method?.toUpperCase()} ${url}`);
    return config;
  },
  (error) => {
    console.error("❌ Erreur config requête:", error);
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// Intercepteur de RÉPONSE
// ─────────────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const meta = (response.config as any).metadata;
    if (meta) {
      const duration = Date.now() - meta.startTime;
      console.log(`📥 ${response.status} ${response.config.url} (${duration}ms)`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      metadata?: { retryCount: number; startTime: number };
    };

    const url = originalConfig?.url ?? "";
    const status = error.response?.status;

    // Pas de réseau
    if (!error.response) {
      console.error("🔌 Erreur réseau:", error.message);
      return Promise.reject(error);
    }

    // 401 attendu sur certains endpoints → on ne refresh pas
    const isExpected401 = EXPECTED_401_ENDPOINTS.some((ep) => url.includes(ep));
    if (status === 401 && isExpected401) {
      return Promise.reject(error);
    }

    // 401 inattendu → tentative de refresh
    if (status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      // Une requête de refresh déjà en cours → on met en file d'attente
      if (tokenManager.isRefreshing) {
        return new Promise((resolve) => {
          tokenManager.subscribeTokenRefresh((newToken: string) => {
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalConfig));
          });
        });
      }

      tokenManager.isRefreshing = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();

        if (!refreshToken) {
          throw new Error("Pas de refresh token disponible");
        }

        console.log("🔄 Tentative de rotation du refresh token...");

        const { data } = await apiClient.post("/auth/refresh-token", {
          refreshToken,
        });

        const newAccessToken: string = data.data.accessToken;
        const newRefreshToken: string = data.data.refreshToken;

        await tokenManager.saveTokens(newAccessToken, newRefreshToken);

        console.log("✅ Tokens rotatés et sauvegardés");

        tokenManager.onTokenRefreshed(newAccessToken);
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalConfig);

      } catch (refreshError) {
        console.error("❌ Rotation du refresh token échouée:", refreshError);
        tokenManager.onRefreshFailed();
        await tokenManager.clearTokens();
        tokenManager.logout("Session expirée. Veuillez vous reconnecter.");
        return Promise.reject(refreshError);

      } finally {
        tokenManager.isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// Helpers typés
// ─────────────────────────────────────────────────────────────

export const api = {
  get: <T>(url: string, config?: object) =>
    apiClient.get<T>(url, config),
  post: <T>(url: string, data?: object, config?: object) =>
    apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: object, config?: object) =>
    apiClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: object, config?: object) =>
    apiClient.patch<T>(url, data, config),
  delete: <T>(url: string, config?: object) =>
    apiClient.delete<T>(url, config),
};

export default apiClient;