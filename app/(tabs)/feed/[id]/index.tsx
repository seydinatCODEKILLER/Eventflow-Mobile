import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Clock,
  Banknote,
  Ticket,
  CheckCircle2,
  Ban,
} from "lucide-react-native";
import {
  useFeedEventDetail,
  useRegisterToEvent,
} from "@/src/lib/hooks/use-feed";
import { formatDateTime, formatPrice } from "@/src/lib/utils/format";
import { useAuthStore } from "@/src/lib/store/auth.store";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

export default function FeedEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useSmartBack({
    defaultRoute: "/(tabs)/feed" as Href,
    routeMap: {
      explorer: "/(tabs)/explorer" as Href,
      notification: "/(tabs)/profile/notifications" as Href,
    },
  });
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: event, isLoading } = useFeedEventDetail(id);
  const { mutate: register, isPending } = useRegisterToEvent(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-4">
        <Text className="text-foreground font-bold text-lg">
          Événement introuvable
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = user?.id === event.organizer.id;

  const fillRate =
    event.capacity > 0
      ? Math.round(
          ((event.capacity - event.remainingSeats) / event.capacity) * 100,
        )
      : 0;

  const handleRegister = () => {
    if (event.isFree) {
      register(undefined);
    } else {
      router.push(`/(tabs)/feed/${id}/payment`);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image hero */}
        <ImageBackground
          source={
            event.imageUrl
              ? { uri: event.imageUrl }
              : require("@/assets/images/event-placeholder.png")
          }
          style={{ height: 280 }}
        >
          <View className="absolute inset-0 bg-black/30" />

          <TouchableOpacity
            onPress={goBack}
            className="absolute top-0 left-4 w-10 h-10 bg-black/40 rounded-full items-center justify-center"
            style={{ top: insets.top + 8 }}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          <View
            className="absolute bottom-4 right-4 rounded-2xl px-4 py-2"
            style={{ backgroundColor: event.isFree ? "#22c55e" : "#6366f1" }}
          >
            <Text className="text-white font-bold text-sm">
              {event.isFree
                ? "Gratuit"
                : formatPrice(event.price!, event.currency)}
            </Text>
          </View>
        </ImageBackground>

        {/* Contenu */}
        {/* ✅ MODIFICATION : Padding dynamique en bas selon si le CTA est visible ou non */}
        <View
          className="px-4 pt-5 gap-5"
          style={{ paddingBottom: isOwner ? 40 : 180 }}
        >
          {/* Titre + statut */}
          <View className="gap-2">
            <Text className="text-foreground font-bold text-2xl leading-tight">
              {event.title}
            </Text>
            {event.status === "ONGOING" && (
              <View className="flex-row items-center gap-1.5 self-start bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <Text className="text-red-500 text-xs font-semibold">
                  En cours
                </Text>
              </View>
            )}
          </View>

          {/* Infos */}
          <View className="bg-card border border-border rounded-2xl p-4 gap-3">
            <InfoRow
              icon={Calendar}
              label="Début"
              value={formatDateTime(event.startDate)}
            />
            {event.endDate && (
              <InfoRow
                icon={Clock}
                label="Fin"
                value={formatDateTime(event.endDate)}
              />
            )}
            <InfoRow
              icon={MapPin}
              label="Lieu"
              value={`${event.location}${event.city ? ` · ${event.city}` : ""}`}
            />
            <InfoRow
              icon={Users}
              label="Places"
              value={
                event.remainingSeats > 0
                  ? `${event.remainingSeats} disponibles / ${event.capacity}`
                  : "Complet"
              }
            />
            <InfoRow
              icon={Banknote}
              label="Tarif"
              value={
                event.isFree
                  ? "Gratuit"
                  : formatPrice(event.price!, event.currency)
              }
            />
          </View>

          {/* Jauge */}
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground text-sm">Remplissage</Text>
              <Text
                className="text-sm font-semibold"
                style={{
                  color:
                    fillRate >= 90
                      ? "#ef4444"
                      : fillRate >= 70
                        ? "#f97316"
                        : "#22c55e",
                }}
              >
                {fillRate}%
              </Text>
            </View>
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${fillRate}%`,
                  backgroundColor:
                    fillRate >= 90
                      ? "#ef4444"
                      : fillRate >= 70
                        ? "#f97316"
                        : "#6366f1",
                }}
              />
            </View>
            {fillRate >= 80 && event.remainingSeats > 0 && (
              <Text className="text-orange-500 text-xs font-medium">
                ⚠️ Plus que {event.remainingSeats} place(s) !
              </Text>
            )}
          </View>

          {/* Organisateur */}
          <View className="flex-row items-center gap-3 bg-card border border-border rounded-2xl p-4">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-primary font-bold text-sm">
                {event.organizer.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-muted-foreground text-xs">
                Organisateur
              </Text>
              <Text className="text-foreground font-semibold text-sm">
                {event.organizer.fullName}
              </Text>
            </View>
            {/* ✅ AJOUT : Petit badge "Vous" si c'est ton event */}
            {isOwner && (
              <View className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                <Text className="text-primary text-[10px] font-bold">VOUS</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {event.description && (
            <View className="gap-2">
              <Text className="text-foreground font-bold text-base">
                À propos
              </Text>
              <Text className="text-muted-foreground text-sm leading-6">
                {event.description}
              </Text>
            </View>
          )}

          {/* Ce que vous recevrez */}
          <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4 gap-2">
            <Text className="text-foreground font-semibold text-sm mb-1">
              Après inscription vous recevrez :
            </Text>
            {[
              "Un ticket numérique avec QR code unique",
              "Confirmation par email",
              "Notifications de rappel",
            ].map((item) => (
              <View key={item} className="flex-row items-center gap-2">
                <Text className="text-green-500 text-xs">✓</Text>
                <Text className="text-muted-foreground text-sm">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ─── CTA Fixe Premium (Glassmorphism) ─── */}
      {/* ✅ MODIFICATION : On n'affiche le CTA QUE SI l'utilisateur n'est pas le propriétaire */}
      {!isOwner && (
        <View className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <View className="h-px bg-black/5" />

          <BlurView
            intensity={100}
            tint="light"
            className="px-5"
            style={{ paddingTop: 16, paddingBottom: insets.bottom + 16 }}
          >
            {event.isRegistered ? (
              <View className="flex-row items-center justify-center gap-2.5 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl py-4">
                <CheckCircle2 size={20} color="#10b981" strokeWidth={2.5} />
                <Text className="text-emerald-700 font-bold text-sm tracking-wide">
                  Vous êtes inscrit !
                </Text>
              </View>
            ) : event.remainingSeats <= 0 ? (
              <View className="flex-row items-center justify-center gap-2.5 bg-neutral-100/80 border border-neutral-200/60 rounded-2xl py-4">
                <Ban size={20} color="#a3a3a3" strokeWidth={2} />
                <Text className="text-neutral-400 font-bold text-sm tracking-wide">
                  Événement complet
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isPending}
                activeOpacity={0.8}
                className="rounded-2xl py-4 flex-row items-center justify-center gap-2 overflow-hidden"
                style={{
                  backgroundColor: isPending ? "#c7d2fe" : "#6366f1",
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.25,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ticket size={18} color="white" strokeWidth={2.5} />
                    <Text className="text-white font-extrabold text-base tracking-wide">
                      {event.isFree
                        ? "S'inscrire gratuitement"
                        : `Payer ${formatPrice(event.price!, event.currency)}`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </BlurView>
        </View>
      )}
    </View>
  );
}

// ── Composant ligne info ──────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
        <Icon size={15} color="#6366f1" />
      </View>
      <View className="flex-1">
        <Text className="text-muted-foreground text-xs">{label}</Text>
        <Text className="text-foreground text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}
