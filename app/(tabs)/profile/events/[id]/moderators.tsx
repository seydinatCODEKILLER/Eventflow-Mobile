import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Mail } from "lucide-react-native";
import {
  useEventModerators,
  useAddModerator,
  useRemoveModerator,
} from "@/src/lib/hooks/use-events";
import { EventModerator } from "@/src/lib/types/event.type";
import { formatDate } from "@/src/lib/utils/format";

export default function ModeratorsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const { data: moderators, isLoading } = useEventModerators(id);
  const { mutate: addModerator, isPending: isAdding } = useAddModerator(id);
  const { mutate: removeModerator } = useRemoveModerator(id);

  const handleAdd = () => {
    if (!email.trim()) return;
    addModerator(email.trim(), {
      onSuccess: () => setEmail(""),
    });
  };

  const confirmRemove = (moderator: EventModerator) => {
    Alert.alert(
      "Retirer le modérateur",
      `Retirer ${moderator.fullName} de cet événement ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: () => removeModerator(moderator.id),
        },
      ],
    );
  };

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
        <Text className="text-foreground font-bold text-lg">Modérateurs</Text>
      </View>

      {/* Ajouter un modérateur */}
      <View className="px-4 py-4 border-b border-border gap-3">
        <Text className="text-foreground font-semibold text-sm">
          Ajouter un modérateur
        </Text>
        <View className="flex-row gap-2">
          <View className="flex-1 flex-row items-center bg-card border border-border rounded-2xl px-4 h-12 gap-3">
            <Mail size={15} color="#9ca3af" />
            <TextInput
              className="flex-1 text-foreground text-sm"
              placeholder="Email du modérateur"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity
            onPress={handleAdd}
            disabled={isAdding || !email.trim()}
            activeOpacity={0.85}
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{
              backgroundColor:
                isAdding || !email.trim() ? "#a5b4fc" : "#6366f1",
            }}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Plus size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste modérateurs */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={moderators}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="mx-4 mb-3 bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Text className="text-primary font-bold text-sm">
                  {item.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-sm">
                  {item.fullName}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {item.email}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  Assigné le {formatDate(item.assignedAt)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => confirmRemove(item)}
                className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl items-center justify-center"
                activeOpacity={0.7}
              >
                <Trash2 size={15} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-3">
              <Text className="text-4xl">🛡️</Text>
              <Text className="text-foreground font-bold text-lg">
                Aucun modérateur
              </Text>
              <Text className="text-muted-foreground text-sm text-center px-8">
                Ajoutez des modérateurs pour vous aider à gérer un événement.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
