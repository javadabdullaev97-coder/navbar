import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Подключён ли Supabase (заданы ли env). Пока нет — приложение работает на демо-данных. */
export const supabaseConfigured = Boolean(url) && Boolean(anon);

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "public-anon-placeholder",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Анонимная сессия клиента: личность в устройстве, к ней привязаны записи/избранное.
let ensuring: Promise<void> | null = null;
export function ensureAnonSession(): Promise<void> {
  if (!supabaseConfigured) return Promise.resolve();
  if (ensuring) return ensuring;
  ensuring = (async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) await supabase.auth.signInAnonymously();
  })();
  return ensuring;
}
