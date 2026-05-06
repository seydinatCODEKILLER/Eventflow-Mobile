import { api } from "./client";
import { Event, CreateEventPayload } from "../types/event.type";
import { buildApiBody } from "../utils/api-body";

export const eventsApi = {
  create: async (payload: CreateEventPayload): Promise<Event> => {
    const { body, isMultipart } = buildApiBody(
      payload,
      "imageUri",
      "image",
    );

    const { data } = await api.post<{ data: Event }>("/events", body, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    return data.data;
  },
};