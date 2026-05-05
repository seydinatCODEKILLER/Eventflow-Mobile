import { View, ActivityIndicator, Text } from "react-native";

export function SplashScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center gap-4">
      <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center">
        <Text className="text-white font-bold text-3xl">E</Text>
      </View>
      <Text className="text-2xl font-bold text-foreground">
        Event<Text className="text-primary">Flow</Text>
      </Text>
      <ActivityIndicator color="#6366f1" className="mt-4" />
    </View>
  );
}