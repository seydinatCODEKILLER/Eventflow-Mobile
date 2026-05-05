import { useAuthStore } from "@/src/lib/store/auth.store";
import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Redirect href={isAuthenticated ? "/(tabs)/feed" : "/(auth)/login"} />;
}