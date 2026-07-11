// Реальная авторизация по email (6-значный код Supabase). Мультиклиент и
// мультимастер: каждый вход — отдельный auth.uid(), свои данные под RLS.
import { supabase, supabaseConfigured } from "./supabase";

/** Отправить одноразовый код на email (создаёт пользователя, если новый). */
export async function sendEmailCode(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

/** Проверить код и открыть сессию. */
export async function verifyEmailCode(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: "email",
  });
  if (error) throw error;
}

/** Гостевой вход (анонимно) — только для клиента без регистрации. */
export async function ensureGuest(): Promise<void> {
  if (!supabaseConfigured) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) await supabase.auth.signInAnonymously();
}

export async function signOut(): Promise<void> {
  if (!supabaseConfigured) return;
  await supabase.auth.signOut();
}

export async function currentUserId(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function isAnonymous(): Promise<boolean> {
  if (!supabaseConfigured) return true;
  const { data } = await supabase.auth.getSession();
  return Boolean((data.session?.user as { is_anonymous?: boolean } | undefined)?.is_anonymous);
}
