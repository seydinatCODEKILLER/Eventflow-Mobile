import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Calendar, Users, Ticket, Eye, Ban } from "lucide-react-native";
import { useCallback } from "react";
import { FeedEvent } from "@/src/lib/types/feed.type";
import { formatRelativeTime, formatPrice } from "@/src/lib/utils/format";
import { useRegisterToEvent } from "@/src/lib/hooks/use-feed";

interface EventCardProps {
  event: FeedEvent;
}

const CATEGORY_LABELS: Record<string, string> = {
  CONCERT: "🎵 Concert",
  CONFERENCE: "🎤 Conférence",
  SPORT: "⚽ Sport",
  FETE: "🎉 Fête",
  ART: "🎨 Art",
  GASTRONOMIE: "🍽️ Gastronomie",
  AUTRE: "📅 Autre",
};

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const { mutate: register, isPending } = useRegisterToEvent(event.id);

  const fillRate =
    event.capacity > 0
      ? Math.round(
          ((event.capacity - event.remainingSeats) / event.capacity) * 100,
        )
      : 0;

  const fillColor =
    fillRate >= 90 ? "#ef4444" : fillRate >= 70 ? "#f97316" : "#6366f1";

  const handleRegister = useCallback(() => {
    if (event.isFree) return register(undefined);
    router.push(`/(tabs)/feed/${event.id}`);
  }, [event.id, event.isFree, register, router]);

  const handleCardPress = useCallback(() => {
    router.push(`/(tabs)/feed/${event.id}`);
  }, [event.id, router]);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handleCardPress}
      className="mx-4 mb-4 rounded-3xl overflow-hidden bg-card border border-border"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Image */}
      <ImageBackground
        source={
          event.imageUrl
            ? { uri: event.imageUrl }
            : require("@/assets/images/event-placeholder.png")
        }
        className="h-52 w-full"
        imageStyle={{ borderRadius: 0 }}
      >
        {/* Overlay dégradé */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          locations={[0.4, 1]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Badges top */}
        <View className="flex-row items-start justify-between p-4">
          {/* Catégorie */}
          <View className="bg-black/40 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-medium">
              {CATEGORY_LABELS[event.category]}
            </Text>
          </View>

          {/* Gratuit / Prix */}
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: event.isFree ? "#22c55e" : "#6366f1" }}
          >
            <Text className="text-white text-xs font-bold">
              {event.isFree
                ? "Gratuit"
                : formatPrice(event.price!, event.currency)}
            </Text>
          </View>
        </View>

        {/* Status ONGOING */}
        {event.status === "ONGOING" && (
          <View className="absolute top-4 left-1/2 -translate-x-1/2 flex-row items-center gap-1 bg-red-500 rounded-full px-3 py-1">
            <View className="w-1.5 h-1.5 rounded-full bg-white" />
            <Text className="text-white text-xs font-bold">En cours</Text>
          </View>
        )}
      </ImageBackground>

      {/* Contenu */}
      <View className="p-4 gap-3">
        {/* Titre */}
        <Text
          className="text-foreground font-bold text-lg leading-tight"
          numberOfLines={2}
        >
          {event.title}
        </Text>

        {/* Infos */}
        <View className="gap-1.5">
          <View className="flex-row items-center gap-2">
            <Calendar size={13} color="#9ca3af" />
            <Text className="text-muted-foreground text-xs">
              {formatRelativeTime(event.startDate)}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <MapPin size={13} color="#9ca3af" />
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {event.city ?? event.location}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Users size={13} color="#9ca3af" />
            <Text className="text-muted-foreground text-xs">
              {event.remainingSeats > 0
                ? `${event.remainingSeats} places restantes`
                : "Complet"}
            </Text>
          </View>
        </View>

        {/* Jauge remplissage */}
        <View className="gap-1">
          <View className="h-1.5 bg-muted rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${fillRate}%`, backgroundColor: fillColor }}
            />
          </View>
          <Text className="text-muted-foreground text-xs">
            {fillRate}% rempli
          </Text>
        </View>

        {/* Bouton */}
        {event.remainingSeats <= 0 ? (
          <View className="bg-muted rounded-2xl py-3 items-center flex-row justify-center gap-2">
            <Ban size={18} color="#666" /> {/* Icône "interdit" */}
            <Text className="text-muted-foreground font-semibold text-sm">
              Complet
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleRegister();
            }}
            disabled={isPending}
            activeOpacity={0.85}
            className="rounded-xl py-3 items-center flex-row justify-center gap-2"
            style={{
              backgroundColor: isPending ? "#a5b4fc" : "#6366f1",
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {event.isFree ? (
              <Ticket size={18} color="#FFFFFF" />
            ) : (
              <Eye size={18} color="#FFFFFF" />
            )}
            <Text className="text-white font-bold text-sm">
              {event.isFree ? "S'inscrire" : "Decouvrir"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
