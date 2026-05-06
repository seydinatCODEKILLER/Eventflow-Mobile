import { api } from "./client";
import {
  Event,
  CreateEventPayload,
  OrganizedEvent,
  ScanResult,
  EventModerator,
  EventTicket,
  EventStats,
} from "../types/event.type";
import { buildApiBody } from "../utils/api-body";

export const eventsApi = {
  create: async (payload: CreateEventPayload): Promise<Event> => {
    const { body, isMultipart } = buildApiBody(payload, "imageUri", "image");

    const { data } = await api.post<{ data: Event }>("/events", body, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    return data.data;
  },

  getOrganizedEvents: async (options?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: OrganizedEvent[]; pagination: any }> => {
    const { data } = await api.get<{
      success: boolean;
      data: OrganizedEvent[];
      pagination: any;
    }>("/events", { params: options });

    return data;
  },

  getById: async (eventId: string): Promise<Event> => {
    const { data } = await api.get<{ data: Event }>(`/events/${eventId}`);
    return data.data;
  },

  update: async (
    eventId: string,
    payload: Partial<CreateEventPayload>,
  ): Promise<Event> => {
    const { body, isMultipart } = buildApiBody(payload, "imageUri", "image");
    const { data } = await api.patch<{ data: Event }>(
      `/events/${eventId}`,
      body,
      {
        headers: isMultipart
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      },
    );
    return data.data;
  },

  publish: async (eventId: string): Promise<Event> => {
    const { data } = await api.patch<{ data: Event }>(
      `/events/${eventId}/publish`,
    );
    return data.data;
  },

  close: async (eventId: string): Promise<Event> => {
    const { data } = await api.patch<{ data: Event }>(
      `/events/${eventId}/close`,
    );
    return data.data;
  },

  delete: async (eventId: string): Promise<void> => {
    await api.delete<void>(`/events/${eventId}`);
  },

  getStats: async (eventId: string): Promise<EventStats> => {
    const { data } = await api.get<{ data: EventStats }>(
      `/events/${eventId}/stats`,
    );
    return data.data;
  },

  // ─── Tickets ───────────────────────────────────────────────
  getTickets: async (eventId: string): Promise<EventTicket[]> => {
    const { data } = await api.get<{ data: EventTicket[] }>(
      `/events/${eventId}/tickets`,
    );
    return data.data;
  },

  // ─── Modérateurs ───────────────────────────────────────────
  getModerators: async (eventId: string): Promise<EventModerator[]> => {
    const { data } = await api.get<{ data: EventModerator[] }>(
      `/events/${eventId}/moderators`,
    );
    return data.data;
  },

  addModerator: async (
    eventId: string,
    email: string,
  ): Promise<EventModerator> => {
    const { data } = await api.post<{ data: EventModerator }>(
      `/events/${eventId}/moderators`,
      { email },
    );
    return data.data;
  },

  removeModerator: async (
    eventId: string,
    moderatorId: string,
  ): Promise<void> => {
    await api.delete<void>(`/events/${eventId}/moderators/${moderatorId}`);
  },

  // ─── Scan ──────────────────────────────────────────────────
  validateTicket: async (
    qrPayload: string,
    deviceId: string,
  ): Promise<ScanResult> => {
    const { data } = await api.post<{ data: ScanResult }>("/tickets/validate", {
      qrPayload,
      deviceId,
    });
    return data.data;
  },
};
