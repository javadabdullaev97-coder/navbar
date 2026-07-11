// API кабинета мастера. Личность мастера — анонимная сессия, «превращённая»
// в демо-мастера через claim_demo_master() (email/OTP не требуется на этом этапе).
// Все RPC работают в контексте auth.uid() и защищены RLS + security-definer.
import { useCallback, useEffect, useState } from "react";
import { ensureAnonSession, supabase, supabaseConfigured } from "./supabase";

export { supabaseConfigured as masterConfigured };

export type MasterService = { id: string; name: string; duration_min: number; price: number; is_active: boolean };
export type MasterAvailability = { day_of_week: number; start_min: number; end_min: number; is_day_off: boolean };
export type MyMaster = {
  org_id: string;
  slug: string;
  specialization: string | null;
  bio: string | null;
  address: string | null;
  visible_in_search: boolean;
  services: MasterService[];
  availability: MasterAvailability[];
};
export type MasterBookingStatus = "pending" | "confirmed" | "done" | "cancelled";
export type MasterBooking = {
  id: string;
  client_name: string | null;
  client_phone: string | null;
  service_name: string | null;
  starts_at: string;
  ends_at: string;
  status: MasterBookingStatus;
};

// Анонимная сессия + захват демо-мастера (идемпотентно). Ошибки «уже владелец /
// уже занят» не критичны — просто читаем то, что доступно.
let claiming: Promise<void> | null = null;
export function ensureMasterSession(): Promise<void> {
  if (!supabaseConfigured) return Promise.resolve();
  if (claiming) return claiming;
  claiming = (async () => {
    await ensureAnonSession();
    try { await supabase.rpc("claim_demo_master"); } catch { /* уже занят/владелец */ }
  })();
  return claiming;
}

export async function getMyMaster(): Promise<MyMaster | null> {
  await ensureMasterSession();
  const { data, error } = await supabase.rpc("get_my_master");
  if (error) throw error;
  return (data as MyMaster | null) ?? null;
}

export async function getMasterBookings(): Promise<MasterBooking[]> {
  await ensureMasterSession();
  const { data, error } = await supabase.rpc("get_my_bookings");
  if (error) throw error;
  return (data as MasterBooking[]) ?? [];
}

export async function upsertService(p: { id?: string; name: string; duration: number; price: number }): Promise<string> {
  await ensureMasterSession();
  const { data, error } = await supabase.rpc("upsert_service", {
    p_id: p.id ?? null, p_name: p.name, p_duration: p.duration, p_price: p.price,
  });
  if (error) throw error;
  return data as string;
}

export async function deleteService(id: string): Promise<void> {
  await ensureMasterSession();
  const { error } = await supabase.rpc("delete_service", { p_id: id });
  if (error) throw error;
}

export async function setAvailability(dow: number, start: number, end: number, dayoff: boolean): Promise<void> {
  await ensureMasterSession();
  const { error } = await supabase.rpc("set_availability", { p_dow: dow, p_start: start, p_end: end, p_dayoff: dayoff });
  if (error) throw error;
}

export async function setBookingStatus(booking: string, status: MasterBookingStatus): Promise<void> {
  await ensureMasterSession();
  const { error } = await supabase.rpc("set_booking_status", { p_booking: booking, p_status: status });
  if (error) throw error;
}

export async function updateMyProfile(p: { spec?: string | null; bio?: string | null; address?: string | null; visible?: boolean | null; slug?: string | null; category?: string | null }): Promise<void> {
  await ensureMasterSession();
  const { error } = await supabase.rpc("update_my_profile", {
    p_spec: p.spec ?? null, p_bio: p.bio ?? null, p_address: p.address ?? null,
    p_visible: p.visible ?? null, p_slug: p.slug ?? null, p_category: p.category ?? null,
  });
  if (error) throw error;
}

// ── Хуки с откатом на демо и reload ──────────────────────────────
type Resource<T> = { data: T | null; loading: boolean; reload: () => Promise<void> };
function useResource<T>(fetcher: () => Promise<T>): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    if (!supabaseConfigured) return;
    setLoading(true);
    try { setData(await fetcher()); } catch { setData(null); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, reload };
}

export function useMyMaster() { return useResource<MyMaster | null>(getMyMaster); }
export function useMasterBookings() { return useResource<MasterBooking[]>(getMasterBookings); }
