import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-background gap-4">
      <Text className="text-2xl font-bold text-foreground">
        Page introuvable
      </Text>
      <Link href="/" className="text-primary text-base">
        Retour à accueil
      </Link>
    </View>
  );
}
