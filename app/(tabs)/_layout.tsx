import { Redirect, Tabs } from "expo-router";
import { Platform, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, PlusSquare, User } from "lucide-react-native";
import { useAuthStore } from "@/src/lib/store/auth.store";
import { useNotifStore } from "@/src/lib/store/notif.store";

function TabIcon({
  icon: Icon,
  focused,
  badge,
}: {
  icon: React.ElementType;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View className="items-center justify-center">
      <Icon
        size={24}
        color={focused ? "#6366f1" : "#9ca3af"}
        strokeWidth={focused ? 2.5 : 1.8}
      />
      {badge && badge > 0 ? (
        <View
          className="absolute -top-1 -right-2 bg-destructive rounded-full items-center justify-center"
          style={{ minWidth: 16, height: 16, paddingHorizontal: 3 }}
        >
          <Text className="text-white font-bold" style={{ fontSize: 9 }}>
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unreadCount = useNotifStore((s) => s.unreadCount);
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const safeBottom = Platform.select({
    ios: insets.bottom,
    android: insets.bottom > 0 ? insets.bottom : 20,
    default: 8,
  });

  const tabBarHeight = 64 + safeBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0.5,
          borderTopColor: "#e5e7eb",
          height: tabBarHeight,
          paddingBottom: safeBottom,
          paddingTop: 10,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      {/* ── 4 onglets visibles ── */}
      <Tabs.Screen
        name="feed/index"
        options={{
          title: "Feed",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explorer/index"
        options={{
          title: "Explorer",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Search} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create/index"
        options={{
          title: "Créer",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={PlusSquare} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={User} focused={focused} badge={unreadCount} />
          ),
        }}
      />

      {/* ── Routes cachées de la tab bar ── */}
      <Tabs.Screen name="feed/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="profile/events/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="profile/tickets" options={{ href: null }} />
      <Tabs.Screen name="profile/notifications" options={{ href: null }} />
      <Tabs.Screen name="profile/settings" options={{ href: null }} />
      <Tabs.Screen name="profile/events/index" options={{ href: null }} />
      {/* <Tabs.Screen name="profile/events/[id]/index" options={{ href: null }} /> */}
      <Tabs.Screen
        name="profile/events/[id]/attendees"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/events/[id]/moderators"
        options={{ href: null }}
      />
      <Tabs.Screen name="profile/events/[id]/stats" options={{ href: null }} />
      <Tabs.Screen name="profile/events/[id]/scan" options={{ href: null }} />
      <Tabs.Screen name="profile/events/[id]/edit" options={{ href: null }} />
    </Tabs>
  );
}
