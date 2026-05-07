import "./global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { queryClient } from "@/src/lib/query-client";
import { SplashScreen } from "@/src/components/shared/SplashScreen";
import { useAuthStore } from "@/src/lib/store/auth.store";
import { useAppSetup } from "@/src/config/use-app-setup";

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <AppContent />
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ─── Logique de navigation principale ──────────────────────
function AppContent() {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // ✅ Un seul mot pour gérer Socket, Push, et Listeners
  useAppSetup();

  if (isLoading) return <SplashScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}