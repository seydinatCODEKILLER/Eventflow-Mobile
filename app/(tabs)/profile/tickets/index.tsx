import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { ArrowLeft, QrCode, Calendar, Ticket } from "lucide-react-native";
import { useMyTickets } from "@/src/lib/hooks/use-users";
import { UserTicket } from "@/src/lib/types/user.type";
import { formatDateTime } from "@/src/lib/utils/format";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";
import React from "react";

// ─── Configurations ───────────────────────────────────────────

const statusConfig: Record<
  UserTicket["status"],
  { label: string; bg: string; color: string; dot: string; band: string }
> = {
  ACTIVE: {
    label: "Valide",
    bg: "#dcfce7",
    color: "#15803d",
    dot: "#16a34a",
    band: "#6366f1",
  },
  USED: {
    label: "Utilisé",
    bg: "#f3f4f6",
    color: "#6b7280",
    dot: "#9ca3af",
    band: "#9ca3af",
  },
  CANCELLED: {
    label: "Annulé",
    bg: "#fee2e2",
    color: "#dc2626",
    dot: "#dc2626",
    band: "#ef4444",
  },
};

// ─── Types de filtre ──────────────────────────────────────────
type FilterKey = "ALL" | UserTicket["status"];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "ACTIVE", label: "Valides" },
  { key: "USED", label: "Utilisés" },
  { key: "CANCELLED", label: "Annulés" },
];

// ─── Filtre pills ─────────────────────────────────────────────
function FilterTabs({
  active,
  onChange,
}: {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 14,
      }}
    >
      {FILTERS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            activeOpacity={0.8}
            style={{
              backgroundColor: isActive ? "#111827" : "white",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: isActive ? "#111827" : "rgba(0,0,0,0.08)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isActive ? "white" : "#6b7280",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Badge statut ─────────────────────────────────────────────
function TicketBadge({ status }: { status: UserTicket["status"] }) {
  const cfg = statusConfig[status];
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        borderRadius: 20,
        paddingHorizontal: 9,
        paddingVertical: 3,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: cfg.dot,
        }}
      />
      <Text style={{ fontSize: 10, fontWeight: "700", color: cfg.color }}>
        {cfg.label}
      </Text>
    </View>
  );
}

// ─── Séparateur ticket style billet ──────────────────────────
function TicketDivider({ color = "#e5e7eb" }: { color?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 14,
      }}
    >
      {/* Demi-cercle gauche */}
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#F7F6F3",
          marginLeft: -21,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      />
      {/* Ligne tiretée */}
      <View
        style={{
          flex: 1,
          borderTopWidth: 1.5,
          borderTopColor: color,
          borderStyle: "dashed",
          marginHorizontal: 4,
        }}
      />
      {/* Demi-cercle droit */}
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#F7F6F3",
          marginRight: -21,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      />
    </View>
  );
}

