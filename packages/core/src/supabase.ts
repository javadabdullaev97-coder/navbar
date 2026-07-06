// Фабрика Supabase-клиента. Один клиент на все поверхности (web/mobile/edge).
// Ключи приходят из env поверхности (NEXT_PUBLIC_* / EXPO_PUBLIC_*) — здесь
// core их не читает сам, чтобы не зависеть от рантайма; принимает параметрами.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/** Клиент с anon-ключом (защищён RLS). Для браузера/приложения. */
export function createAnonClient(cfg: SupabaseConfig): SupabaseClient {
  if (!cfg.url || !cfg.anonKey) {
    throw new Error("Supabase config missing url/anonKey");
  }
  return createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/**
 * Серверный клиент с service-role-ключом. ТОЛЬКО на сервере / в edge functions
 * (CLAUDE.md §9). Никогда не звать из клиентского бандла.
 */
export function createServiceClient(url: string, serviceRoleKey: string): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service config missing url/serviceRoleKey");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
