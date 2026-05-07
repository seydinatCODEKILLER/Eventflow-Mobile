import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { ArrowLeft, QrCode, Calendar, Ticket } from "lucide-react-native";
import { useMyTickets } from "@/src/lib/hooks/use-users";
import { UserTicket } from "@/src/lib/types/user.type";
import { formatDateTime } from "@/src/lib/utils/format";

// ─── Badge statut ─────────────────────────────────────────────────────────────
function TicketBadge({ status }: { status: UserTicket["status"] }) {
  const config = {
    ACTIVE:    { label: "Valide",  bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
    USED:      { label: "Utilisé", bg: "#f3f4f6", color: "#4b5563", dot: "#9ca3af" },
    CANCELLED: { label: "Annulé", bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  }[status];

  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 100, backgroundColor: config.bg,
    }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: config.dot }} />
      <Text style={{ fontSize: 10, fontWeight: "700", color: config.color }}>{config.label}</Text>
    </View>
  );
}

// ─── Card ticket ───────────────────────────────────────────────────────────────
function TicketCard({ ticket }: { ticket: UserTicket }) {
  const router = useRouter();
  const isActive = ticket.status === "ACTIVE";

  const stripeColor =
    ticket.status === "ACTIVE" ? "#6366f1" :
    ticket.status === "USED"   ? "#9ca3af" : "#ef4444";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/profile/tickets/${ticket.id}` as Href)}
      activeOpacity={0.82}
      style={{
        marginHorizontal: 16, marginBottom: 12,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        borderWidth: 0.5, borderColor: "rgba(0,0,0,0.07)",
        overflow: "hidden",
        opacity: isActive ? 1 : 0.55,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
      }}
    >
      {/* Stripe statut */}
      <View style={{ height: 4, backgroundColor: stripeColor }} />

      <View style={{ flexDirection: "row" }}>
        {/* Image */}
        <View style={{
          width: 96, minHeight: 108,
          backgroundColor: "#ededf0",
          alignItems: "center", justifyContent: "center",
        }}>
          {ticket.event.imageUrl ? (
            <Image
              source={{ uri: ticket.event.imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Ticket size={24} color="#d1d5db" />
          )}
          {isActive && (
            <View style={{
              position: "absolute", bottom: 8, right: 8,
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center", justifyContent: "center",
            }}>
              <QrCode size={14} color="#6366f1" />
            </View>
          )}
        </View>

        {/* Séparateur pointillé — simulé par une bordure */}
        <View style={{
          width: 0,
          borderLeftWidth: 1.5, borderLeftColor: "rgba(0,0,0,0.08)",
          borderStyle: "dashed",
          marginVertical: 12,
        }} />

        {/* Contenu */}
        <View style={{ flex: 1, padding: 13, justifyContent: "space-between" }}>
          <View>
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: "#0f0f10", lineHeight: 18, marginBottom: 7 }}
              numberOfLines={2}
            >
              {ticket.event.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Calendar size={12} color="#8e8e93" />
              <Text style={{ fontSize: 11, color: "#8e8e93", fontWeight: "500" }}>
                {formatDateTime(ticket.event.startDate)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <TicketBadge status={ticket.status} />
            {isActive && (
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#6366f1" }}>
                Voir le ticket →
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Séparateur de section ─────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: "700", letterSpacing: 1,
      textTransform: "uppercase", color: "#8e8e93",
      paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8,
    }}>
      {label}
    </Text>
  );
}

// ─── Écran principal ───────────────────────────────────────────────────────────
export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: tickets, isLoading } = useMyTickets();

  const total     = tickets?.length ?? 0;
  const active    = tickets?.filter(t => t.status === "ACTIVE").length    ?? 0;
  const used      = tickets?.filter(t => t.status === "USED").length      ?? 0;
  const cancelled = tickets?.filter(t => t.status === "CANCELLED").length ?? 0;

  const upcoming = tickets?.filter(t => t.status === "ACTIVE")    ?? [];
  const past     = tickets?.filter(t => t.status !== "ACTIVE")    ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f7", paddingTop: insets.top }}>

      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(0,0,0,0.07)",
        backgroundColor: "rgba(245,245,247,0.9)",
      }}>
        <TouchableOpacity
          onPress={() => router.back()} activeOpacity={0.7}
          style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: "#fff", borderWidth: 0.5,
            borderColor: "rgba(0,0,0,0.08)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft size={17} color="#0f0f10" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f0f10" }}>Mes tickets</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <>
          {/* Summary strip */}
          {total > 0 && (
            <View style={{ flexDirection: "row", gap: 10, padding: 16, paddingBottom: 8 }}>
              {[
                { val: total,     lbl: "Total",   color: "#6366f1" },
                { val: active,    lbl: "Valides",  color: "#10b981" },
                { val: used,      lbl: "Utilisés", color: "#8e8e93" },
                { val: cancelled, lbl: "Annulés",  color: "#ef4444" },
              ].map((s, i) => (
                <View key={i} style={{
                  flex: 1, backgroundColor: "#fff",
                  borderRadius: 16, borderWidth: 0.5,
                  borderColor: "rgba(0,0,0,0.07)", padding: 10, alignItems: "center",
                }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: s.color }}>{s.val}</Text>
                  <Text style={{ fontSize: 10, color: "#8e8e93", fontWeight: "500", marginTop: 2 }}>{s.lbl}</Text>
                </View>
              ))}
            </View>
          )}

          <FlatList
            data={[]}
            keyExtractor={() => ""}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {upcoming.length > 0 && (
                  <>
                    <SectionLabel label="À venir" />
                    {upcoming.map(t => <TicketCard key={t.id} ticket={t} />)}
                  </>
                )}
                {past.length > 0 && (
                  <>
                    <SectionLabel label="Passés" />
                    {past.map(t => <TicketCard key={t.id} ticket={t} />)}
                  </>
                )}
              </>
            }
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 32 }}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingTop: 80, gap: 12 }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 20,
                  backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center",
                  marginBottom: 4,
                }}>
                  <Ticket size={28} color="#6366f1" />
                </View>
                <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f0f10" }}>Aucun ticket</Text>
                <Text style={{ fontSize: 13, color: "#8e8e93", textAlign: "center", lineHeight: 20 }}>
                  Inscrivez-vous à un événement pour voir vos tickets ici.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/feed")}
                  activeOpacity={0.85}
                  style={{
                    marginTop: 8, backgroundColor: "#6366f1",
                    borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                    Explorer le feed
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}