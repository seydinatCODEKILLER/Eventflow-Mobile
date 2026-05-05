import { useAuthStore } from "@/src/lib/store/auth.store";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/feed" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
