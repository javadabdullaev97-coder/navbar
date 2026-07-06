// Zod-схемы для валидации ввода (CLAUDE.md §4: валидация в общем core, не дублировать).
// Используются и на web, и на mobile, и в edge functions.

import { z } from "zod";

// Телефон в E.164: + и 8–15 цифр (международный, любая страна — app-spec §1.5).
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Invalid phone (E.164 expected, e.g. +998901234567)");

export const localeSchema = z.enum(["en", "ru", "uz"]);

// Slug публичной страницы мастера: латиница, цифры, дефис.
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/, "Invalid slug");

// Заявка на публичную запись (то, что уходит в SECURITY DEFINER RPC).
export const createBookingSchema = z.object({
  masterSlug: slugSchema,
  serviceIds: z.array(z.string().uuid()).min(1, "Pick at least one service"),
  startsAt: z.string().datetime(), // ISO UTC
  clientName: z.string().trim().min(2).max(80),
  clientPhone: phoneSchema,
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// Услуга мастера
export const serviceInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  durationMin: z.number().int().positive().max(24 * 60),
  price: z.number().int().nonnegative(),
  category: z.string().trim().max(60).optional(),
});
export type ServiceInput = z.infer<typeof serviceInputSchema>;

// Профиль мастера при онбординге
export const masterProfileInputSchema = z.object({
  specialization: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(1000).optional(),
  address: z.string().trim().max(240).optional(),
  slug: slugSchema.optional(),
});
export type MasterProfileInput = z.infer<typeof masterProfileInputSchema>;
