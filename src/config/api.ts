import Constants from "expo-constants";

export const getBaseUrl = (): string => {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (!apiUrl) {
    throw new Error("API URL non définie ! Vérifie ton app.config.js");
  }
  return apiUrl;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

export const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/verify-email",
  "/auth/resend-verification",
] as const;

export const EXPECTED_401_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
  "/auth/activate", // ← ajouter
  "/auth/verify-email",
] as const;
