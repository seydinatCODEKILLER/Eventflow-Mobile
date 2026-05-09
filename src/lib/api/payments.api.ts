import { api } from "./client";
import {
  Payment,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  ConfirmPaymentResponse,
} from "../types/payment.type";

export const paymentsApi = {
  initiate: async (
    payload: InitiatePaymentPayload,
  ): Promise<InitiatePaymentResponse> => {
    const { data } = await api.post<{ data: InitiatePaymentResponse }>(
      "/payments/initiate",
      payload,
    );
    return data.data;
  },

  confirm: async (
    reference: string,
    status: "COMPLETED" | "FAILED",
  ): Promise<ConfirmPaymentResponse> => {
    const { data } = await api.post<ConfirmPaymentResponse>(
      "/payments/confirm",
      { reference, status },
    );
    return data;
  },

  getById: async (paymentId: string): Promise<Payment> => {
    const { data } = await api.get<{ data: Payment }>(`/payments/${paymentId}`);
    return data.data;
  },
};
