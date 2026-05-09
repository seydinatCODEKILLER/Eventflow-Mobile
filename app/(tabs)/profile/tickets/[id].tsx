import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, Share2, Calendar, QrCode } from "lucide-react-native";
import { useMyTickets } from "@/src/lib/hooks/use-users";
import { formatDateTime } from "@/src/lib/utils/format";
import { useEffect } from "react";
import { useSmartBack } from "@/src/lib/hooks/use-smart-back";

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const goBack = useSmartBack({
    defaultRoute: "/(tabs)/profile/tickets" as Href,
  });

  const { data: tickets, isLoading, refetch } = useMyTickets();
  const ticket = tickets?.find((t) => t.id === id);

  useEffect(() => {
    if (ticket && ticket.status === "ACTIVE" && !ticket.qrUrl) {
      const timer = setTimeout(() => {
        refetch();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [ticket?.qrUrl, ticket?.status, refetch]);

  const handleShare = async () => {
    if (!ticket) return;
    await Share.share({
      message: `Mon ticket pour ${ticket.event.title} — EventFlow`,
      title: ticket.event.title,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-4">
        <Text className="text-foreground font-bold text-lg">
          Ticket introuvable
        </Text>
        <TouchableOpacity onPress={goBack}>
          <Text className="text-primary font-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = {
    ACTIVE: { label: "Valide", color: "#22c55e", bg: "#dcfce7" },
    USED: { label: "Utilisé", color: "#6b7280", bg: "#f3f4f6" },
    CANCELLED: { label: "Annulé", color: "#ef4444", bg: "#fee2e2" },
  }[ticket.status];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={goBack}
          className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-foreground font-bold text-lg">Mon ticket</Text>
        <TouchableOpacity
          onPress={handleShare}
          className="w-9 h-9 bg-card border border-border rounded-xl items-center justify-center"
          activeOpacity={0.7}
        >
          <Share2 size={16} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-5 gap-4">
          {/* Card ticket */}
          <View
            className="bg-card border border-border rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View
              className="h-2"
              style={{ backgroundColor: statusConfig.color }}
            />

            <View className="p-5 gap-4">
              <View className="flex-row items-start justify-between gap-2">
                <Text
                  className="text-foreground font-bold text-xl flex-1 leading-tight"
                  numberOfLines={3}
                >
                  {ticket.event.title}
                </Text>
                <View
                  className="px-3 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: statusConfig.bg }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Calendar size={14} color="#9ca3af" />
                  <Text className="text-muted-foreground text-sm">
                    {formatDateTime(ticket.event.startDate)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="w-5 h-5 rounded-full bg-background border border-border" />
                <View className="flex-1 border-t border-dashed border-border" />
                <View className="w-5 h-5 rounded-full bg-background border border-border" />
              </View>

              {/* QR Code */}
              <View className="items-center gap-3">
                {ticket.status === "ACTIVE" ? (
                  <>
                    <View className="bg-white p-4 rounded-2xl border border-border">
                      {ticket.qrUrl ? (
                        <Image
                          source={{ uri: ticket.qrUrl }}
                          style={{ width: 200, height: 200 }}
                          contentFit="contain"
                        />
                      ) : (
                        /* ✅ MODIFICATION : Loader intelligent au lieu du texte statique */
                        <View className="w-48 h-48 items-center justify-center gap-3">
                          <ActivityIndicator size="large" color="#6366f1" />
                          <Text className="text-muted-foreground text-xs text-center font-medium">
                            Génération du QR code...
                          </Text>
                          <Text className="text-muted-foreground text-[10px] text-center px-4">
                            Le code apparaîtra automatiquement
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-muted-foreground text-xs font-mono">
                      {ticket.id.slice(0, 8).toUpperCase()}
                    </Text>

                    <Text className="text-muted-foreground text-xs text-center px-4">
                      Présentez ce QR code à entrée de événement
                    </Text>
                  </>
                ) : (
                  <View className="items-center gap-2 py-6">
                    <QrCode size={48} color="#9ca3af" />
                    <Text className="text-muted-foreground text-sm text-center">
                      {ticket.status === "USED"
                        ? "Ce ticket a déjà été utilisé"
                        : "Ce ticket a été annulé"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {ticket.status === "ACTIVE" && (
            <View className="flex-row items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <Text className="text-amber-600 text-xs flex-1 leading-5">
                ⚠️ Ce QR code est personnel et à usage unique. Ne le partagez
                pas avec autres personnes.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
