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
  Pencil,
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

// ─── Badge statut ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Event["status"] }) {
  const config = {
    DRAFT: { label: "Brouillon", bg: "#f3f4f6", color: "#4b5563" },
    PUBLISHED: { label: "Publié", bg: "#dbeafe", color: "#1d4ed8" },
    ONGOING: { label: "En cours", bg: "#d1fae5", color: "#065f46" },
    CLOSED: { label: "Clôturé", bg: "#fee2e2", color: "#991b1b" },
  }[status];

  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: config.bg }}
    >
      <Text style={{ color: config.color, fontSize: 12, fontWeight: "700" }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Carte action ─────────────────────────────────────────────────────────────
function ActionCard({
  icon: Icon,
  label,
  sublabel,
  onPress,
  color = "#6366f1",
  iconBg = "#eef2ff",
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
  iconBg?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.07)",
        padding: 15,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color={color} />
      </View>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#0f0f10" }}>
        {label}
      </Text>
      {sublabel && (
        <Text style={{ fontSize: 11, color: "#8e8e93", marginTop: -6 }}>
          {sublabel}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function EventDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: event, isLoading } = useEvent(id);
  const { data: stats } = useEventStats(id);
  const { mutate: publish, isPending: isPublishing } = usePublishEvent(id);
  const { mutate: close, isPending: isClosing } = useCloseEvent(id);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  const confirmClose = () =>
    Alert.alert(
      "Clôturer l'événement",
      "Cette action est irréversible. L'événement sera fermé aux inscriptions.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Clôturer", style: "destructive", onPress: () => close() },
      ],
    );

  const confirmDelete = () =>
    Alert.alert("Supprimer l'événement", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deleteEvent(id),
      },
    ]);

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f7",
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );

  if (!event)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f7",
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f0f10" }}>
          Événement introuvable
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#6366f1", fontWeight: "600" }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );

  const capacity = stats?.capacity ?? 0;
  const remainingSeats = stats?.remainingSeats ?? 0;
  const registered = capacity > 0 ? capacity - remainingSeats : 0;
  const fillRate = capacity > 0 ? Math.round((registered / capacity) * 100) : 0;
  const fillColor =
    fillRate >= 90 ? "#ef4444" : fillRate >= 70 ? "#f59e0b" : "#6366f1";

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f5f5f7", paddingTop: insets.top }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: "rgba(0,0,0,0.07)",
          backgroundColor: "rgba(245,245,247,0.9)",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
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

        <StatusBadge status={event.status} />

        {event.status !== "CLOSED" ? (
          <TouchableOpacity
            onPress={() =>
              router.push(`/(tabs)/profile/events/${id}/edit` as Href)
            }
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
            <Pencil size={16} color="#0f0f10" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <View
          style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.1,
              color: "#6366f1",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Événement
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#0f0f10",
              lineHeight: 28,
              marginBottom: 10,
            }}
          >
            {event.title}
          </Text>
          <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap" }}>
            <Text style={{ fontSize: 13, color: "#8e8e93", fontWeight: "500" }}>
              📅 {formatDate(event.startDate)}
            </Text>
            <Text style={{ fontSize: 13, color: "#8e8e93", fontWeight: "500" }}>
              📍 {event.location}
            </Text>
            <Text style={{ fontSize: 13, color: "#8e8e93", fontWeight: "500" }}>
              🎟{" "}
              {event.isFree
                ? "Gratuit"
                : formatPrice(event.price!, event.currency)}
            </Text>
          </View>
        </View>

        {/* ── Jauge remplissage ────────────────────────────────────────── */}
        {stats && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              backgroundColor: "#fff",
              borderRadius: 20,
              borderWidth: 0.5,
              borderColor: "rgba(0,0,0,0.07)",
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#0f0f10" }}
              >
                Remplissage
              </Text>
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: fillColor }}
              >
                {fillRate}%
              </Text>
            </View>
            {/* Track */}
            <View
              style={{
                height: 6,
                backgroundColor: "#ededf0",
                borderRadius: 100,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${fillRate}%`,
                  backgroundColor: fillColor,
                  borderRadius: 100,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 12, color: "#8e8e93" }}>
                <Text style={{ fontWeight: "700", color: "#0f0f10" }}>
                  {registered}
                </Text>{" "}
                inscrits
              </Text>
              <Text style={{ fontSize: 12, color: "#8e8e93" }}>
                <Text style={{ fontWeight: "700", color: "#0f0f10" }}>
                  {stats.remainingSeats}
                </Text>{" "}
                restantes
              </Text>
            </View>
          </View>
        )}

        {/* ── Stats clés ───────────────────────────────────────────────── */}
        {stats && (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginHorizontal: 16,
              marginTop: 12,
            }}
          >
            {[
              { val: stats.tickets.ACTIVE, lbl: "Actifs", accent: false },
              { val: stats.tickets.USED, lbl: "Présents", accent: false },
              {
                val: `${stats.attendanceRate}%`,
                lbl: "Présence",
                accent: true,
              },
            ].map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  borderWidth: 0.5,
                  borderColor: "rgba(0,0,0,0.07)",
                  padding: 14,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: s.accent ? "#6366f1" : "#0f0f10",
                    lineHeight: 28,
                  }}
                >
                  {s.val}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#8e8e93",
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  {s.lbl}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Gestion ──────────────────────────────────────────────────── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "#8e8e93",
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 10,
          }}
        >
          Gestion
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 16,
            marginBottom: 10,
          }}
        >
          <ActionCard
            icon={Users}
            label="Inscrits"
            sublabel={`${stats?.tickets.total ?? 0} participants`}
            onPress={() =>
              router.push(`/(tabs)/profile/events/${id}/attendees` as Href)
            }
            color="#6366f1"
            iconBg="#eef2ff"
          />
          <ActionCard
            icon={Shield}
            label="Modérateurs"
            sublabel="Gérer l'équipe"
            onPress={() =>
              router.push(`/(tabs)/profile/events/${id}/moderators` as Href)
            }
            color="#16a34a"
            iconBg="#f0fdf4"
          />
        </View>
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16 }}>
          <ActionCard
            icon={BarChart2}
            label="Statistiques"
            sublabel="Voir les détails"
            onPress={() =>
              router.push(`/(tabs)/profile/events/${id}/stats` as Href)
            }
            color="#ea580c"
            iconBg="#fff7ed"
          />
          <ActionCard
            icon={QrCode}
            label="Scanner"
            sublabel="Valider les tickets"
            onPress={() =>
              router.push(`/(tabs)/profile/events/${id}/scan` as Href)
            }
            color="#10b981"
            iconBg="#f0fdf4"
          />
        </View>

        {/* ── Actions statut ───────────────────────────────────────────── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "#8e8e93",
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 10,
          }}
        >
          Actions
        </Text>
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {event.status === "DRAFT" && (
            <TouchableOpacity
              onPress={() => publish()}
              disabled={isPublishing}
              activeOpacity={0.82}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: isPublishing ? "#a5b4fc" : "#6366f1",
                borderRadius: 16,
                paddingVertical: 15,
              }}
            >
              {isPublishing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Play size={16} color="white" fill="white" />
                  <Text
                    style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                  >
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
              activeOpacity={0.82}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#fffbeb",
                borderRadius: 16,
                paddingVertical: 15,
                borderWidth: 1.5,
                borderColor: "#fcd34d",
              }}
            >
              {isClosing ? (
                <ActivityIndicator color="#d97706" />
              ) : (
                <>
                  <X size={16} color="#d97706" />
                  <Text
                    style={{
                      color: "#d97706",
                      fontWeight: "700",
                      fontSize: 14,
                    }}
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
              activeOpacity={0.82}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#fee2e2",
                borderRadius: 16,
                paddingVertical: 15,
                borderWidth: 1.5,
                borderColor: "#fca5a5",
              }}
            >
              {isDeleting ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <>
                  <Trash2 size={16} color="#ef4444" />
                  <Text
                    style={{
                      color: "#ef4444",
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
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
