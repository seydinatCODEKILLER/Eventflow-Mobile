import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import {
  Ticket,
  CalendarDays,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  CreditCard,
} from "lucide-react-native";
import { useAuthStore } from "@/src/lib/store/auth.store";
import { useLogout } from "@/src/lib/hooks/use-auth";
import { useMyTickets } from "@/src/lib/hooks/use-users";
import { useNotifStore } from "@/src/lib/store/notif.store";
import { useOrganizedEvents } from "@/src/lib/hooks/use-events";

// ─── Item menu ────────────────────────────────────────────────
function MenuItem({
  icon: Icon,
  label,
  sublabel,
  badge,
  onPress,
  destructive,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  badge?: number;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-4 px-4 py-3.5 bg-card border-b border-border"
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{
          backgroundColor: destructive ? "#fee2e2" : "#ede9fe",
        }}
      >
        <Icon size={18} color={destructive ? "#ef4444" : "#6366f1"} />
      </View>

      <View className="flex-1">
        <Text
          className="font-semibold text-sm"
          style={{ color: destructive ? "#ef4444" : "#111827" }}
        >
          {label}
        </Text>
        {sublabel && (
          <Text className="text-muted-foreground text-xs mt-0.5">
            {sublabel}
          </Text>
        )}
      </View>

      {badge !== undefined && badge > 0 ? (
        <View className="bg-primary rounded-full px-2 py-0.5">
          <Text className="text-white text-xs font-bold">{badge}</Text>
        </View>
      ) : (
        <ChevronRight size={16} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotifStore((s) => s.unreadCount);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const { data: tickets } = useMyTickets();
  const { data: eventsData } = useOrganizedEvents();

  const activeTickets =
    tickets?.filter((t) => t.status === "ACTIVE").length ?? 0;
  const myEventsCount = eventsData?.data?.length ?? 0;

  const initials = user?.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header profil ─────────────────────────────── */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-foreground font-bold text-2xl mb-5">
            Mon profil
          </Text>

          {/* Card profil */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile/settings")}
            activeOpacity={0.8}
            className="bg-card border border-border rounded-3xl p-4 flex-row items-center gap-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Avatar */}
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-16 h-16 rounded-2xl"
              />
            ) : (
              <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center">
                <Text className="text-primary font-bold text-xl">
                  {initials}
                </Text>
              </View>
            )}

            {/* Infos */}
            <View className="flex-1">
              <Text className="text-foreground font-bold text-base">
                {user?.fullName}
              </Text>
              <Text className="text-muted-foreground text-sm mt-0.5">
                {user?.email}
              </Text>
              {user?.phone && (
                <Text className="text-muted-foreground text-xs mt-0.5">
                  {user.phone}
                </Text>
              )}
            </View>

            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* ── Stats rapides ──────────────────────────────── */}
        <View className="flex-row mx-4 gap-3 mb-6">
          <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-1">
            <Text className="text-foreground font-bold text-2xl">
              {activeTickets}
            </Text>
            <Text className="text-muted-foreground text-xs">
              Ticket{activeTickets > 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-1">
            <Text className="text-foreground font-bold text-2xl">
              {myEventsCount}
            </Text>
            <Text className="text-muted-foreground text-xs">
              Event{myEventsCount > 1 ? "s" : ""} créé
              {myEventsCount > 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-1">
            <Text className="text-foreground font-bold text-2xl">
              {unreadCount}
            </Text>
            <Text className="text-muted-foreground text-xs">
              Notif{unreadCount > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* ── Menu ───────────────────────────────────────── */}
        <View className="mx-4 bg-card border border-border rounded-3xl overflow-hidden mb-4">
          <MenuItem
            icon={Ticket}
            label="Mes tickets"
            sublabel={`${activeTickets} ticket${activeTickets > 1 ? "s" : ""} actif${activeTickets > 1 ? "s" : ""}`}
            onPress={() => router.push("/(tabs)/profile/tickets")}
          />
          <MenuItem
            icon={CalendarDays}
            label="Mes événements"
            sublabel={`${myEventsCount} event${myEventsCount > 1 ? "s" : ""} créé${myEventsCount > 1 ? "s" : ""}`}
            onPress={() => router.push("/(tabs)/profile/events" as Href)}
          />
          <MenuItem
            icon={CreditCard}
            label="Mes paiements"
            onPress={() => router.push("/(tabs)/profile/payments" as Href)}
          />
          <MenuItem
            icon={Bell}
            label="Notifications"
            badge={unreadCount}
            onPress={() => router.push("/(tabs)/profile/notifications")}
          />
        </View>

        <View className="mx-4 bg-card border border-border rounded-3xl overflow-hidden mb-6">
          <MenuItem
            icon={Settings}
            label="Paramètres"
            sublabel="Modifier mon profil"
            onPress={() => router.push("/(tabs)/profile/settings")}
          />
          <MenuItem
            icon={LogOut}
            label="Se déconnecter"
            onPress={() => logout()}
            destructive
          />
        </View>

        {/* Version */}
        <Text className="text-center text-muted-foreground text-xs mb-8">
          EventFlow v1.0.0
        </Text>
      </ScrollView>

      {/* Overlay logout */}
      {isLoggingOut && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
}
