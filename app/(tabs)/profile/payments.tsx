import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, Href } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  Wallet,
} from "lucide-react-native";
import { useMyPayments } from "@/src/lib/hooks/use-users";
import { UserPayment } from "@/src/lib/types/user.type";
import { formatDateTime } from "@/src/lib/utils/format";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";
import React from "react";

// ─── Configurations ───────────────────────────────────────────

const statusConfig: Record<
  UserPayment["status"],
  { label: string; bg: string; color: string; Icon: React.ElementType }
> = {
  PENDING: {
    label: "En attente",
    bg: "#fef3c7",
    color: "#d97706",
    Icon: Clock,
  },
  COMPLETED: {
    label: "Réussi",
    bg: "#dcfce7",
    color: "#16a34a",
    Icon: CheckCircle,
  },
  FAILED: { label: "Échoué", bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
  REFUNDED: {
    label: "Remboursé",
    bg: "#ede9fe",
    color: "#7c3aed",
    Icon: RotateCcw,
  },
};

const methodConfig: Record<
  UserPayment["method"],
  { label: string; bg: string; color: string; accentColor: string }
> = {
  ORANGE_MONEY: {
    label: "Orange\nMoney",
    bg: "#fff7ed",
    color: "#ea580c",
    accentColor: "#f97316",
  },
  WAVE: {
    label: "Wave",
    bg: "#eff6ff",
    color: "#2563eb",
    accentColor: "#3b82f6",
  },
  FREE_MONEY: {
    label: "Free\nMoney",
    bg: "#f0fdf4",
    color: "#16a34a",
    accentColor: "#22c55e",
  },
  CARD: {
    label: "Carte",
    bg: "#faf5ff",
    color: "#9333ea",
    accentColor: "#a855f7",
  },
};

// ─── Barre de résumé ──────────────────────────────────────────
function SummaryStrip({ payments }: { payments: UserPayment[] }) {
  const total = payments.reduce(
    (sum, p) => sum + (p.status === "COMPLETED" ? p.amount : 0),
    0,
  );
  const success = payments.filter((p) => p.status === "COMPLETED").length;
  const month = new Date().toLocaleString("fr-FR", { month: "short" });

  return (
    <View className="mx-4 mb-4 flex-row gap-2">
      {/* Total dépensé */}
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
          padding: 12,
          alignItems: "center",
          gap: 4,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: "#EEF2FF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
          }}
        >
          {/* Wallet icon — lucide */}
          <Wallet size={16} color="#6366f1" />
        </View>
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          Total dépensé
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#111827",
            textAlign: "center",
          }}
        >
          {total.toLocaleString("fr-FR")}
          {"\n"}
          <Text style={{ fontSize: 10, fontWeight: "500", color: "#9ca3af" }}>
            XOF
          </Text>
        </Text>
      </View>

      {/* Réussis */}
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
          padding: 12,
          alignItems: "center",
          gap: 4,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: "#ECFDF5",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
          }}
        >
          <CheckCircle size={16} color="#10b981" />
        </View>
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          Réussis
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#10b981",
            textAlign: "center",
          }}
        >
          {success}{" "}
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>
            / {payments.length}
          </Text>
        </Text>
      </View>

      {/* Ce mois */}
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
          padding: 12,
          alignItems: "center",
          gap: 4,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: "#FFFBEB",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
          }}
        >
          <Calendar size={16} color="#f59e0b" />
        </View>
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          Ce mois
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#111827",
            textAlign: "center",
            textTransform: "capitalize",
          }}
        >
          {month}
        </Text>
      </View>
    </View>
  );
}

// ─── Filtre pills ─────────────────────────────────────────────
type FilterKey = "ALL" | UserPayment["status"];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "COMPLETED", label: "Réussis" },
  { key: "PENDING", label: "En attente" },
  { key: "FAILED", label: "Échoués" },
  { key: "REFUNDED", label: "Remboursés" },
];

