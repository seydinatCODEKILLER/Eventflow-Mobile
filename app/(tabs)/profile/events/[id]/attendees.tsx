import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Search } from "lucide-react-native";
import { useEventTickets } from "@/src/lib/hooks/use-events";
import { EventTicket } from "@/src/lib/types/event.type";

function AttendeeCard({ ticket }: { ticket: EventTicket }) {
  const statusColor = {
    ACTIVE: "#6366f1",
    USED: "#22c55e",
    CANCELLED: "#ef4444",
  }[ticket.status];

  const statusLabel = {
    ACTIVE: "Inscrit",
    USED: "Présent",
    CANCELLED: "Annulé",
  }[ticket.status];

  return (
    <View className="mx-4 mb-3 bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
        <Text className="text-primary font-bold text-sm">
          {ticket.user.fullName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-semibold text-sm">
          {ticket.user.fullName}
        </Text>
        {ticket.user.email && (
          <Text className="text-muted-foreground text-xs">
            {ticket.user.email}
          </Text>
        )}
        {ticket.user.phone && (
          <Text className="text-muted-foreground text-xs">
            {ticket.user.phone}
          </Text>
        )}
      </View>
      <View
        className="px-2.5 py-1 rounded-full"
        style={{ backgroundColor: `${statusColor}15` }}
      >
        <Text className="text-xs font-semibold" style={{ color: statusColor }}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

export default function AttendeesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: tickets, isLoading } = useEventTickets(id);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(
      (t) =>
        t.user.fullName.toLowerCase().includes(q) ||
        t.user.email?.toLowerCase().includes(q) ||
        t.user.phone?.includes(q),
    );
  }, [tickets, search]);

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
        <Text className="text-foreground font-bold text-lg">
          Inscrits ({tickets?.length ?? 0})
        </Text>
      </View>

      {/* Recherche */}
      <View className="px-4 py-3 border-b border-border">
        <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-11 gap-3">
          <Search size={15} color="#9ca3af" />
          <TextInput
            className="flex-1 text-foreground text-sm"
            placeholder="Rechercher un inscrit..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AttendeeCard ticket={item} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-3">
              <Text className="text-4xl">👥</Text>
              <Text className="text-foreground font-bold text-lg">
                {search ? "Aucun résultat" : "Aucun inscrit"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
