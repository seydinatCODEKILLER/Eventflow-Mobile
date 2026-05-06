import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { ArrowLeft, QrCode, Calendar, Ticket } from "lucide-react-native";
import { useMyTickets } from "@/src/lib/hooks/use-users";
import { UserTicket } from "@/src/lib/types/user.type";
import { formatDateTime } from "@/src/lib/utils/format";

// ─── Badge statut ticket ──────────────────────────────────────
function TicketBadge({ status }: { status: UserTicket["status"] }) {
  const config = {
    ACTIVE: { label: "Valide", bg: "#dcfce7", color: "#16a34a" },
    USED: { label: "Utilisé", bg: "#f3f4f6", color: "#6b7280" },
    CANCELLED: { label: "Annulé", bg: "#fee2e2", color: "#dc2626" },
  }[status];

  return (
    <View
      className="px-2.5 py-1 rounded-full flex-row items-center gap-1"
      style={{ backgroundColor: config.bg }}
    >
      <View
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <Text className="text-[10px] font-bold" style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Card ticket ──────────────────────────────────────────────
function TicketCard({ ticket }: { ticket: UserTicket }) {
  const router = useRouter();
  const isActive = ticket.status === "ACTIVE";

  return (
    <TouchableOpacity
      // ✅ CORRECTION : "tickets" au pluriel pour matcher le dossier
      onPress={() =>
        router.push(`/(tabs)/profile/tickets/${ticket.id}` as Href)
      }
      activeOpacity={0.8}
      className="mx-4 mb-4 bg-card border border-border rounded-3xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        // ✅ AMÉLIORATION : Griser la card si le ticket n'est plus valide
        opacity: isActive ? 1 : 0.6,
      }}
    >
      {/* Bande colorée selon statut */}
      <View
        className="h-1 w-full"
        style={{
          backgroundColor:
            ticket.status === "ACTIVE"
              ? "#6366f1"
              : ticket.status === "USED"
                ? "#9ca3af"
                : "#ef4444",
        }}
      />

      <View className="flex-row">
        {/* ✅ AMÉLIORATION : Ajout de l'image de l'event */}
        <View className="w-24 h-28 bg-muted/30 relative">
          {ticket.event.imageUrl ? (
            <Image
              source={{ uri: ticket.event.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ticket size={24} color="#d1d5db" />
            </View>
          )}

          {/* Pastille QR si actif */}
          {isActive && (
            <View className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-white/90 rounded-lg items-center justify-center shadow-sm">
              <QrCode size={14} color="#6366f1" />
            </View>
          )}
        </View>

        {/* Contenu */}
        <View className="flex-1 p-3.5 justify-between">
          <View>
            <Text
              className="text-foreground font-bold text-sm leading-tight"
              numberOfLines={2}
            >
              {ticket.event.title}
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2">
              <Calendar size={12} color="#9ca3af" />
              <Text className="text-muted-foreground text-[11px]">
                {formatDateTime(ticket.event.startDate)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <TicketBadge status={ticket.status} />
            {isActive && (
              <Text className="text-primary text-[10px] font-semibold">
                Voir le ticket →
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: tickets, isLoading } = useMyTickets();

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
        <Text className="text-foreground font-bold text-lg">Mes tickets</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TicketCard ticket={item} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-4">
              <Text className="text-4xl">🎟️</Text>
              <Text className="text-foreground font-bold text-lg">
                Aucun ticket
              </Text>
              <Text className="text-muted-foreground text-sm text-center px-8">
                Inscrivez-vous à un événement pour voir vos tickets ici.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/feed")}
                activeOpacity={0.85}
                className="bg-primary rounded-2xl px-6 py-3 mt-2"
              >
                <Text className="text-white font-bold text-sm">
                  Explorer le feed
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}
