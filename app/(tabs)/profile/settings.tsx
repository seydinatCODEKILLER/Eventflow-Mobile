import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Camera,
  User,
  Phone,
  Shield,
  Trash2,
  Save,
} from "lucide-react-native";
import { useAuthStore } from "@/src/lib/store/auth.store";
import { useUpdateProfile, useDeleteAccount } from "@/src/lib/hooks/use-users";
import { FormInput } from "@/src/components/ui/FormInput";
import { LinearGradient } from "expo-linear-gradient";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

const settingsSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis (min 2 caractères)"),
  phone: z
    .string()
    .regex(/^\+221(77|70|78|76)\d{7}$/, "Format invalide ex: +221771234567")
    .optional()
    .or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const goBack = useSmartBack({
    defaultRoute: "/(tabs)/profile" as Href,
  });
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
    },
  });

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateProfile({ avatarUri: result.assets[0].uri });
    }
  };

  const onSubmit = (values: SettingsFormValues) => {
    updateProfile({
      fullName: values.fullName,
      phone: values.phone || undefined,
    });
  };

  const confirmDelete = () => {
    Alert.alert(
      "Supprimer mon compte",
      "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteAccount(),
        },
      ],
    );
  };

  const initials = user?.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* ── Header ── */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <TouchableOpacity
          onPress={goBack}
          className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-foreground font-bold text-lg">Paramètres</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Avatar section ── */}
        <View className="items-center pt-4 pb-8">
          <TouchableOpacity
            onPress={pickAvatar}
            activeOpacity={0.85}
            disabled={isPending}
          >
            <View className="relative">
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 28,
                    borderWidth: 3,
                    borderColor: "#e0e7ff",
                  }}
                />
              ) : (
                <LinearGradient
                  colors={["#6366f1", "#818cf8"]}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-white font-bold text-3xl">
                    {initials}
                  </Text>
                </LinearGradient>
              )}

              {/* Badge caméra */}
              <View
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full items-center justify-center border-2 border-white"
                style={{ backgroundColor: "#6366f1" }}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Camera size={15} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <Text className="text-foreground font-bold text-xl mt-4">
            {user?.fullName}
          </Text>
          <Text className="text-muted-foreground text-sm mt-0.5">
            {user?.email}
          </Text>

          {/* Badge compte vérifié */}
          <View className="flex-row items-center gap-1.5 mt-2 bg-green-50 border border-green-100 rounded-full px-3 py-1">
            <Shield size={12} color="#22c55e" />
            <Text className="text-green-600 text-xs font-semibold">
              Compte vérifié
            </Text>
          </View>
        </View>

        {/* ── Formulaire ── */}
        <View className="px-4">
          <View
            className="bg-card border border-border rounded-3xl p-5 mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-foreground font-bold text-base mb-4">
              Informations personnelles
            </Text>

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  icon={User}
                  label="Nom complet"
                  placeholder="Votre nom complet"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  icon={Phone}
                  label="Téléphone"
                  placeholder="+221771234567"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />

            {/* Email non modifiable */}
            <View className="mb-4">
              <Text className="text-foreground text-sm font-semibold mb-1.5">
                Email
              </Text>
              <View className="flex-row items-center bg-muted/50 border border-border rounded-2xl px-4 py-3 gap-3">
                <Text className="text-muted-foreground text-sm flex-1">
                  {user?.email}
                </Text>
                <View className="bg-muted rounded-full px-2 py-0.5">
                  <Text className="text-muted-foreground text-xs">
                    Non modifiable
                  </Text>
                </View>
              </View>
            </View>

            {/* Bouton sauvegarder */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isPending || !isDirty}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
              style={{
                backgroundColor: isPending || !isDirty ? "#a5b4fc" : "#6366f1",
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isPending || !isDirty ? 0 : 0.3,
                shadowRadius: 8,
                elevation: isPending || !isDirty ? 0 : 4,
              }}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Save size={16} color="white" />
                  <Text className="text-white font-bold text-sm">
                    Sauvegarder les modifications
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Zone danger ── */}
          <View
            className="bg-red-50 border border-red-100 rounded-3xl p-5"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-red-500 font-bold text-base">
                Zone de danger
              </Text>
            </View>
            <Text className="text-red-400 text-xs mb-4 leading-5">
              La suppression de votre compte est irréversible. Toutes vos
              données, tickets et événements seront définitivement supprimés.
            </Text>
            <TouchableOpacity
              onPress={confirmDelete}
              disabled={isDeleting}
              activeOpacity={0.8}
              className="bg-white border border-red-200 rounded-2xl py-3.5 items-center"
            >
              {isDeleting ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text className="text-red-500 font-bold text-sm">
                  Supprimer définitivement mon compte
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
