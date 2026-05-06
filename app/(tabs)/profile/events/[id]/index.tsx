import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import {
  ArrowLeft,
  Users,
  QrCode,
  BarChart2,
  Shield,
  Edit,
  Trash2,
  Play,
  X,
} from "lucide-react-native";
import {
  useEvent,
  useEventStats,
  usePublishEvent,
  useCloseEvent,
  useDeleteEvent,
} from "@/src/lib/hooks/use-events";
import { formatDate, formatPrice } from "@/src/lib/utils/format";
import { Event } from "@/src/lib/types/event.type";

// ─── Badge statut ─────────────────────────────────────────────
function StatusBadge({ status }: { status: Event["status"] }) {
  const config = {
    DRAFT: { label: "Brouillon", bg: "#f3f4f6", color: "#6b7280" },
    PUBLISHED: { label: "Publié", bg: "#dbeafe", color: "#2563eb" },
    ONGOING: { label: "En cours", bg: "#dcfce7", color: "#16a34a" },
    CLOSED: { label: "Clôturé", bg: "#fee2e2", color: "#dc2626" },
  }[status];

  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: config.bg }}
    >
      <Text className="text-sm font-semibold" style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Carte action ─────────────────────────────────────────────
function ActionCard({
  icon: Icon,
  label,
  sublabel,
  onPress,
  color = "#6366f1",
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 bg-card border border-border rounded-2xl p-4 gap-2"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} color={color} />
      </View>
      <Text className="text-foreground font-bold text-sm">{label}</Text>
      {sublabel && (
        <Text className="text-muted-foreground text-xs">{sublabel}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function EventDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: event, isLoading } = useEvent(id);
  const { data: stats } = useEventStats(id);
  const { mutate: publish, isPending: isPublishing } = usePublishEvent(id);
  const { mutate: close, isPending: isClosing } = useCloseEvent(id);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  const confirmClose = () => {
    Alert.alert(
      "Clôturer l'événement",
      "Cette action est irréversible. L'événement sera fermé aux inscriptions.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Clôturer",
          style: "destructive",
          onPress: () => close(),
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert("Supprimer l'événement", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deleteEvent(id),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-4">
        <Text className="text-foreground font-bold text-lg">
          Événement introuvable
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fillRate =
    stats && stats.capacity > 0
      ? Math.round(
          ((stats.capacity - stats.remainingSeats) / stats.capacity) * 100,
        )
      : 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>

        <StatusBadge status={event.status} />

        {/* Modifier */}
        {event.status !== "CLOSED" && (
          <TouchableOpacity
            onPress={() =>
              router.push(`/(tabs)/profile/events/${id}/edit` as Href)
            }
            className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Edit size={16} color="#374151" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Infos event ──────────────────────────────── */}
        <View className="px-4 pt-5 pb-4 gap-2">
          <Text className="text-foreground font-bold text-2xl leading-tight">
            {event.title}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {formatDate(event.startDate)} · {event.location}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {event.isFree
              ? "Gratuit"
              : formatPrice(event.price!, event.currency)}
          </Text>
        </View>

        {/* ── Stats rapides ────────────────────────────── */}
        {stats && (
          <View className="mx-4 mb-5 gap-3">
            {/* Jauge remplissage */}
            <View className="bg-card border border-border rounded-2xl p-4 gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground font-semibold text-sm">
                  Remplissage
                </Text>
                <Text
                  className="font-bold text-sm"
                  style={{
                    color:
                      fillRate >= 90
                        ? "#ef4444"
                        : fillRate >= 70
                          ? "#f97316"
                          : "#6366f1",
                  }}
                >
                  {fillRate}%
                </Text>
              </View>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${fillRate}%`,
                    backgroundColor:
                      fillRate >= 90
                        ? "#ef4444"
                        : fillRate >= 70
                          ? "#f97316"
                          : "#6366f1",
                  }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-xs">
                  {stats.capacity - stats.remainingSeats} inscrits
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {stats.remainingSeats} places restantes
                </Text>
              </View>
            </View>

            {/* Chiffres clés */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-1">
                <Text className="text-foreground font-bold text-2xl">
                  {stats.tickets.ACTIVE}
                </Text>
                <Text className="text-muted-foreground text-xs">Actifs</Text>
              </View>
              <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-1">
                <Text className="text-foreground font-bold text-2xl">
                  {stats.tickets.USED}
                </Text>
                <Text className="text-muted-foreground text-xs">Présents</Text>
              </View>
              <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-1">
                <Text
                  className="font-bold text-2xl"
                  style={{ color: "#6366f1" }}
                >
                  {stats.attendanceRate}%
                </Text>
                <Text className="text-muted-foreground text-xs">Présence</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Actions rapides ──────────────────────────── */}
        <View className="px-4 mb-5">
          <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
            Gestion
          </Text>
          <View className="flex-row gap-3 mb-3">
            <ActionCard
              icon={Users}
              label="Inscrits"
              sublabel={`${stats?.tickets.total ?? 0} inscrits`}
              onPress={() =>
                router.push(`/(tabs)/profile/events/${id}/attendees` as Href)
              }
            />
            <ActionCard
              icon={Shield}
              label="Modérateurs"
              onPress={() =>
                router.push(`/(tabs)/profile/events/${id}/moderators` as Href)
              }
            />
          </View>
          <View className="flex-row gap-3">
            <ActionCard
              icon={BarChart2}
              label="Statistiques"
              onPress={() =>
                router.push(`/(tabs)/profile/events/${id}/stats` as Href)
              }
            />
            <ActionCard
              icon={QrCode}
              label="Scanner"
              sublabel="Valider les tickets"
              color="#22c55e"
              onPress={() =>
                router.push(`/(tabs)/profile/events/${id}/scan` as Href)
              }
            />
          </View>
        </View>

        {/* ── Actions statut ───────────────────────────── */}
        <View className="px-4 gap-3">
          <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Actions
          </Text>

          {event.status === "DRAFT" && (
            <TouchableOpacity
              onPress={() => publish()}
              disabled={isPublishing}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
              style={{ backgroundColor: isPublishing ? "#a5b4fc" : "#6366f1" }}
            >
              {isPublishing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Play size={16} color="white" />
                  <Text className="text-white font-bold text-sm">
                    Publier un événement
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {(event.status === "PUBLISHED" || event.status === "ONGOING") && (
            <TouchableOpacity
              onPress={confirmClose}
              disabled={isClosing}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl py-4"
            >
              {isClosing ? (
                <ActivityIndicator color="#f97316" />
              ) : (
                <>
                  <X size={16} color="#f97316" />
                  <Text
                    className="font-bold text-sm"
                    style={{ color: "#f97316" }}
                  >
                    Clôturer un événement
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {event.status !== "ONGOING" && (
            <TouchableOpacity
              onPress={confirmDelete}
              disabled={isDeleting}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-2xl py-4"
            >
              {isDeleting ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <>
                  <Trash2 size={16} color="#ef4444" />
                  <Text className="font-bold text-sm text-red-500">
                    Supprimer un événement
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
