export interface UserTicket {
  id: string;
  status: "ACTIVE" | "USED" | "CANCELLED";
  qrUrl: string;
  usedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    status: string;
    imageUrl: string | null;
  };
}

export interface UserPayment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  method: "ORANGE_MONEY" | "WAVE" | "FREE_MONEY" | "CARD";
  reference: string;
  completedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
  };
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatarUri?: string;
}