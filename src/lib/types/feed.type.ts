export type EventCategory =
  | "CONCERT"
  | "CONFERENCE"
  | "SPORT"
  | "FETE"
  | "ART"
  | "GASTRONOMIE"
  | "AUTRE";

export type EventStatus = "PUBLISHED" | "ONGOING" | "CLOSED" | "DRAFT";

export interface FeedEvent {
  id: string;
  title: string;
  description: string | null;
  location: string;
  city: string | null;
  startDate: string;
  endDate: string | null;
  category: EventCategory;
  imageUrl: string | null;
  isFree: boolean;
  price: number | null;
  currency: string;
  capacity: number;
  attendeesCount: number;
  remainingSeats: number;
  status: EventStatus;
}

export interface FeedEventDetail extends FeedEvent {
  organizer: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  isRegistered: boolean;
  registrationStatus: "ACTIVE" | "USED" | "CANCELLED" | null;
}

export interface FeedResponse {
  data: FeedEvent[];
  nextCursor: string | null;
}

export interface FeedFilters {
  category?: EventCategory;
  city?: string;
  search?: string;
  isFree?: boolean;
}

export interface RegisterFreeResult {
  requiresPayment: false;
  message: string;
  ticketId: string;
}

export interface RegisterPaidResult {
  requiresPayment: true;
  message: string;
  paymentId: string;
  reference: string;
  amount: number;
  currency: string;
}

export type RegisterResult = RegisterFreeResult | RegisterPaidResult;

export interface NearbyEvent extends FeedEvent {
  distance: number; // en km
}