import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import {
  useEventModerators,
  useAddModerator,
  useRemoveModerator,
} from "@/src/lib/hooks/use-events";
import { EventModerator } from "@/src/lib/types/event.type";
import { formatDate } from "@/src/lib/utils/format";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

// ─── Card Modérateur (Style Attendees) ─────────────────────────────────────
function ModeratorCard({
  item,
  onRemove,
}: {
  item: EventModerator;
  onRemove: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.07)",
        padding: 12,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          overflow: "hidden",
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: item.avatarUrl ? "transparent" : "#eef2ff",
          borderWidth: item.avatarUrl ? 1.5 : 0,
          borderColor: "rgba(99, 102, 241, 0.2)",
        }}
      >
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={{ width: 46, height: 46 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#6366f1" }}>
            {item.fullName?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        )}
      </View>

      {/* Contenu */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#0f0f10",
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {item.fullName || "Nom inconnu"}
          </Text>
          <ShieldCheck size={14} color="#16a34a" strokeWidth={2.5} />
        </View>

        <Text style={{ fontSize: 11, color: "#8e8e93" }} numberOfLines={1}>
          {item.email || "Email inconnu"}
        </Text>

        <Text style={{ fontSize: 10, color: "#8e8e93", marginTop: 2 }}>
          Assigné le {formatDate(item.assignedAt)}
        </Text>
      </View>

      {/* Bouton supprimer (Style épuré) */}
      <TouchableOpacity
        onPress={onRemove}
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: "#fee2e2",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Trash2 size={14} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ModeratorsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const goBack = useSmartBack({
    defaultRoute: `/(tabs)/profile/events/${id}` as Href,
  });
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

  const confirmRemove = (item: EventModerator) => {
    Alert.alert(
      "Retirer le modérateur",
      `Retirer ${item.fullName} de cet événement ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: () => removeModerator(item.id),
        },
      ],
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f5f5f7", paddingTop: insets.top }}
    >
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 0.5,
          borderBottomColor: "rgba(0,0,0,0.07)",
          backgroundColor: "rgba(245,245,247,0.9)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "#fff",
              borderWidth: 0.5,
              borderColor: "rgba(0,0,0,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={17} color="#0f0f10" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f0f10" }}>
            Modérateurs
          </Text>
        </View>

        {/* Total pill */}
        <View
          style={{
            backgroundColor: "#f0fdf4",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 100,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#16a34a" }}>
            {moderators?.length ?? 0}
          </Text>
        </View>
      </View>

      {/* ── Ajouter un modérateur ── */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 10,
          borderBottomWidth: 0.5,
          borderBottomColor: "rgba(0,0,0,0.07)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#0f0f10" }}>
            Ajouter un modérateur
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 2 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderWidth: 0.5,
              borderColor: "rgba(0,0,0,0.07)",
              borderRadius: 14,
              paddingHorizontal: 14,
              height: 44,
            }}
          >
            <Mail size={15} color="#8e8e93" />
            <TextInput
              style={{ flex: 1, fontSize: 13, color: "#0f0f10" }}
              placeholder="Email du modérateur"
              placeholderTextColor="#8e8e93"
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
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor:
                isAdding || !email.trim() ? "#a5b4fc" : "#6366f1",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isAdding || !email.trim() ? 0 : 0.25,
              shadowRadius: 8,
              elevation: isAdding || !email.trim() ? 0 : 4,
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

      {/* ── Liste modérateurs ── */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f7",
          }}
        >
          <ActivityIndicator size="large" color="#6366f5" />
        </View>
      ) : (
        <FlatList
          data={moderators}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ModeratorCard item={item} onRemove={() => confirmRemove(item)} />
          )}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 60,
                gap: 10,
                backgroundColor: "#f5f5f7",
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: "#f0fdf4",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={24} color="#16a34a" strokeWidth={1.5} />
              </View>

              <View style={{ alignItems: "center", gap: 2 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#0f0f10",
                  }}
                >
                  Aucun modérateur
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#8e8e93",
                    textAlign: "center",
                    paddingHorizontal: 40,
                    lineHeight: 20,
                  }}
                >
                  Ajoutez des modérateurs pour vous aider à scanner les tickets
                  le jour J.
                </Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}
