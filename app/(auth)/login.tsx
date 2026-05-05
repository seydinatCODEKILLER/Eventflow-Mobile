import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Mail, Lock } from "lucide-react-native";
import { loginSchema, LoginFormValues } from "@/src/lib/validators/auth.schema";
import { useLogin } from "@/src/lib/hooks/use-auth";
import { HeroIllustration } from "@/src/components/shared/HeroIllustration";
import { FormInput } from "@/src/components/ui/FormInput";

export default function LoginScreen() {
  const { mutate: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View className="items-center pt-14 pb-2">
          <HeroIllustration />
        </View>

        <View className="flex-1 px-6 pb-10">
          {/* Titre */}
          <View className="items-center mb-7">
            <Text className="text-2xl font-bold text-foreground">
              Event<Text className="text-primary">Flow</Text>
            </Text>
            <Text className="text-muted-foreground text-sm mt-1 text-center">
              Connecte-toi pour découvrir les events
            </Text>
          </View>

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                icon={Mail}
                placeholder="Adresse email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          {/* Mot de passe */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                icon={Lock}
                placeholder="Mot de passe"
                isPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {/* Bouton connexion */}
          <TouchableOpacity
            onPress={handleSubmit((v) => login(v))}
            disabled={isPending}
            activeOpacity={0.85}
            className="w-full rounded-2xl py-4 items-center justify-center"
            style={{
              backgroundColor: isPending ? "#a5b4fc" : "#6366f1",
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-sm tracking-wide">
                Se connecter
              </Text>
            )}
          </TouchableOpacity>

          {/* Lien inscription (Remplacement du bloc avec les séparateurs) */}
          <View className="mt-6 items-center">
            <Text className="text-muted-foreground text-sm">
              Pas encore de compte ?{" "}
              <Link
                href="/(auth)/register"
                className="text-purple-800 font-semibold underline underline-offset-4"
              >
                Inscrivez-vous
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
