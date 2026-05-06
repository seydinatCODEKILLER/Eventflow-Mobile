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
