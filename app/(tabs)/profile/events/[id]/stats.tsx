import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import { useEventStats, useEvent } from "@/src/lib/hooks/use-events";
import Svg, { Circle } from "react-native-svg";

// ─── Ring de présence ─────────────────────────────────────────────────────────
function AttendanceRing({ rate }: { rate: number }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#f0f0f0"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#6366f1"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#111",
            lineHeight: 22,
          }}
        >
          {rate}%
        </Text>
        <Text style={{ fontSize: 10, color: "#999", marginTop: 1 }}>
          présence
        </Text>
      </View>
    </View>
  );
}

// ─── Carte stat ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#efefef",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color,
          lineHeight: 30,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: "#999" }}>{label}</Text>
    </View>
  );
}

// ─── Barre stat ───────────────────────────────────────────────────────────────
function StatBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "500", color: "#111" }}>
          {label}
        </Text>
        <Text style={{ fontSize: 12, color: "#999" }}>
          {value} · {pct}%
        </Text>
      </View>
      <View
        style={{
          height: 4,
          backgroundColor: "#f0f0f0",
          borderRadius: 100,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: 100,
          }}
        />
      </View>
    </View>
  );
}

// ─── Titre de section ──────────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: "#999",
        marginBottom: 12,
      }}
    >
      {label}
    </Text>
  );
}

// ─── Écran principal ───────────────────────────────────────────────────────────
export default function StatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: event } = useEvent(id);
  const { data: stats, isLoading, refetch, isRefetching } = useEventStats(id);

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
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
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

        <Text style={{ fontSize: 17, fontWeight: "600", color: "#111" }}>
          Statistiques
        </Text>

        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isRefetching}
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
          {isRefetching ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <RefreshCw size={15} color="#999" />
          )}
        </TouchableOpacity>
      </View>

      {!stats ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#999", fontSize: 14 }}>
            Aucune statistique disponible
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {/* Event info */}
          {event && (
            <View
              style={{
                paddingHorizontal: 20,
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#efefef",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#111",
                  marginBottom: 3,
                }}
                numberOfLines={2}
              >
                {event.title}
              </Text>
              <Text style={{ fontSize: 12, color: "#999" }}>
                Capacité totale · {stats.capacity} places
              </Text>
            </View>
          )}

          {/* Attendance ring */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 24,
              padding: 24,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#efefef",
            }}
          >
            <AttendanceRing rate={stats.attendanceRate} />
            <View style={{ flex: 1, gap: 10 }}>
              {[
                { key: "Présents", val: stats.tickets.USED },
                { key: "Inscrits", val: stats.tickets.total },
                { key: "Places restantes", val: stats.remainingSeats },
              ].map((r, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#999" }}>{r.key}</Text>
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#111" }}
                  >
                    {r.val}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tickets */}
          <View style={{ padding: 20, paddingBottom: 0 }}>
            <SectionTitle label="Tickets" />
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <StatCard
                label="Total"
                value={stats.tickets.total}
                color="#6366f1"
              />
              <StatCard
                label="Actifs"
                value={stats.tickets.ACTIVE}
                color="#3b82f6"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
              <StatCard
                label="Utilisés"
                value={stats.tickets.USED}
                color="#22c55e"
              />
              <StatCard
                label="Annulés"
                value={stats.tickets.CANCELLED}
                color="#ef4444"
              />
            </View>
          </View>

          {/* Remplissage */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 0 }}>
            <SectionTitle label="Remplissage" />
            <View
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#efefef",
                borderRadius: 14,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <StatBar
                label="Inscrits"
                value={stats.tickets.total}
                total={stats.capacity}
                color="#6366f1"
              />
              <StatBar
                label="Présents"
                value={stats.tickets.USED}
                total={stats.capacity}
                color="#22c55e"
              />
              <StatBar
                label="Annulés"
                value={stats.tickets.CANCELLED}
                total={stats.capacity}
                color="#ef4444"
              />
            </View>
          </View>

          {/* Scans */}
          <View style={{ paddingHorizontal: 20 }}>
            <SectionTitle label="Scans" />
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <StatCard
                label="Total"
                value={stats.scans.total}
                color="#6366f1"
              />
              <StatCard
                label="Valides"
                value={stats.scans.VALID}
                color="#22c55e"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <StatCard
                label="Déjà utilisés"
                value={stats.scans.ALREADY_USED}
                color="#f97316"
              />
              <StatCard
                label="Invalides"
                value={stats.scans.INVALID}
                color="#ef4444"
              />
            </View>

            {/* Online vs Offline */}
            <View
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#efefef",
                borderRadius: 14,
                padding: 16,
                flexDirection: "row",
                gap: 12,
              }}
            >
              {[
                {
                  val: stats.scans.byMode.ONLINE,
                  lbl: "En ligne",
                  color: "#6366f1",
                },
                {
                  val: stats.scans.byMode.OFFLINE,
                  lbl: "Hors ligne",
                  color: "#d1d5db",
                },
              ].map((m, i) => (
                <View key={i} style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 22, fontWeight: "700", color: "#111" }}
                  >
                    {m.val}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                    {m.lbl}
                  </Text>
                  <View
                    style={{
                      height: 3,
                      borderRadius: 100,
                      backgroundColor: m.color,
                      marginTop: 10,
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
