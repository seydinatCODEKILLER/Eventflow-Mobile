import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react-native";
import { useResendVerification } from "@/src/lib/hooks/use-auth";

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { mutate: resend, isPending, isSuccess } = useResendVerification();

  return (
    <View className="flex-1 bg-background px-6 justify-center">
      {/* Icône */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
          <Mail size={40} color="#6366f1" />
        </View>

        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          Vérifiez votre email
        </Text>
        <Text className="text-muted-foreground text-sm text-center leading-5">
          Un lien de confirmation a été envoyé à
        </Text>
        <Text className="text-primary font-semibold text-sm text-center mt-1">
          {email}
        </Text>
      </View>

      {/* Instructions */}
      <View className="bg-card border border-border rounded-2xl p-5 mb-8 gap-3">
        {[
          "Ouvre ton application email",
          "Clique sur le lien de confirmation",
          "Connecte-toi sur l'app une fois ton compte activé",
        ].map((step, i) => (
          <View key={i} className="flex-row items-center gap-3">
            <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">{i + 1}</Text>
            </View>
            <Text className="text-foreground text-sm flex-1">{step}</Text>
          </View>
        ))}
      </View>

      {/* Renvoyer email */}
      <View className="items-center gap-4">
        <Text className="text-muted-foreground text-sm">
          Tu as pas reçu email ?
        </Text>

        {isSuccess ? (
          <View className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <Text className="text-green-600 text-sm font-medium text-center">
              ✓ Email renvoyé avec succès !
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => email && resend(email)}
            disabled={isPending}
            className="flex-row items-center gap-2 bg-card border border-border rounded-xl px-5 py-3"
            activeOpacity={0.7}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <RefreshCw size={16} color="#6366f1" />
            )}
            <Text className="text-primary font-medium text-sm">
              {isPending ? "Envoi en cours..." : "Renvoyer l'email"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Retour login */}
      <TouchableOpacity
        onPress={() => router.replace("/(auth)/login")}
        className="flex-row items-center justify-center gap-2 mt-10"
        activeOpacity={0.7}
      >
        <ArrowLeft size={16} color="#9ca3af" />
        <Text className="text-muted-foreground text-sm">
          Retour à la connexion
        </Text>
      </TouchableOpacity>
    </View>
  );
}