// ─── Card ticket ──────────────────────────────────────────────
function TicketCard({ ticket }: { ticket: UserTicket }) {
  const router = useRouter();
  const isActive = ticket.status === "ACTIVE";
  const isInactive = ticket.status !== "ACTIVE";
  const cfg = statusConfig[ticket.status];

  // Couleur de la ligne tiretée selon statut
  const dividerColor =
    ticket.status === "ACTIVE"
      ? "#e5e7eb"
      : ticket.status === "CANCELLED"
        ? "#fee2e2"
        : "#f3f4f6";

  return (
    <TouchableOpacity
      onPress={() =>
        isActive
          ? router.push(`/(tabs)/profile/tickets/${ticket.id}?from=tickets` as Href)
          : undefined
      }
      activeOpacity={isActive ? 0.8 : 1}
      style={{
        backgroundColor: "white",
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        marginHorizontal: 16,
        marginBottom: 10,
        opacity: isInactive ? (ticket.status === "USED" ? 0.6 : 0.5) : 1,
      }}
    >
      {/* Bande colorée en haut */}
      <View style={{ height: 3, backgroundColor: cfg.band }} />

      <View style={{ flexDirection: "row" }}>
        {/* Zone image / icône */}
        <View
          style={{
            width: 88,
            backgroundColor: isActive ? "#EEF2FF" : "#f9fafb",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 14,
            paddingHorizontal: 6,
          }}
        >
          {ticket.event.imageUrl ? (
            <Image
              source={{ uri: ticket.event.imageUrl }}
              style={{ width: 60, height: 60, borderRadius: 10 }}
              resizeMode="cover"
            />
          ) : (
            <Ticket
              size={28}
              color={isActive ? "#6366f1" : "#d1d5db"}
              strokeWidth={1.5}
            />
          )}

          {/* Badge QR si actif */}
          {isActive && (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                paddingHorizontal: 6,
                paddingVertical: 3,
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                borderWidth: 1,
                borderColor: "#E0E7FF",
              }}
            >
              <QrCode size={10} color="#6366f1" />
              <Text
                style={{ fontSize: 9, fontWeight: "700", color: "#4f46e5" }}
              >
                QR
              </Text>
            </View>
          )}

          {/* Label "Scanné" ou "Annulé" */}
          {ticket.status === "USED" && (
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              Scanné
            </Text>
          )}
          {ticket.status === "CANCELLED" && (
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                color: "#ef4444",
                textAlign: "center",
              }}
            >
              Annulé
            </Text>
          )}
        </View>

        {/* Contenu */}
        <View
          style={{
            flex: 1,
            padding: 12,
            paddingBottom: 10,
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          <View>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: isInactive ? "#6b7280" : "#111827",
                lineHeight: 18,
                marginBottom: 6,
                textDecorationLine: isInactive ? "line-through" : "none",
                textDecorationColor: "#d1d5db",
              }}
            >
              {ticket.event.title}
            </Text>

            {/* Date */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginBottom: 4,
              }}
            >
              <Calendar
                size={11}
                color={isInactive ? "#d1d5db" : "#9ca3af"}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: isInactive ? "#d1d5db" : "#9ca3af",
                  fontWeight: "500",
                }}
              >
                {formatDateTime(ticket.event.startDate)}
              </Text>
            </View>
          </View>

          {/* Bas de carte : badge + CTA */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <TicketBadge status={ticket.status} />
            {isActive && (
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: "#6366f1" }}
              >
                Voir le ticket →
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Séparateur style billet */}
      <TicketDivider color={dividerColor} />

      {/* Pied de carte : référence + mini barcode décoratif */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 9,
            color: "#d1d5db",
            fontVariant: ["tabular-nums"],
          }}
        >
          TKT-{ticket.id.slice(0, 8).toUpperCase()}
        </Text>
        {/* Mini barcode décoratif */}
        {isActive && (
          <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
            {[3, 2, 5, 2, 4, 2, 3, 5, 2, 4].map((h, i) => (
              <View
                key={i}
                style={{
                  width: i % 3 === 0 ? 3 : 2,
                  height: h,
                  borderRadius: 0.5,
                  backgroundColor: "#6366f1",
                  opacity: 0.3 + (i % 4) * 0.18,
                }}
              />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goBack = useSmartBack({ defaultRoute: "/(tabs)/profile" as Href });
  const { data: tickets = [], isLoading } = useMyTickets();

  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("ALL");

  const activeCount = tickets.filter((t) => t.status === "ACTIVE").length;
  const filtered =
    activeFilter === "ALL"
      ? tickets
      : tickets.filter((t) => t.status === activeFilter);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F7F6F3", paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={17} color="#374151" />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              fontSize: 11,
              color: "#9ca3af",
              fontWeight: "500",
              marginBottom: 1,
            }}
          >
            Mes billets
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
            Mes tickets
          </Text>
        </View>

        {activeCount > 0 && (
          <View
            style={{
              marginLeft: "auto",
              backgroundColor: "#EEF2FF",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Calendar size={11} color="#6366f1" />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#4f46e5" }}>
              {activeCount} à venir
            </Text>
          </View>
        )}
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
          renderItem={({ item }) => <TicketCard ticket={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            tickets.length > 0 ? (
              <FilterTabs active={activeFilter} onChange={setActiveFilter} />
            ) : null
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingTop: 80,
                paddingHorizontal: 32,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 40 }}>🎟️</Text>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Aucun ticket
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {activeFilter !== "ALL"
                  ? "Aucun ticket dans cette catégorie."
                  : "Inscrivez-vous à un événement pour voir vos tickets ici."}
              </Text>
              {activeFilter === "ALL" && (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/feed")}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: 14,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                  >
                    Explorer le feed
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
