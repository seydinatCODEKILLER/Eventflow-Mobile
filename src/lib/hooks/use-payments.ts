import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { paymentsApi } from "../api/payments.api";
import { InitiatePaymentPayload } from "../types/payment.type";
import { QUERY_KEYS } from "../utils/constants";

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) =>
      paymentsApi.initiate(payload),
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Échec du paiement",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

export const useConfirmPayment = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reference,
      status,
    }: {
      reference: string;
      status: "COMPLETED" | "FAILED";
    }) => paymentsApi.confirm(reference, status),
    onSuccess: (data, variables) => {
      if (variables.status === "COMPLETED" && data.ticketId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed });
        Toast.show({
          type: "success",
          text1: "Paiement confirmé ! 🎉",
          text2: "Votre ticket a été créé",
          visibilityTime: 3000,
          position: "top",
        });
        router.replace(`/(tabs)/profile/ticket/${data.ticketId}` as Href);
      } else {
        Toast.show({
          type: "error",
          text1: "Paiement échoué",
          text2: "Votre paiement n'a pas pu être traité",
          visibilityTime: 4000,
          position: "top",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: error?.response?.data?.message ?? "Une erreur est survenue",
        visibilityTime: 4000,
        position: "top",
      });
    },
  });
};

export const usePaymentDetails = (paymentId: string) => {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => paymentsApi.getById(paymentId),
    enabled: !!paymentId,
  });
};