function FilterTabs({
  active,
  onChange,
}: {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 12,
      }}
    >
      {FILTERS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            activeOpacity={0.8}
            style={{
              backgroundColor: isActive ? "#111827" : "white",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: isActive ? "#111827" : "rgba(0,0,0,0.08)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isActive ? "white" : "#6b7280",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Badge statut ─────────────────────────────────────────────
function PaymentBadge({ status }: { status: UserPayment["status"] }) {
  const cfg = statusConfig[status];
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
      }}
    >
      <cfg.Icon size={9} color={cfg.color} />
      <Text style={{ fontSize: 10, fontWeight: "700", color: cfg.color }}>
        {cfg.label}
      </Text>
    </View>
  );
}

// ─── Card paiement ────────────────────────────────────────────
function PaymentCard({ payment }: { payment: UserPayment }) {
  const method = methodConfig[payment.method];
  const isFaded = payment.status === "FAILED" || payment.status === "REFUNDED";

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        marginHorizontal: 16,
        marginBottom: 10,
        opacity: isFaded ? 0.65 : 1,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Accent latéral coloré */}
        <View style={{ width: 4, backgroundColor: method.accentColor }} />

        {/* Zone méthode */}
        <View
          style={{
            width: 64,
            backgroundColor: method.bg,
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            paddingVertical: 14,
            paddingHorizontal: 4,
          }}
        >
          <CreditCard size={20} color={method.color} />
          <Text
            style={{
              fontSize: 9,
              fontWeight: "700",
              color: method.color,
              textAlign: "center",
              lineHeight: 12,
            }}
          >
            {method.label}
          </Text>
        </View>

        {/* Contenu principal */}
        <View style={{ flex: 1, padding: 12, paddingBottom: 10, minWidth: 0 }}>
          {/* Ligne titre + badge */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isFaded ? "#6b7280" : "#111827",
                lineHeight: 18,
                flex: 1,
                textDecorationLine:
                  payment.status === "FAILED" ? "line-through" : "none",
                textDecorationColor: "#d1d5db",
              }}
            >
              {payment.event.title}
            </Text>
            <PaymentBadge status={payment.status} />
          </View>

          {/* Ligne montant + date */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: isFaded ? "#9ca3af" : "#111827",
                }}
              >
                {payment.amount.toLocaleString("fr-FR")}{" "}
                <Text
                  style={{ fontSize: 11, fontWeight: "500", color: "#9ca3af" }}
                >
                  {payment.currency}
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  color: "#d1d5db",
                  marginTop: 2,
                  fontVariant: ["tabular-nums"],
                }}
              >
                Réf: {payment.reference.slice(0, 16)}…
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "500" }}>
              {formatDateTime(payment.completedAt || payment.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goBack = useSmartBack({ defaultRoute: "/(tabs)/profile" as Href });
  const { data: payments = [], isLoading } = useMyPayments();

  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("ALL");

  const filtered =
    activeFilter === "ALL"
      ? payments
      : payments.filter((p) => p.status === activeFilter);

  return (
    <View className="flex-1 bg-[#F7F6F3]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={17} color="#374151" />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              fontSize: 11,
              color: "#9ca3af",
              fontWeight: "500",
              marginBottom: 1,
            }}
          >
            Historique
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
            Mes paiements
          </Text>
        </View>

        {payments.length > 0 && (
          <View
            style={{
              marginLeft: "auto",
              backgroundColor: "#ECFDF5",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#10b981",
              }}
            />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#059669" }}>
              {payments.length} txns
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PaymentCard payment={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            payments.length > 0 ? (
              <>
                <SummaryStrip payments={payments} />
                <FilterTabs active={activeFilter} onChange={setActiveFilter} />
              </>
            ) : null
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingTop: 80,
                paddingHorizontal: 32,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 40 }}>💳</Text>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Aucun paiement
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {activeFilter !== "ALL"
                  ? "Aucune transaction dans cette catégorie."
                  : "Vos transactions effectuées sur EventFlow apparaîtront ici."}
              </Text>
              {activeFilter === "ALL" && (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/feed")}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: "#111827",
                    borderRadius: 14,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                  >
                    Explorer le feed
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
