"use client";
// Обеспечивает анонимную сессию клиента (Supabase Anonymous sign-in).
// Личность живёт в браузере; к ней привязываются записи и избранное.
// Позже (волна интеграций) сессию повышаем до телефонного аккаунта.
import { supabaseClient } from "./supabase-client";

let ensuring: Promise<void> | null = null;

export function ensureAnonSession(): Promise<void> {
  if (ensuring) return ensuring;
  ensuring = (async () => {
    const sb = supabaseClient();
    const { data } = await sb.auth.getSession();
    if (!data.session) {
      await sb.auth.signInAnonymously();
    }
  })();
  return ensuring;
}
