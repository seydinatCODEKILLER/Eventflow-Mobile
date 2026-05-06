import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react-native";
import { useValidateTicket } from "@/src/lib/hooks/use-events";
import { ScanResult } from "@/src/lib/types/event.type";
import * as Device from "expo-device";

export default function ScanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const { mutate: validate, isPending } = useValidateTicket();

  const handleScan = useCallback(
    ({ data }: { data: string }) => {
      if (scanned || isPending) return;
      setScanned(true);

      validate(
        {
          qrPayload: data,
          deviceId: Device.deviceName ?? "unknown",
        },
        {
          onSuccess: (res) => {
            setResult(res);
            Vibration.vibrate(res.result === "VALID" ? 100 : [100, 100, 100]);
          },
          onError: () => {
            setResult({
              result: "INVALID",
              message: "Erreur lors de la validation",
            });
            Vibration.vibrate([100, 100, 100]);
          },
        },
      );
    },
    [scanned, isPending, validate],
  );

  const reset = useCallback(() => {
    setScanned(false);
    setResult(null);
  }, []);

  // Permission caméra refusée
  if (!permission?.granted) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-8 gap-4"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-foreground font-bold text-lg text-center">
          Accès à la caméra requis
        </Text>
        <Text className="text-muted-foreground text-sm text-center">
          Pour scanner les QR codes, veuillez autoriser un accès à la caméra.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.85}
          className="bg-primary rounded-2xl px-6 py-3"
        >
          <Text className="text-white font-bold text-sm">
            Autoriser la caméra
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">
          Scanner les tickets
        </Text>
      </View>

      {/* Camera */}
      <View className="flex-1 relative">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleScan}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Viseur */}
        {!result && (
          <View className="absolute inset-0 items-center justify-center">
            <View
              className="border-2 border-white rounded-3xl"
              style={{ width: 250, height: 250 }}
            >
              {/* Coins */}
              {[
                "top-0 left-0",
                "top-0 right-0",
                "bottom-0 left-0",
                "bottom-0 right-0",
              ].map((pos, i) => (
                <View
                  key={i}
                  className={`absolute w-8 h-8 border-primary ${pos}`}
                  style={{
                    borderTopWidth: i < 2 ? 3 : 0,
                    borderBottomWidth: i >= 2 ? 3 : 0,
                    borderLeftWidth: i % 2 === 0 ? 3 : 0,
                    borderRightWidth: i % 2 !== 0 ? 3 : 0,
                    borderRadius: 4,
                  }}
                />
              ))}
            </View>
            <Text className="text-white text-sm mt-4 opacity-80">
              Placez le QR code dans le cadre
            </Text>
          </View>
        )}

        {/* Résultat scan */}
        {(result || isPending) && (
          <View className="absolute inset-0 items-center justify-center bg-black/70">
            <View className="bg-white rounded-3xl p-8 mx-8 items-center gap-4">
              {isPending ? (
                <>
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text className="text-foreground font-bold text-lg">
                    Validation...
                  </Text>
                </>
              ) : result?.result === "VALID" ? (
                <>
                  <View className="w-20 h-20 rounded-full bg-green-500/10 items-center justify-center">
                    <CheckCircle2 size={48} color="#22c55e" />
                  </View>
                  <Text className="text-foreground font-bold text-xl">
                    Entrée validée ✓
                  </Text>
                  {result.user && (
                    <Text className="text-muted-foreground text-sm text-center">
                      {result.user.fullName}
                    </Text>
                  )}
                </>
              ) : result?.result === "ALREADY_USED" ? (
                <>
                  <View className="w-20 h-20 rounded-full bg-orange-500/10 items-center justify-center">
                    <AlertCircle size={48} color="#f97316" />
                  </View>
                  <Text className="text-foreground font-bold text-xl">
                    Déjà utilisé
                  </Text>
                  <Text className="text-muted-foreground text-sm text-center">
                    Ce ticket a déjà été scanné
                  </Text>
                </>
              ) : (
                <>
                  <View className="w-20 h-20 rounded-full bg-red-500/10 items-center justify-center">
                    <XCircle size={48} color="#ef4444" />
                  </View>
                  <Text className="text-foreground font-bold text-xl">
                    Ticket invalide
                  </Text>
                  <Text className="text-muted-foreground text-sm text-center">
                    {result?.message}
                  </Text>
                </>
              )}

              {!isPending && (
                <TouchableOpacity
                  onPress={reset}
                  activeOpacity={0.85}
                  className="bg-primary rounded-2xl px-8 py-3 mt-2"
                >
                  <Text className="text-white font-bold text-sm">
                    Scanner un autre ticket
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
