import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
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

// ─── Badge statut ──────────────────────────────────────────────────────────────
function EventStatusBadge({ status }: { status: OrganizedEvent["status"] }) {
  const config = {
    DRAFT: { label: "Brouillon", bg: "#f3f4f6", color: "#4b5563" },
    PUBLISHED: { label: "Publié", bg: "#dbeafe", color: "#1d4ed8" },
    ONGOING: { label: "En cours", bg: "#d1fae5", color: "#065f46" },
    CLOSED: { label: "Clôturé", bg: "#fee2e2", color: "#991b1b" },
  }[status];

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
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

// ─── Barre de remplissage ──────────────────────────────────────────────────────
function FillBar({
  count,
  capacity,
  color,
}: {
  count: number;
  capacity: number;
  color: string;
}) {
  const pct = capacity > 0 ? Math.min((count / capacity) * 100, 100) : 0;
  return (
    <View
      style={{
        height: 4,
        backgroundColor: "#ededf0",
        borderRadius: 100,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: color,
          borderRadius: 100,
        }}
      />
    </View>
  );
}

// ─── Séparateur de section ─────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "#8e8e93",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
      }}
    >
      {label}
    </Text>
  );
}

// ─── Card event ────────────────────────────────────────────────────────────────
function EventCard({ event }: { event: OrganizedEvent }) {
  const router = useRouter();

  const accentColor =
    event.status === "ONGOING"
      ? "#10b981"
      : event.status === "PUBLISHED"
        ? "#3b82f6"
        : event.status === "CLOSED"
          ? "#ef4444"
          : "#d1d5db";

  const fillColor = event.status === "ONGOING" ? "#10b981" : "#6366f1";
  const count = event.ticketsCount ?? 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/profile/events/${event.id}` as Href)}
      activeOpacity={0.82}
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.07)",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Accent bar gauche */}
        <View style={{ width: 4, backgroundColor: accentColor }} />

        <View style={{ flex: 1, padding: 14 }}>
          {/* Titre + badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#0f0f10",
                lineHeight: 20,
                flex: 1,
              }}
              numberOfLines={2}
            >
              {event.title}
            </Text>
            <EventStatusBadge status={event.status} />
          </View>

          {/* Meta */}
          <View style={{ gap: 5, marginBottom: 10 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Calendar size={12} color="#8e8e93" />
              <Text
                style={{ fontSize: 11, color: "#8e8e93", fontWeight: "500" }}
              >
                {formatDate(event.startDate)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Users size={12} color="#6366f1" />
                <Text
                  style={{ fontSize: 11, color: "#8e8e93", fontWeight: "500" }}
                >
                  <Text style={{ color: "#6366f1", fontWeight: "700" }}>
                    {count}
                  </Text>
                  {" / "}
                  {event.capacity} inscrits
                </Text>
              </View>
              {event.status === "ONGOING" && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <ScanLine size={12} color="#10b981" />
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#10b981",
                      fontWeight: "700",
                    }}
                  >
                    {event.scansCount ?? 0} scans
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Barre de remplissage */}
          <FillBar count={count} capacity={event.capacity} color={fillColor} />

          {/* Footer */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 10,
              borderTopWidth: 0.5,
              borderTopColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#6366f1" }}>
              Gérer →
            </Text>
            {event.status === "DRAFT" && (
              <Text style={{ fontSize: 10, color: "#8e8e93" }}>Non publié</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyEventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading } = useOrganizedEvents();
  const events: OrganizedEvent[] = data?.data ?? [];

  const active = events.filter(
    (e) => e.status === "ONGOING" || e.status === "PUBLISHED",
  );
  const drafts = events.filter((e) => e.status === "DRAFT");
  const closed = events.filter((e) => e.status === "CLOSED");

  const total = events.length;
  const published = events.filter((e) => e.status === "PUBLISHED").length;
  const ongoing = events.filter((e) => e.status === "ONGOING").length;
  const draft = drafts.length;

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
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f0f10" }}>
            Mes événements
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/create")}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#6366f1",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 9,
          }}
        >
          <Plus size={15} color="white" />
          <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
            Créer
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : events.length === 0 ? (
        // ✅ Empty state affiché uniquement quand aucun événement
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: "#eef2ff",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Calendar size={28} color="#6366f1" />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f0f10" }}>
            Aucun événement créé
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#8e8e93",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Créez votre premier événement et touchez votre audience.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/create")}
            activeOpacity={0.85}
            style={{
              marginTop: 8,
              backgroundColor: "#6366f1",
              borderRadius: 14,
              paddingHorizontal: 24,
              paddingVertical: 13,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
              Créer un événement
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ✅ ScrollView simple quand il y a des événements
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Summary strip */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              padding: 14,
              paddingBottom: 6,
            }}
          >
            {[
              { val: total, lbl: "Total", color: "#6366f1" },
              { val: published, lbl: "Publiés", color: "#3b82f6" },
              { val: ongoing, lbl: "En cours", color: "#10b981" },
              { val: draft, lbl: "Brouillons", color: "#9ca3af" },
            ].map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  borderWidth: 0.5,
                  borderColor: "rgba(0,0,0,0.07)",
                  padding: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: s.color }}
                >
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

          {active.length > 0 && (
            <>
              <SectionLabel label="Actifs" />
              {active.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </>
          )}
          {drafts.length > 0 && (
            <>
              <SectionLabel label="Brouillons" />
              {drafts.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </>
          )}
          {closed.length > 0 && (
            <>
              <SectionLabel label="Clôturés" />
              {closed.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
