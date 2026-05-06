import { EventCategory, EventStatus } from "./feed.type";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  category: EventCategory;
  startDate: string;
  endDate: string | null;
  capacity: number;
  status: EventStatus;
  imageUrl: string | null;
  isFree: boolean;
  price: number | null;
  currency: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventModerator {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  assignedAt: string;
}

export interface EventAttendee {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface EventTicket {
  id: string;
  status: "ACTIVE" | "USED" | "CANCELLED";
  qrUrl: string | null;
  usedAt: string | null;
  addedByOrganizer: boolean;
  createdAt: string;
  user: EventAttendee;
}

export interface EventStats {
  capacity: number;
  remainingSeats: number;
  tickets: {
    total: number;
    ACTIVE: number;
    USED: number;
    CANCELLED: number;
  };
  scans: {
    total: number;
    VALID: number;
    ALREADY_USED: number;
    INVALID: number;
    CONFLICT: number;
    byMode: {
      ONLINE: number;
      OFFLINE: number;
    };
  };
  attendanceRate: number;
}

export interface ScanResult {
  result: "VALID" | "ALREADY_USED" | "INVALID";
  message: string;
  user?: EventAttendee;
  usedAt?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  location: string;
  city?: string;
  category: EventCategory;
  startDate: string;
  endDate?: string;
  capacity: number;
  isFree: boolean;
  price?: number;
  currency?: string;
  imageUri?: string;
}

export interface OrganizedEvent extends Event {
  ticketsCount?: number;
  scansCount?: number;
}
