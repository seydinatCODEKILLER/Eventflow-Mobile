import { z } from "zod";

// ── Étape 1 — Infos de base ──────────────────────────────────
export const eventStep1Schema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  category: z.enum(
    ["CONCERT", "CONFERENCE", "SPORT", "FETE", "ART", "GASTRONOMIE", "AUTRE"],
    { message: "Catégorie invalide" }
  ),
  imageUri: z.string().optional(),
});

// ── Étape 2 — Lieu & Dates ───────────────────────────────────
export const eventStep2Schema = z
  .object({
    location: z.string().min(2, "Le lieu est requis"),
    city: z.string().optional(),
    startDate: z.date({ message: "La date de début est requise" }),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "La date de fin doit être après la date de début",
      path: ["endDate"],
    },
  );

// ── Étape 3 — Capacité & Tarif ───────────────────────────────
export const eventStep3Schema = z
  .object({
    capacity: z
      .number({ message: "La capacité doit être un nombre" })
      .int()
      .min(1, "La capacité doit être d'au moins 1"),
    isFree: z.boolean(),
    price: z.number().min(0).optional(),
    currency: z.string(),
  })
  .refine(
    (data) => {
      if (!data.isFree && (!data.price || data.price <= 0)) return false;
      return true;
    },
    {
      message: "Le prix est requis pour un événement payant",
      path: ["price"],
    },
  );

export type EventStep1Values = z.infer<typeof eventStep1Schema>;
export type EventStep2Values = z.infer<typeof eventStep2Schema>;
export type EventStep3Values = z.infer<typeof eventStep3Schema>;

export type CreateEventFormValues = EventStep1Values &
  EventStep2Values &
  EventStep3Values;