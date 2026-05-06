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
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera, User, Phone } from "lucide-react-native";
import { useAuthStore } from "@/src/lib/store/auth.store";
import { useUpdateProfile, useDeleteAccount } from "@/src/lib/hooks/use-users";
import { FormInput } from "@/src/components/ui/FormInput";

const settingsSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis").optional(),
  phone: z
    .string()
    .regex(/^\+221(77|70|78|76)\d{7}$/, "Format invalide ex: +221771234567")
    .optional()
    .or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
      "Cette action est irréversible. Toutes vos données seront supprimées.",
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
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
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
        {/* Avatar */}
        <View className="items-center py-8">
          <TouchableOpacity
            onPress={pickAvatar}
            activeOpacity={0.8}
            className="relative"
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-24 h-24 rounded-3xl"
              />
            ) : (
              <View className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center">
                <Text className="text-primary font-bold text-3xl">
                  {initials}
                </Text>
              </View>
            )}

            {/* Bouton camera */}
            <View className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white">
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Camera size={14} color="white" />
              )}
            </View>
          </TouchableOpacity>

          <Text className="text-foreground font-bold text-lg mt-4">
            {user?.fullName}
          </Text>
          <Text className="text-muted-foreground text-sm">{user?.email}</Text>
        </View>

        {/* Formulaire */}
        <View className="px-4 gap-0">
          <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
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

          {/* Bouton sauvegarder */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending || !isDirty}
            activeOpacity={0.85}
            className="rounded-2xl py-4 items-center mt-2"
            style={{
              backgroundColor: isPending || !isDirty ? "#a5b4fc" : "#6366f1",
            }}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-sm">
                Sauvegarder les modifications
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Zone danger */}
        <View className="px-4 mt-8">
          <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
            Zone de danger
          </Text>

          <TouchableOpacity
            onPress={confirmDelete}
            disabled={isDeleting}
            activeOpacity={0.8}
            className="bg-red-50 border border-red-200 rounded-2xl py-4 items-center"
          >
            {isDeleting ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <Text className="text-red-500 font-bold text-sm">
                Supprimer mon compte
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
