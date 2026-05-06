import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, Href } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  ScanLine,
} from "lucide-react-native";
import { useOrganizedEvents } from "@/src/lib/hooks/use-events";
import { OrganizedEvent } from "@/src/lib/types/event.type";
import { formatDate } from "@/src/lib/utils/format";

// ─── Badge statut event ───────────────────────────────────────
function EventStatusBadge({ status }: { status: OrganizedEvent["status"] }) {
  const config = {
    DRAFT: { label: "Brouillon", bg: "#f3f4f6", color: "#6b7280" },
    PUBLISHED: { label: "Publié", bg: "#dbeafe", color: "#2563eb" },
    ONGOING: { label: "En cours", bg: "#dcfce7", color: "#16a34a" },
    CLOSED: { label: "Clôturé", bg: "#fee2e2", color: "#dc2626" },
  }[status];

  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: config.bg }}
    >
      <Text className="text-xs font-semibold" style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Card event ───────────────────────────────────────────────
function EventCard({ event }: { event: OrganizedEvent }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/profile/events/${event.id}` as Href)}
      activeOpacity={0.8}
      className="mx-4 mb-3 bg-card border border-border rounded-2xl p-4 gap-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between gap-2">
        <Text
          className="text-foreground font-bold text-base flex-1"
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <EventStatusBadge status={event.status} />
      </View>

      {/* Infos */}
      <View className="gap-1.5">
        <View className="flex-row items-center gap-2">
          <Calendar size={13} color="#9ca3af" />
          <Text className="text-muted-foreground text-xs">
            {formatDate(event.startDate)}
          </Text>
        </View>

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Users size={13} color="#6366f1" />
            {/* ✅ CORRECTION ICI : event.ticketsCount au lieu de event._count.tickets */}
            <Text className="text-muted-foreground text-xs">
              {event.ticketsCount ?? 0} / {event.capacity} inscrits
            </Text>
          </View>

          {event.status === "ONGOING" && (
            <View className="flex-row items-center gap-1.5">
              <ScanLine size={13} color="#16a34a" />
              {/* ✅ CORRECTION ICI : event.scansCount */}
              <Text className="text-green-600 text-xs font-medium">
                {event.scansCount ?? 0} scans
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border">
        <Text className="text-primary text-xs font-semibold">
          Gérer un événement 
        </Text>
        {event.status === "DRAFT" && (
          <Text className="text-muted-foreground text-xs">Non publié</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function MyEventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ✅ Utilisation du nouveau hook
  const { data, isLoading } = useOrganizedEvents();

  const events: OrganizedEvent[] = data?.data ?? [];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color="#374151" />
          </TouchableOpacity>
          <Text className="text-foreground font-bold text-lg">
            Mes événements
          </Text>
        </View>

        {/* Créer */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/create")}
          activeOpacity={0.8}
          className="flex-row items-center gap-1.5 bg-primary rounded-xl px-3 py-2"
        >
          <Plus size={15} color="white" />
          <Text className="text-white font-semibold text-xs">Créer</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-4">
              <Text className="text-4xl">📅</Text>
              <Text className="text-foreground font-bold text-lg">
                Aucun événement créé
              </Text>
              <Text className="text-muted-foreground text-sm text-center px-8">
                Créez votre premier événement et touchez votre audience.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/create")}
                activeOpacity={0.85}
                className="bg-primary rounded-2xl px-6 py-3"
              >
                <Text className="text-white font-bold text-sm">
                  Créer un événement
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}
