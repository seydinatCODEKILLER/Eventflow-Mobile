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
  Edit3,
} from "lucide-react-native";
import { useAuthStore } from "@/src/lib/store/auth.store";
import { useLogout } from "@/src/lib/hooks/use-auth";
import { useMyTickets } from "@/src/lib/hooks/use-users";
import { useNotifStore } from "@/src/lib/store/notif.store";
import { useOrganizedEvents } from "@/src/lib/hooks/use-events";
import { LinearGradient } from "expo-linear-gradient";

// ─── Item menu ────────────────────────────────────────────────
function MenuItem({
  icon: Icon,
  label,
  sublabel,
  badge,
  onPress,
  destructive,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  badge?: number;
  onPress: () => void;
  destructive?: boolean;
  iconBg?: string;
  iconColor?: string;
}) {
  const bg = destructive ? "#fee2e2" : (iconBg ?? "#ede9fe");
  const color = destructive ? "#ef4444" : (iconColor ?? "#6366f1");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className="flex-row items-center gap-3 px-4 py-4"
    >
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <Icon size={19} color={color} />
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
        <View
          className="rounded-full px-2 py-0.5 items-center justify-center"
          style={{ backgroundColor: "#6366f1", minWidth: 20, height: 20 }}
        >
          <Text className="text-white text-xs font-bold">
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      ) : (
        <ChevronRight size={16} color="#d1d5db" />
      )}
    </TouchableOpacity>
  );
}

// ─── Séparateur ───────────────────────────────────────────────
function MenuDivider() {
  return <View className="h-px mx-4 bg-border" />;
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
        {/* ── Hero header avec gradient ──────────────────── */}
        <LinearGradient
          colors={["#6366f1", "#818cf8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 20, paddingBottom: 60, paddingHorizontal: 16 }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white font-bold text-xl">Mon profile</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile/settings")}
              activeOpacity={0.8}
              className="w-9 h-9 rounded-xl items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Edit3 size={17} color="white" />
            </TouchableOpacity>
          </View>

          {/* Avatar + infos */}
          <View className="flex-row items-center gap-4">
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-20 h-20 rounded-3xl"
                style={{ borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" }}
              />
            ) : (
              <View
                className="w-20 h-20 rounded-3xl items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderWidth: 3,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Text className="text-white font-bold text-2xl">
                  {initials}
                </Text>
              </View>
            )}

            <View className="flex-1">
              <Text className="text-white font-bold text-xl">
                {user?.fullName}
              </Text>
              <Text className="text-white/70 text-sm mt-0.5">
                {user?.email}
              </Text>
              {user?.phone && (
                <Text className="text-white/60 text-xs mt-0.5">
                  {user.phone}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* ── Stats rapides flottantes ───────────────────── */}
        <View className="mx-4 -mt-8 mb-5">
          <View
            className="bg-white border border-border rounded-3xl flex-row overflow-hidden"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            {/* Tickets */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile/tickets")}
              activeOpacity={0.7}
              className="flex-1 py-4 items-center gap-1"
            >
              <Text className="text-foreground font-bold text-2xl">
                {activeTickets}
              </Text>
              <Text className="text-muted-foreground text-xs">
                Ticket{activeTickets > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>

            <View className="w-px bg-border my-3" />

            {/* Events */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile/events" as Href)}
              activeOpacity={0.7}
              className="flex-1 py-4 items-center gap-1"
            >
              <Text className="text-foreground font-bold text-2xl">
                {myEventsCount}
              </Text>
              <Text className="text-muted-foreground text-xs">
                Event{myEventsCount > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>

            <View className="w-px bg-border my-3" />

            {/* Notifs */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile/notifications")}
              activeOpacity={0.7}
              className="flex-1 py-4 items-center gap-1"
            >
              <View className="relative">
                <Text className="text-foreground font-bold text-2xl">
                  {unreadCount}
                </Text>
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-red-500" />
                )}
              </View>
              <Text className="text-muted-foreground text-xs">
                Notif{unreadCount > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Menu principal ─────────────────────────────── */}
        <View
          className="mx-4 bg-card border border-border rounded-3xl overflow-hidden mb-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <MenuItem
            icon={Ticket}
            label="Mes tickets"
            sublabel={`${activeTickets} ticket${activeTickets > 1 ? "s" : ""} actif${activeTickets > 1 ? "s" : ""}`}
            iconBg="#ede9fe"
            iconColor="#6366f1"
            onPress={() => router.push("/(tabs)/profile/tickets")}
          />
          <MenuDivider />
          <MenuItem
            icon={CalendarDays}
            label="Mes événements"
            sublabel={`${myEventsCount} event${myEventsCount > 1 ? "s" : ""} créé${myEventsCount > 1 ? "s" : ""}`}
            iconBg="#dbeafe"
            iconColor="#3b82f6"
            onPress={() => router.push("/(tabs)/profile/events" as Href)}
          />
          <MenuDivider />
          <MenuItem
            icon={CreditCard}
            label="Mes paiements"
            sublabel="Historique des transactions"
            iconBg="#dcfce7"
            iconColor="#22c55e"
            onPress={() => router.push("/(tabs)/profile/payments" as Href)}
          />
          <MenuDivider />
          <MenuItem
            icon={Bell}
            label="Notifications"
            sublabel={
              unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "À jour"
            }
            badge={unreadCount}
            iconBg="#fef3c7"
            iconColor="#f59e0b"
            onPress={() => router.push("/(tabs)/profile/notifications")}
          />
        </View>

        {/* ── Menu secondaire ─────────────────────────────── */}
        <View
          className="mx-4 bg-card border border-border rounded-3xl overflow-hidden mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <MenuItem
            icon={Settings}
            label="Paramètres"
            sublabel="Modifier mon profil"
            iconBg="#f3f4f6"
            iconColor="#6b7280"
            onPress={() => router.push("/(tabs)/profile/settings")}
          />
          <MenuDivider />
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
        <View className="absolute inset-0 bg-black/40 items-center justify-center">
          <View className="bg-white rounded-3xl p-6 items-center gap-3 mx-8">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="text-foreground font-semibold text-sm">
              Déconnexion...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
