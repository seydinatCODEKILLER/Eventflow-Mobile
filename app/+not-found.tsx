import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Home } from "lucide-react-native";

export default function NotFound() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center px-8 relative overflow-hidden">
      {/* ─── Effet de profondeur : Gros 404 fantôme en arrière-plan ─── */}
      <View className="absolute inset-0 items-center justify-center opacity-[0.03]">
        <Text className="text-[200px] font-black text-primary leading-none select-none">
          404
        </Text>
      </View>

      {/* ─── Contenu principal ─── */}
      <View className="items-center gap-6 relative z-10">
        {/* Branding (Identique au SplashScreen pour la continuité) */}
        <View className="items-center gap-4 mb-8">
          <View
            className="w-16 h-16 bg-primary rounded-2xl items-center justify-center"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-3xl">E</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground">
            Event<Text className="text-primary">Flow</Text>
          </Text>
        </View>

        {/* Message d'erreur */}
        <View className="items-center gap-3">
          <Text className="text-6xl font-black text-primary tracking-tight">
            404
          </Text>
          <Text className="text-foreground font-bold text-xl tracking-tight">
            Oups, page introuvable
          </Text>
          <Text className="text-muted-foreground text-sm text-center leading-6 max-w-[280px]">
            Il semblerait que la page que vous cherchez existe pas ou ait été
            déplacée.
          </Text>
        </View>

        {/* Bouton d'action Premium */}
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.8}
          className="mt-4 w-full max-w-[260px] rounded-2xl py-4 px-3 flex-row items-center justify-center gap-2.5 bg-primary overflow-hidden"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Home size={20} color="white" strokeWidth={2.5} />
          <Text className="text-white font-extrabold text-base tracking-wide">
            Retour à accueil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
