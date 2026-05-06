import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-foreground font-bold text-lg">Notifications</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">À implémenter — étape 10</Text>
      </View>
    </View>
  );
}
