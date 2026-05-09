import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useLocalSearchParams } from "expo-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Search, UserPlus } from "lucide-react-native";
import { useEventTickets } from "@/src/lib/hooks/use-events";
import { EventTicket } from "@/src/lib/types/event.type";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

// ─── Types filtre ──────────────────────────────────────────────────────────────
type Filter = "ALL" | "ACTIVE" | "USED" | "CANCELLED";

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({
  name,
  avatarUrl,
  status,
}: {
  name: string;
  avatarUrl: string | null;
  status: EventTicket["status"];
}) {
  const colors = {
    ACTIVE: { bg: "#eef2ff", color: "#6366f1" },
    USED: { bg: "#d1fae5", color: "#065f46" },
    CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
  }[status];

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={{
        width: 46,
        height: 46,
        borderRadius: 14,
        overflow: "hidden",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.bg,
      }}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 46, height: 46 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.color }}>
          {initials}
        </Text>
      )}
    </View>
  );
}

// ─── Badge statut ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: EventTicket["status"] }) {
  const config = {
    ACTIVE: { label: "Inscrit", bg: "#eef2ff", color: "#6366f1" },
    USED: { label: "Présent", bg: "#d1fae5", color: "#065f46" },
    CANCELLED: { label: "Annulé", bg: "#fee2e2", color: "#991b1b" },
  }[status];

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: config.bg,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: "700", color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Card inscrit ──────────────────────────────────────────────────────────────
function AttendeeCard({ ticket }: { ticket: EventTicket }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
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
      <Avatar
        name={ticket.user.fullName}
        avatarUrl={ticket.user.avatarUrl}
        status={ticket.status}
      />

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#0f0f10",
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {ticket.user.fullName}
        </Text>
        {ticket.user.email && (
          <Text style={{ fontSize: 11, color: "#8e8e93" }} numberOfLines={1}>
            {ticket.user.email}
          </Text>
        )}
        {!ticket.user.email && ticket.user.phone && (
          <Text style={{ fontSize: 11, color: "#8e8e93" }} numberOfLines={1}>
            {ticket.user.phone}
          </Text>
        )}
        {ticket.addedByOrganizer && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
              alignSelf: "flex-start",
              backgroundColor: "#fef3c7",
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 100,
            }}
          >
            <UserPlus size={10} color="#d97706" />
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#d97706" }}>
              Ajouté manuellement
            </Text>
          </View>
        )}
      </View>

      <StatusBadge status={ticket.status} />
    </View>
  );
}

// ─── Onglet filtre ─────────────────────────────────────────────────────────────
function FilterTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 100,
        backgroundColor: active ? "#6366f1" : "#fff",
        borderWidth: active ? 0 : 0.5,
        borderColor: "rgba(0,0,0,0.08)",
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: active ? "#fff" : "#8e8e93",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Écran principal ───────────────────────────────────────────────────────────
export default function AttendeesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const goBack = useSmartBack({
    defaultRoute: `/(tabs)/profile/events/${id}` as Href,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const { data: tickets, isLoading } = useEventTickets(id);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    let result = tickets;
    if (filter !== "ALL") result = result.filter((t) => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.user.fullName.toLowerCase().includes(q) ||
          t.user.email?.toLowerCase().includes(q) ||
          t.user.phone?.includes(q),
      );
    }
    return result;
  }, [tickets, search, filter]);

  const total = tickets?.length ?? 0;
  const active = tickets?.filter((t) => t.status === "ACTIVE").length ?? 0;
  const present = tickets?.filter((t) => t.status === "USED").length ?? 0;
  const cancelled =
    tickets?.filter((t) => t.status === "CANCELLED").length ?? 0;

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f5f5f7", paddingTop: insets.top }}
    >
      {/* Header */}
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
            Inscrits
          </Text>
        </View>

        {/* Total pill */}
        <View
          style={{
            backgroundColor: "#eef2ff",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 100,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#6366f1" }}>
            {total}
          </Text>
        </View>
      </View>

      {/* Stats strip */}
      {!isLoading && total > 0 && (
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            padding: 14,
            paddingBottom: 6,
          }}
        >
          {[
            { val: active, lbl: "Inscrits", color: "#6366f1" },
            { val: present, lbl: "Présents", color: "#10b981" },
            { val: cancelled, lbl: "Annulés", color: "#ef4444" },
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                borderWidth: 0.5,
                borderColor: "rgba(0,0,0,0.07)",
                padding: 11,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700", color: s.color }}>
                {s.val}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#8e8e93",
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                {s.lbl}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#fff",
            borderWidth: 0.5,
            borderColor: "rgba(0,0,0,0.07)",
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 44,
          }}
        >
          <Search size={15} color="#8e8e93" />
          <TextInput
            style={{ flex: 1, fontSize: 13, color: "#0f0f10" }}
            placeholder="Nom, email ou téléphone…"
            placeholderTextColor="#8e8e93"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Filtres */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingBottom: 10,
        }}
      >
        {(["ALL", "ACTIVE", "USED", "CANCELLED"] as Filter[]).map((f) => (
          <FilterTab
            key={f}
            label={
              f === "ALL"
                ? "Tous"
                : f === "ACTIVE"
                  ? "Inscrits"
                  : f === "USED"
                    ? "Présents"
                    : "Annulés"
            }
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AttendeeCard ticket={item} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 10 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: "#eef2ff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={24} color="#6366f1" />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#0f0f10" }}
              >
                {search ? "Aucun résultat" : "Aucun inscrit"}
              </Text>
              {search && (
                <Text style={{ fontSize: 13, color: "#8e8e93" }}>
                  Essayez un autre terme
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
