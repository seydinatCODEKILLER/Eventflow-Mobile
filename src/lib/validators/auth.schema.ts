import { z } from "zod";

// ── Login ────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// ── Register — étape par étape ───────────────────────────────
export const step1Schema = z.object({
  fullName: z.string().min(2, "Nom complet requis (min 2 caractères)"),
});

export const step2Schema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+221(77|70|78|76)\d{7}$/.test(val),
      "Format invalide ex: +221771234567",
    ),
});

export const step3Schema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Doit contenir une majuscule, une minuscule et un chiffre",
      ),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type Step1FormValues = z.infer<typeof step1Schema>;
export type Step2FormValues = z.infer<typeof step2Schema>;
export type Step3FormValues = z.infer<typeof step3Schema>;
export type RegisterFormValues = z.infer<typeof step1Schema> &
  z.infer<typeof step2Schema> &
  Omit<z.infer<typeof step3Schema>, "confirmPassword">;