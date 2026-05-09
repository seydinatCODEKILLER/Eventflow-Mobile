import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Calendar, Users, Eye, Ban, Clock } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { FeedEvent } from "@/src/lib/types/feed.type";
import { formatRelativeTime, formatPrice } from "@/src/lib/utils/format";
import Animated, { FadeInDown } from "react-native-reanimated";

interface EventCardProps {
  event: FeedEvent;
  index?: number;
  from?: string;
}

const CATEGORY_LABELS: Record<
  string,
  { emoji: string; label: string; gradient: readonly [string, string] }
> = {
  CONCERT: { emoji: "🎵", label: "Concert", gradient: ["#FF6B6B", "#EE5A24"] },
  CONFERENCE: {
    emoji: "🎤",
    label: "Conférence",
    gradient: ["#A8E6CF", "#3D84A8"],
  },
  SPORT: { emoji: "⚽", label: "Sport", gradient: ["#FFD93D", "#FF8C00"] },
  FETE: { emoji: "🎉", label: "Fête", gradient: ["#FF6B9D", "#C44569"] },
  ART: { emoji: "🎨", label: "Art", gradient: ["#A78BFA", "#7C3AED"] },
  GASTRONOMIE: {
    emoji: "🍽️",
    label: "Gastronomie",
    gradient: ["#F97316", "#DC2626"],
  },
  AUTRE: { emoji: "📅", label: "Autre", gradient: ["#6EE7B7", "#3B82F6"] },
};

export function EventCard({ event, index = 0, from }: EventCardProps) {
  const router = useRouter();

  const stats = useMemo(() => {
    const inscrits = event.attendeesCount ?? 0;
    const capacity = event.capacity ?? inscrits + (event.remainingSeats ?? 0);
    const fillRate = capacity > 0 ? Math.round((inscrits / capacity) * 100) : 0;
    const urgencyLevel =
      fillRate >= 90 ? "critical" : fillRate >= 70 ? "warning" : "normal";

    return {
      inscrits,
      capacity,
      fillRate,
      urgencyLevel,
      isFull: event.remainingSeats <= 0,
      remainingSeats: event.remainingSeats ?? 0,
    };
  }, [event]);

  const categoryConfig =
    CATEGORY_LABELS[event.category] || CATEGORY_LABELS.AUTRE;

  const handleCardPress = useCallback(() => {
    const url = from
      ? `/(tabs)/feed/${event.id}?from=${from}`
      : `/(tabs)/feed/${event.id}`;

    router.push(url as Href);
  }, [event.id, router, from]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="mx-4 mb-6"
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleCardPress}
        className="rounded-xl overflow-hidden"
        style={styles.cardShadow}
      >
        <ImageBackground
          source={
            event.imageUrl
              ? { uri: event.imageUrl }
              : require("@/assets/images/event-placeholder.png")
          }
          className="h-[340px] w-full"
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)"]}
            locations={[0, 0.6]}
            style={StyleSheet.absoluteFill}
          />

          {/* Badges en haut */}
          <View className="flex-row justify-between items-start p-4">
            <LinearGradient
              colors={categoryConfig.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full px-4 py-2"
            >
              <Text className="text-white text-xs font-bold">
                {categoryConfig.emoji} {categoryConfig.label}
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={
                event.isFree ? ["#10B981", "#059669"] : ["#6366F1", "#4F46E5"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full px-4 py-2"
            >
              <Text className="text-white text-xs font-bold">
                {event.isFree
                  ? "✨ Gratuit"
                  : formatPrice(event.price!, event.currency)}
              </Text>
            </LinearGradient>
          </View>

          {/* Badge "En cours" */}
          {event.status === "ONGOING" && (
            <View className="absolute top-16 left-1/2 -translate-x-1/2 flex-row items-center gap-2 bg-red-500/90 backdrop-blur-sm rounded-full px-4 py-2">
              <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <Text className="text-white text-xs font-bold">EN COURS</Text>
            </View>
          )}

          {/* --------------------------------------------------------- */}
          {/* SECTION BASSE : GLASSMORPHISM HORIZONTALE */}
          {/* --------------------------------------------------------- */}
          <View
            className="absolute bottom-0 left-0 right-0 p-5 pt-8 rounded-t-3xl"
            style={styles.glassContainer}
          >
            <Text
              className="text-white font-bold text-xl leading-tight"
              numberOfLines={2}
            >
              {event.title}
            </Text>

            <View className="flex-row items-center gap-4 mt-2 mb-4">
              <View className="flex-row items-center gap-1.5">
                <Calendar size={13} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/70 text-xs font-medium">
                  {formatRelativeTime(event.startDate)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 flex-1">
                <MapPin size={13} color="rgba(255,255,255,0.7)" />
                <Text
                  className="text-white/70 text-xs font-medium"
                  numberOfLines={1}
                >
                  {event.city ?? event.location}
                </Text>
              </View>
            </View>

            {/* Alerte urgence */}
            {!stats.isFull &&
              stats.remainingSeats <= 10 &&
              stats.remainingSeats > 0 && (
                <View className="flex-row items-center gap-1.5 mb-3 bg-orange-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 self-start border border-orange-500/30">
                  <Clock size={12} color="#FB923C" />
                  <Text className="text-orange-300 text-[11px] font-bold uppercase tracking-wider">
                    Plus que {stats.remainingSeats} places !
                  </Text>
                </View>
              )}

            {/* LAYOUT HORIZONTAL */}
            <View className="flex-row items-center gap-4">
              {/* GAUCHE : Statistiques & Jauge */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center gap-1.5">
                    <Users size={12} color="rgba(255,255,255,0.6)" />
                    <Text className="text-white/60 text-[11px] font-medium">
                      {stats.inscrits} participants
                    </Text>
                  </View>
                  <Text
                    className="text-[11px] font-bold"
                    style={{
                      color:
                        stats.urgencyLevel === "critical"
                          ? "#FCA5A5"
                          : stats.urgencyLevel === "warning"
                            ? "#FDBA74"
                            : "#FFFFFF",
                    }}
                  >
                    {stats.fillRate}%
                  </Text>
                </View>

                <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(stats.fillRate, 5)}%`,
                      backgroundColor:
                        stats.urgencyLevel === "critical"
                          ? "#F43F5E"
                          : stats.urgencyLevel === "warning"
                            ? "#FB923C"
                            : "rgba(255,255,255,0.9)",
                    }}
                  />
                </View>
              </View>

              {/* DROITE : Bouton d'action unique */}
              {stats.isFull ? (
                <View className="bg-white/10 px-5 py-3 rounded-2xl flex-row items-center gap-1.5 border border-white/5">
                  <Ban size={14} color="rgba(255,255,255,0.3)" />
                  <Text className="text-white/30 font-bold text-xs">
                    Complet
                  </Text>
                </View>
              ) : (
                // ✅ Simple View qui réagit au clic du parent (TouchableOpacity)
                <View
                  className="px-5 py-3 rounded-2xl flex-row items-center gap-2 justify-center"
                  style={styles.actionButtonShadow}
                >
                  <LinearGradient
                    colors={["#6366F1", "#4F46E5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0 rounded-2xl"
                  />
                  <Eye size={16} color="white" />
                  <Text className="text-white font-bold text-xs">
                    Voir événement
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glassContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    backdropFilter: "blur(24px)",
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    borderTopWidth: 1,
  },
  actionButtonShadow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
