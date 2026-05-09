import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Users, MapPin } from "lucide-react-native";
import { useModeratedEvents } from "@/src/lib/hooks/use-events";
import { Event } from "@/src/lib/types/event.type";
import { formatDate } from "@/src/lib/utils/format";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

// ─── Badge statut ─────────────────────────────────────────────
function EventStatusBadge({ status }: { status: Event["status"] }) {
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

// ─── Card event modéré ────────────────────────────────────────
function ModeratedEventCard({ event }: { event: Event }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/profile/moderated/${event.id}?from=moderated`)}
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
        <View className="flex-row items-center gap-2">
          <MapPin size={13} color="#9ca3af" />
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {event.city ?? event.location}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Users size={13} color="#9ca3af" />
          <Text className="text-muted-foreground text-xs">
            {event.capacity} places
          </Text>
        </View>
      </View>

      {/* Organisateur */}
      <View className="flex-row items-center gap-2 pt-2 border-t border-border">
        <View className="w-5 h-5 rounded-full bg-primary/10 items-center justify-center">
          <Text className="text-primary font-bold" style={{ fontSize: 8 }}>
            {(event as any).organizer?.fullName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-muted-foreground text-xs">
          Organisé par{" "}
          <Text className="font-semibold text-foreground">
            {(event as any).organizer?.fullName}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function ModeratedEventsScreen() {
  const insets = useSafeAreaInsets();
  const goBack = useSmartBack({ defaultRoute: "/(tabs)/profile" as Href });

  const { data, isLoading } = useModeratedEvents();
  const events: Event[] = data?.data ?? [];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={goBack}
          className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text className="text-foreground font-bold text-lg">
            Mes modérations
          </Text>
          <Text className="text-muted-foreground text-xs">
            Events où vous êtes modérateur
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ModeratedEventCard event={item} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-4">
              <Text className="text-4xl">🛡️</Text>
              <Text className="text-foreground font-bold text-lg">
                Aucune modération
              </Text>
              <Text className="text-muted-foreground text-sm text-center px-8">
                Vous apparaîtrez ici lorsque un organisateur vous assignera
                comme modérateur a un événement.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
