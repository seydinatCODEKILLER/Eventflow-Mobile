import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import { Bell } from "lucide-react-native";
import { Href, useRouter } from "expo-router";
import { useFeed } from "@/src/lib/hooks/use-feed";
import { EventCard } from "@/src/components/shared/EventCard";
import { FeedFilters } from "@/src/lib/types/feed.type";
import { useNotifStore } from "@/src/lib/store/notif.store";
import { useAuthStore } from "@/src/lib/store/auth.store";

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotifStore((s) => s.unreadCount);
  const [filters] = useState<FeedFilters>({});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useFeed(filters);

  const events = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-muted-foreground text-xs">Bonjour 👋</Text>
          <Text className="text-foreground font-bold text-lg">
            {user?.fullName.split(" ")[0]}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">

          {/* Notifications */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile/notifications?from=feed" as Href)}
            className="w-10 h-10 bg-card border border-border rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Bell size={18} color="#6b7280" />
            {unreadCount > 0 && (
              <View
                className="absolute -top-1 -right-1 bg-destructive rounded-full items-center justify-center"
                style={{ width: 16, height: 16 }}
              >
                <Text className="text-white font-bold" style={{ fontSize: 9 }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <EventCard event={item} index={index} from="feed" />}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#6366f1"
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 gap-3">
              <Text className="text-4xl">📅</Text>
              <Text className="text-foreground font-bold text-lg">
                Aucun événement
              </Text>
              <Text className="text-muted-foreground text-sm text-center px-8">
                Revenez bientôt, de nouveaux events seront publiés.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
