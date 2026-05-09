import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  SectionList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useCallback, useMemo } from "react";
import { Swipeable } from "react-native-gesture-handler";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Ticket,
  Shield,
  QrCode,
  X,
  Clock,
} from "lucide-react-native";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/src/lib/hooks/use-notifications";
import {
  Notification,
  NotificationType,
} from "@/src/lib/types/notification.type";
import { useNotifStore } from "@/src/lib/store/notif.store";
import { Href, useRouter } from "expo-router";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

// ─── Config icônes ─────────────────────────────────────────────────────────────
const NOTIF_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  INSCRIPTION_CONFIRMED: { icon: Ticket, color: "#6366f1", bg: "#ede9fe" },
  EVENT_REMINDER: { icon: Clock, color: "#f97316", bg: "#fff7ed" },
  MODERATOR_ASSIGNED: { icon: Shield, color: "#3b82f6", bg: "#dbeafe" },
  TICKET_SCANNED: { icon: QrCode, color: "#22c55e", bg: "#dcfce7" },
  EVENT_CANCELLED: { icon: X, color: "#ef4444", bg: "#fee2e2" },
  EVENT_UPDATED: { icon: Calendar, color: "#8b5cf6", bg: "#ede9fe" },
};

// ─── Temps relatif ──────────────────────────────────────────────────────────────
const getRelativeTime = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
};

// ─── Grouper par date ───────────────────────────────────────────────────────────
const groupByDate = (notifications: Notification[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: Record<string, Notification[]> = {};

  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    let key: string;
    if (d.getTime() === today.getTime()) key = "Aujourd'hui";
    else if (d.getTime() === yesterday.getTime()) key = "Hier";
    else key = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
};

// ─── Item notification ──────────────────────────────────────────────────────────
function NotifItem({
  item,
  onRead,
  onDelete,
}: {
  item: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const config = NOTIF_CONFIG[item.type];
  const Icon = config.icon;
  const swipeableRef = useRef<Swipeable>(null);

  const handlePress = useCallback(() => {
    if (!item.isRead) onRead(item.id);
    if (item.metadata?.eventId)
      router.push(`/(tabs)/feed/${item.metadata.eventId}?from=notification` as Href);
  }, [item, onRead, router]);

  const renderRightActions = useCallback(
    (_: any, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-72, 0],
        outputRange: [1, 0.6],
        extrapolate: "clamp",
      });
      return (
        <TouchableOpacity
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(item.id);
          }}
          style={{
            backgroundColor: "#ef4444",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            marginBottom: 1,
          }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={19} color="white" />
          </Animated.View>
        </TouchableOpacity>
      );
    },
    [item.id, onDelete],
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
          paddingVertical: 13,
          paddingHorizontal: 18,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#efefef",
          borderLeftWidth: item.isRead ? 0 : 3,
          borderLeftColor: item.isRead ? "transparent" : "#6366f1",
        }}
      >
        {/* Icône */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            backgroundColor: config.bg,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={19} color={config.color} />
        </View>

        {/* Contenu */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
              marginBottom: 3,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                flex: 1,
                lineHeight: 18,
                color: "#111",
                fontWeight: item.isRead ? "500" : "700",
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={{ fontSize: 11, color: "#999", flexShrink: 0 }}>
              {getRelativeTime(item.createdAt)}
            </Text>
          </View>

          <Text
            style={{ fontSize: 12, color: "#999", lineHeight: 18 }}
            numberOfLines={2}
          >
            {item.body}
          </Text>
        </View>

        {/* Point non lu */}
        {!item.isRead && (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: "#6366f1",
              flexShrink: 0,
              marginTop: 5,
            }}
          />
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}

// ─── Écran principal ────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const goBack = useSmartBack({
    defaultRoute: "/(tabs)/profile" as Href,
    routeMap: {
      feed: "/(tabs)/feed" as Href,
    },
  });
  const unreadCount = useNotifStore((s) => s.unreadCount);

  const { data, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  const notifications = useMemo(() => data?.data ?? [], [data]);
  const sections = useMemo(() => groupByDate(notifications), [notifications]);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#fafafa", paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#efefef",
          backgroundColor: "rgba(250,250,250,0.97)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#efefef",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={16} color="#111" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#111" }}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View
                style={{
                  backgroundColor: "#6366f1",
                  borderRadius: 100,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tout marquer comme lu */}
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => markAllAsRead()}
            disabled={isMarkingAll}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <CheckCheck size={15} color="#6366f1" />
            )}
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#6366f1" }}>
              Tout lire
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : notifications.length === 0 ? (
        /* Empty state */
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
            <Bell size={28} color="#6366f1" />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#111" }}>
            Aucune notification
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#999",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Vous recevrez ici vos confirmations inscription, rappels événements
            et autres alertes.
          </Text>
        </View>
      ) : (
        /* SectionList groupé par date */
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifItem item={item} onRead={markAsRead} onDelete={deleteNotif} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                paddingHorizontal: 18,
                paddingTop: 16,
                paddingBottom: 6,
                backgroundColor: "#fafafa",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  color: "#999",
                }}
              >
                {title}
              </Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
}
