export type PaymentMethod = "ORANGE_MONEY" | "WAVE" | "FREE_MONEY" | "CARD";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  failureReason: string | null;
  completedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
  };
  ticket: {
    id: string;
    status: string;
  } | null;
}

export interface InitiatePaymentPayload {
  eventId: string;
  method: PaymentMethod;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  reference: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}
