import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef, useCallback } from "react";
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
import { Href, useRouter as useExpoRouter, useRouter } from "expo-router";

// ─── Config icônes par type ───────────────────────────────────
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

// ─── Temps relatif ────────────────────────────────────────────
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

// ─── Item notification ────────────────────────────────────────
function NotifItem({
  item,
  onRead,
  onDelete,
}: {
  item: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useExpoRouter();
  const config = NOTIF_CONFIG[item.type];
  const Icon = config.icon;
  const swipeableRef = useRef<Swipeable>(null);

  const handlePress = useCallback(() => {
    if (!item.isRead) onRead(item.id);

    // Navigation selon le type
    if (item.metadata?.eventId) {
      router.push(`/(tabs)/feed/${item.metadata.eventId}` as Href);
    }
  }, [item, onRead, router]);

  // Action swipe gauche — supprimer
  const renderRightActions = useCallback(
    (_: any, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0.5],
        extrapolate: "clamp",
      });

      return (
        <TouchableOpacity
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(item.id);
          }}
          className="bg-destructive items-center justify-center px-5 rounded-r-2xl"
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={20} color="white" />
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
        className="mx-4 mb-2 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: item.isRead ? "#ffffff" : "#f5f3ff",
          borderWidth: 1,
          borderColor: item.isRead ? "#f3f4f6" : "#ede9fe",
        }}
      >
        <View className="flex-row items-start gap-3 p-4">
          {/* Icône */}
          <View
            className="w-10 h-10 rounded-xl items-center justify-center shrink-0"
            style={{ backgroundColor: config.bg }}
          >
            <Icon size={18} color={config.color} />
          </View>

          {/* Contenu */}
          <View className="flex-1 gap-0.5">
            <View className="flex-row items-start justify-between gap-2">
              <Text
                className="text-foreground text-sm flex-1"
                style={{ fontWeight: item.isRead ? "500" : "700" }}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
              )}
            </View>

            <Text
              className="text-muted-foreground text-xs leading-5"
              numberOfLines={2}
            >
              {item.body}
            </Text>

            <Text className="text-muted-foreground text-xs mt-1">
              {getRelativeTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const unreadCount = useNotifStore((s) => s.unreadCount);

  const { data, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  const notifications = data?.data ?? [];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <Text className="text-foreground font-bold text-lg">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View className="bg-primary rounded-full px-2 py-0.5">
                <Text className="text-white text-xs font-bold">
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
            className="flex-row items-center gap-1.5"
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <CheckCheck size={16} color="#6366f1" />
            )}
            <Text className="text-primary text-xs font-semibold">
              Tout lire
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifItem item={item} onRead={markAsRead} onDelete={deleteNotif} />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-muted/50 items-center justify-center">
                <Bell size={36} color="#9ca3af" />
              </View>
              <Text className="text-foreground font-bold text-lg">
                Aucune notification
              </Text>
              <Text className="text-muted-foreground text-sm text-center px-8">
                Vous recevrez ici vos confirmations inscription, rappels
                events et autres alertes.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
