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

/** Нормализовать телефон в E.164 (пробелы/дефисы прочь, ведущий +). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/** Отправить SMS-код на номер (нужен настроенный SMS-провайдер в Supabase). */
export async function sendPhoneCode(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone: normalizePhone(phone) });
  if (error) throw error;
}

/** Проверить SMS-код и открыть сессию. */
export async function verifyPhoneCode(phone: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    phone: normalizePhone(phone),
    token: token.trim(),
    type: "sms",
  });
  if (error) throw error;
}

/** Вход или регистрация по email+паролю (без SMTP; при выключенном
 *  «Confirm email» сессия открывается сразу). Новый email → регистрируем,
 *  существующий с верным паролем → входим, иначе — ошибка. */
export async function signInOrUp(email: string, password: string): Promise<void> {
  const em = email.trim().toLowerCase();
  const { error } = await supabase.auth.signInWithPassword({ email: em, password });
  if (!error) return;
  const { error: upErr } = await supabase.auth.signUp({ email: em, password });
  if (upErr) throw error; // email занят / неверный пароль → исходная ошибка входа
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Требуется подтверждение email. Отключите «Confirm email» в Supabase.");
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

/** Удалить аккаунт и ВСЕ связанные данные (RPC delete_my_account), затем выйти.
 *  Необратимо: профиль, услуги, брони, клиенты, отзыв, избранное и сам вход. */
export async function deleteAccount(): Promise<void> {
  if (!supabaseConfigured) return;
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;
  await supabase.auth.signOut().catch(() => {});
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
