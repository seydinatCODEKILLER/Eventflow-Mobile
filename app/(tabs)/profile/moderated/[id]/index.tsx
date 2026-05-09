import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Href } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  QrCode,
  Banknote,
} from "lucide-react-native";
import { useEvent } from "@/src/lib/hooks/use-events";
import { formatDateTime, formatPrice } from "@/src/lib/utils/format";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

// ─── Ligne info ────────────────────────────────────────────────────────────────
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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#efefef",
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: "#f5f5f7",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={15} color="#6366f1" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: "500", color: "#111" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────────────────────
export default function ModeratedEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goBack = useSmartBack({
    defaultRoute: "/(tabs)/profile/moderated" as Href,
  });

  const { data: event, isLoading } = useEvent(id);

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fafafa",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );

  if (!event)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fafafa",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
          Événement introuvable
        </Text>
        <TouchableOpacity onPress={goBack}>
          <Text style={{ color: "#6366f1", fontWeight: "600" }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );

  const canScan = event.status === "PUBLISHED" || event.status === "ONGOING";
  const organizer = (event as any).organizer;

  return (
    <View
      style={{ flex: 1, backgroundColor: "#fafafa", paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
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
        <Text
          style={{ fontSize: 17, fontWeight: "600", color: "#111" }}
          numberOfLines={1}
        >
          Détail modération
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
      >
        {/* Hero */}
        <View
          style={{
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#efefef",
            marginBottom: 20,
          }}
        >
          {/* Badge modérateur */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-start",
              backgroundColor: "#eff6ff",
              borderWidth: 1,
              borderColor: "#bfdbfe",
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#3b82f6",
              }}
            />
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#2563eb" }}>
              Vous êtes modérateur
            </Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#111",
              lineHeight: 28,
            }}
          >
            {event.title}
          </Text>
        </View>

        {/* Infos */}
        <View style={{ marginBottom: 20 }}>
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
            label="Capacité"
            value={`${event.capacity} places`}
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

        {/* Organisateur */}
        {organizer && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 14,
              borderTopWidth: 1,
              borderTopColor: "#efefef",
              borderBottomWidth: 1,
              borderBottomColor: "#efefef",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#eef2ff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#6366f1" }}
              >
                {organizer.fullName?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>
                Organisateur
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#111" }}>
                {organizer.fullName}
              </Text>
              {organizer.email && (
                <Text style={{ fontSize: 11, color: "#999" }}>
                  {organizer.email}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#111",
                marginBottom: 8,
              }}
            >
              À propos
            </Text>
            <Text style={{ fontSize: 13, color: "#999", lineHeight: 22 }}>
              {event.description}
            </Text>
          </View>
        )}

        {/* Notice scan */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
            borderRadius: 12,
            padding: 13,
            backgroundColor: canScan ? "#f0fdf4" : "#f5f5f7",
            borderWidth: 1,
            borderColor: canScan ? "#bbf7d0" : "#efefef",
          }}
        >
          <QrCode
            size={16}
            color={canScan ? "#16a34a" : "#999"}
            style={{ marginTop: 1 }}
          />
          <Text
            style={{
              fontSize: 12,
              lineHeight: 20,
              flex: 1,
              color: canScan ? "#166534" : "#999",
            }}
          >
            {canScan
              ? "L'événement est actif. Vous pouvez scanner les tickets des participants à l'entrée."
              : "Le scanner sera disponible lorsque l'événement sera publié ou en cours."}
          </Text>
        </View>
      </ScrollView>

      {/* CTA fixe */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(250,250,250,0.97)",
          borderTopWidth: 1,
          borderTopColor: "#efefef",
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push(`/(tabs)/profile/moderated/${id}/scan` as Href)
          }
          disabled={!canScan}
          activeOpacity={0.85}
          style={{
            borderRadius: 14,
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: canScan ? "#6366f1" : "#f0f0f0",
          }}
        >
          <QrCode size={17} color={canScan ? "white" : "#999"} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: canScan ? "white" : "#999",
            }}
          >
            {canScan ? "Scanner les tickets" : "Scanner indisponible"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
