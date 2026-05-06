import { api } from "./client";
import { User } from "../types/auth.type";
import {
  UserTicket,
  UserPayment,
  UpdateProfilePayload,
} from "../types/user.type";
import { buildApiBody } from "../utils/api-body";

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>("/users/me");
    return data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { body, isMultipart } = buildApiBody(payload, "avatarUri", "avatar");

    const { data } = await api.patch<{ data: User }>("/users/me", body, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    return data.data;
  },

  updatePushToken: async (pushToken: string): Promise<void> => {
    await api.patch("/users/me/push-token", { pushToken });
  },

  getMyTickets: async (): Promise<UserTicket[]> => {
    const { data } = await api.get<{ data: UserTicket[] }>("/users/me/tickets");
    return data.data;
  },

  getMyEvents: async (): Promise<{ data: any[]; pagination: any }> => {
    const { data } = await api.get<{ data: any[]; pagination: any }>(
      "/users/me/events",
    );
    return data;
  },

  getMyPayments: async (): Promise<UserPayment[]> => {
    const { data } = await api.get<{ data: UserPayment[] }>(
      "/users/me/payments",
    );
    return data.data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete("/users/me");
  },
};
