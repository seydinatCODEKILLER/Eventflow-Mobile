import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Smartphone,
  Shield,
} from "lucide-react-native";
import { useFeedEventDetail } from "@/src/lib/hooks/use-feed";
import {
  useInitiatePayment,
  useConfirmPayment,
} from "@/src/lib/hooks/use-payments";
import { PaymentMethod } from "@/src/lib/types/payment.type";
import { formatPrice } from "@/src/lib/utils/format";

// ─── Config méthodes de paiement ──────────────────────────────
const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: "WAVE", label: "Wave", emoji: "🌊", color: "#1DA1F2" },
  {
    value: "ORANGE_MONEY",
    label: "Orange Money",
    emoji: "🟠",
    color: "#FF6600",
  },
  { value: "FREE_MONEY", label: "Free Money", emoji: "🟢", color: "#00A86B" },
  { value: "CARD", label: "Carte bancaire", emoji: "💳", color: "#6366f1" },
];

// ─── Étapes du paiement ───────────────────────────────────────
type PaymentStep = "method" | "confirm" | "processing" | "result";

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState<PaymentStep>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<
    "success" | "failed" | null
  >(null);

  const { data: event, isLoading } = useFeedEventDetail(id);
  const { mutate: initiate, isPending: isInitiating } = useInitiatePayment();
  const { mutate: confirm, isPending: isConfirming } = useConfirmPayment();

  // ── Étape 1 → 2 : Initier le paiement ────────────────────
  const handleInitiate = () => {
    if (!selectedMethod || !event) return;

    initiate(
      { eventId: id, method: selectedMethod },
      {
        onSuccess: (data) => {
          setPaymentRef(data.reference);
          setStep("confirm");
        },
      },
    );
  };

  // ── Étape 2 → 3 : Simuler le paiement ────────────────────
  const handleConfirm = (success: boolean) => {
    if (!paymentRef) return;
    setStep("processing");

    setTimeout(() => {
      confirm(
        {
          reference: paymentRef,
          status: success ? "COMPLETED" : "FAILED",
        },
        {
          onSuccess: (data) => {
            setPaymentResult(
              data.success && data.ticketId ? "success" : "failed",
            );
            setStep("result");
          },
          onError: () => {
            setPaymentResult("failed");
            setStep("result");
          },
        },
      );
    }, 1500); // Simulation délai paiement
  };

  if (isLoading || !event) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      {step !== "processing" && step !== "result" && (
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
          <TouchableOpacity
            onPress={() => {
              if (step === "confirm") {
                setStep("method");
              } else {
                router.back();
              }
            }}
            className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color="#374151" />
          </TouchableOpacity>
          <Text className="text-foreground font-bold text-lg">
            {step === "method"
              ? "Choisir le paiement"
              : "Confirmer le paiement"}
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        {/* ══ ÉTAPE 1 — Choix méthode ══ */}
        {step === "method" && (
          <View className="px-4 pt-5 gap-5">
            {/* Résumé event */}
            <View className="bg-card border border-border rounded-2xl p-4 gap-2">
              <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Événement
              </Text>
              <Text
                className="text-foreground font-bold text-base"
                numberOfLines={2}
              >
                {event.title}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-muted-foreground text-sm">
                  {event.location}
                </Text>
                <Text className="text-primary font-bold text-lg">
                  {formatPrice(event.price!, event.currency)}
                </Text>
              </View>
            </View>

            {/* Méthodes de paiement */}
            <View className="gap-3">
              <Text className="text-foreground font-semibold text-base">
                Méthode de paiement
              </Text>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.value}
                  onPress={() => setSelectedMethod(method.value)}
                  activeOpacity={0.8}
                  className="flex-row items-center gap-4 bg-card border rounded-2xl px-4 py-4"
                  style={{
                    borderColor:
                      selectedMethod === method.value
                        ? method.color
                        : "#e5e7eb",
                    borderWidth: selectedMethod === method.value ? 2 : 1,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{method.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-sm">
                      {method.label}
                    </Text>
                    <Text className="text-muted-foreground text-xs">
                      Paiement mobile sécurisé
                    </Text>
                  </View>
                  {selectedMethod === method.value && (
                    <CheckCircle2 size={20} color={method.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Info sécurité */}
            <View className="flex-row items-center gap-2 bg-muted/50 rounded-2xl p-3">
              <Shield size={14} color="#9ca3af" />
              <Text className="text-muted-foreground text-xs flex-1">
                Paiement sécurisé — vos données sont protégées
              </Text>
            </View>

            {/* Bouton continuer */}
            <TouchableOpacity
              onPress={handleInitiate}
              disabled={!selectedMethod || isInitiating}
              activeOpacity={0.85}
              className="rounded-2xl py-4 items-center"
              style={{
                backgroundColor:
                  !selectedMethod || isInitiating ? "#a5b4fc" : "#6366f1",
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {isInitiating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  Continuer →{" "}
                  {selectedMethod
                    ? formatPrice(event.price!, event.currency)
                    : ""}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ══ ÉTAPE 2 — Page de paiement simulée ══ */}
        {step === "confirm" && (
          <View className="px-4 pt-5 gap-5">
            {/* Header simulé opérateur */}
            <View
              className="rounded-3xl p-6 items-center gap-3"
              style={{
                backgroundColor:
                  selectedMethod === "WAVE"
                    ? "#1DA1F2"
                    : selectedMethod === "ORANGE_MONEY"
                      ? "#FF6600"
                      : selectedMethod === "FREE_MONEY"
                        ? "#00A86B"
                        : "#6366f1",
              }}
            >
              <Text style={{ fontSize: 40 }}>
                {PAYMENT_METHODS.find((m) => m.value === selectedMethod)?.emoji}
              </Text>
              <Text className="text-white font-bold text-xl">
                {PAYMENT_METHODS.find((m) => m.value === selectedMethod)?.label}
              </Text>
              <Text className="text-white/80 text-sm">Paiement sécurisé</Text>
            </View>

            {/* Détails transaction */}
            <View className="bg-card border border-border rounded-2xl p-4 gap-3">
              <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Détails de la transaction
              </Text>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-sm">Événement</Text>
                <Text
                  className="text-foreground font-semibold text-sm flex-1 text-right ml-4"
                  numberOfLines={1}
                >
                  {event.title}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-sm">Référence</Text>
                <Text className="text-foreground font-mono text-xs">
                  {paymentRef?.slice(0, 16)}...
                </Text>
              </View>

              <View className="h-px bg-border" />

              <View className="flex-row justify-between">
                <Text className="text-foreground font-bold text-base">
                  Total
                </Text>
                <Text className="text-primary font-bold text-lg">
                  {formatPrice(event.price!, event.currency)}
                </Text>
              </View>
            </View>

            {/* Simulation — 2 boutons (démo) */}
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 gap-2">
              <View className="flex-row items-center gap-2">
                <Smartphone size={14} color="#d97706" />
                <Text className="text-amber-700 font-semibold text-xs">
                  Mode démo — simuler le résultat
                </Text>
              </View>
              <Text className="text-amber-600 text-xs">
                En production, opérateur gère la confirmation automatiquement.
              </Text>
            </View>

            <View className="gap-3">
              {/* Simuler succès */}
              <TouchableOpacity
                onPress={() => handleConfirm(true)}
                activeOpacity={0.85}
                className="rounded-2xl py-4 items-center"
                style={{
                  backgroundColor: "#22c55e",
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-white font-bold text-sm">
                  ✓ Simuler paiement réussi
                </Text>
              </TouchableOpacity>

              {/* Simuler échec */}
              <TouchableOpacity
                onPress={() => handleConfirm(false)}
                activeOpacity={0.8}
                className="rounded-2xl py-4 items-center bg-red-50 border border-red-200"
              >
                <Text className="text-red-500 font-bold text-sm">
                  ✗ Simuler paiement échoué
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══ ÉTAPE 3 — Processing ══ */}
        {step === "processing" && (
          <View className="flex-1 items-center justify-center px-8 gap-6">
            <ActivityIndicator size="large" color="#6366f1" />
            <View className="items-center gap-2">
              <Text className="text-foreground font-bold text-xl text-center">
                Traitement en cours...
              </Text>
              <Text className="text-muted-foreground text-sm text-center">
                Veuillez patienter, ne fermez pas application.
              </Text>
            </View>
          </View>
        )}

        {/* ══ ÉTAPE 4 — Résultat ══ */}
        {step === "result" && (
          <View className="flex-1 items-center justify-center px-8 gap-6">
            {paymentResult === "success" ? (
              <>
                <View className="w-24 h-24 rounded-full bg-green-500/10 items-center justify-center">
                  <CheckCircle2 size={56} color="#22c55e" />
                </View>
                <View className="items-center gap-2">
                  <Text className="text-foreground font-bold text-2xl text-center">
                    Paiement réussi ! 🎉
                  </Text>
                  <Text className="text-muted-foreground text-sm text-center leading-6">
                    Votre ticket a été créé et vous sera envoyé par email. Vous
                    pouvez le retrouver dans Mes tickets.
                  </Text>
                </View>

                <View className="w-full gap-3">
                  <TouchableOpacity
                    onPress={() => router.replace("/(tabs)/profile/tickets")}
                    activeOpacity={0.85}
                    className="rounded-2xl py-4 items-center"
                    style={{ backgroundColor: "#6366f1" }}
                  >
                    <Text className="text-white font-bold text-sm">
                      Voir mes tickets
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.replace("/(tabs)/feed")}
                    activeOpacity={0.7}
                    className="rounded-2xl py-4 items-center bg-card border border-border"
                  >
                    <Text className="text-foreground font-semibold text-sm">
                      Retour au feed
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View className="w-24 h-24 rounded-full bg-red-500/10 items-center justify-center">
                  <XCircle size={56} color="#ef4444" />
                </View>
                <View className="items-center gap-2">
                  <Text className="text-foreground font-bold text-2xl text-center">
                    Paiement échoué
                  </Text>
                  <Text className="text-muted-foreground text-sm text-center leading-6">
                    Votre paiement a pas pu être traité. Aucun montant a été
                    débité.
                  </Text>
                </View>

                <View className="w-full gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setStep("method");
                      setPaymentRef(null);
                      setPaymentResult(null);
                    }}
                    activeOpacity={0.85}
                    className="rounded-2xl py-4 items-center"
                    style={{ backgroundColor: "#6366f1" }}
                  >
                    <Text className="text-white font-bold text-sm">
                      Réessayer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    className="rounded-2xl py-4 items-center bg-card border border-border"
                  >
                    <Text className="text-foreground font-semibold text-sm">
                      Annuler
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
