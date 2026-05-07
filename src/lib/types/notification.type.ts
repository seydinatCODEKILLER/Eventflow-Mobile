export type NotificationType =
  | "INSCRIPTION_CONFIRMED"
  | "EVENT_REMINDER"
  | "MODERATOR_ASSIGNED"
  | "TICKET_SCANNED"
  | "EVENT_CANCELLED"
  | "EVENT_UPDATED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  metadata: {
    eventId?: string;
    ticketId?: string;
    paymentId?: string;
  } | null;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    total: number;
    unread: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}