// Supabase-клиент для web: читает публичные env и делегирует в @navbar/core.
import { createAnonClient } from "@navbar/core";

export function supabaseBrowser() {
  return createAnonClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  });
}

/** Настроен ли Supabase (есть ли env). До подключения проекта — false. */
export const supabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
