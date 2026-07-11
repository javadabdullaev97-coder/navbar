// API кабинета мастера. Личность мастера — реальная email-сессия (мультимастер).
// Профиль создаётся become_solo_master() на онбординге. Все RPC работают в
// контексте auth.uid() и защищены RLS + security-definer.
import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./supabase";

export { supabaseConfigured as masterConfigured };

/** Стать соло-мастером: создаёт организацию + профиль + дефолтный график. */
export async function becomeSoloMaster(name: string, spec: string, city?: string): Promise<void> {
  const { error } = await supabase.rpc("become_solo_master", { p_name: name, p_spec: spec, p_city: city ?? null });
  if (error) throw error;
}

export type MasterService = { id: string; name: string; description: string | null; duration_min: number; price: number; is_active: boolean };
export type MasterAvailability = { day_of_week: number; start_min: number; end_min: number; is_day_off: boolean };
export type MyMaster = {
  org_id: string;
  slug: string;
  specialization: string | null;
  bio: string | null;
  address: string | null;
  avatar_url: string | null;
  verified: boolean;
  visible_in_search: boolean;
  services: MasterService[];
  availability: MasterAvailability[];
};
export type GalleryItem = { id: string; url: string; caption: string | null };
export type MasterBookingStatus = "pending" | "confirmed" | "done" | "cancelled";
export type MasterBooking = {
  id: string;
  client_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_note: string | null;
  service_name: string | null;
  starts_at: string;
  ends_at: string;
  status: MasterBookingStatus;
};

export type MasterClient = { id: string; name: string; phone: string; notes: string | null; visits: number; last_visit: string | null };
export type ClientHistory = { id: string; service_name: string | null; price: number | null; starts_at: string; status: MasterBookingStatus };
export type MasterClientDetail = { id: string; name: string; phone: string; notes: string | null; since: string; visits: number; total_spent: number; history: ClientHistory[] };

export async function getMyMaster(): Promise<MyMaster | null> {
  const { data, error } = await supabase.rpc("get_my_master");
  if (error) throw error;
  return (data as MyMaster | null) ?? null;
}

export async function getMasterBookings(): Promise<MasterBooking[]> {
  const { data, error } = await supabase.rpc("get_my_bookings");
  if (error) throw error;
  return (data as MasterBooking[]) ?? [];
}

export async function upsertService(p: { id?: string; name: string; duration: number; price: number; description?: string }): Promise<string> {
  const { data, error } = await supabase.rpc("upsert_service", {
    p_id: p.id ?? null, p_name: p.name, p_duration: p.duration, p_price: p.price, p_description: p.description ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function getMyClients(): Promise<MasterClient[]> {
  const { data, error } = await supabase.rpc("get_my_clients");
  if (error) throw error;
  return (data as MasterClient[]) ?? [];
}

export async function getClient(id: string): Promise<MasterClientDetail | null> {
  const { data, error } = await supabase.rpc("get_client", { p_id: id });
  if (error) throw error;
  return (data as MasterClientDetail | null) ?? null;
}

export async function setClientNote(id: string, note: string): Promise<void> {
  const { error } = await supabase.rpc("set_client_note", { p_id: id, p_note: note });
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_service", { p_id: id });
  if (error) throw error;
}

export async function setAvailability(dow: number, start: number, end: number, dayoff: boolean): Promise<void> {
  const { error } = await supabase.rpc("set_availability", { p_dow: dow, p_start: start, p_end: end, p_dayoff: dayoff });
  if (error) throw error;
}

export async function setBookingStatus(booking: string, status: MasterBookingStatus): Promise<void> {
  const { error } = await supabase.rpc("set_booking_status", { p_booking: booking, p_status: status });
  if (error) throw error;
}

export async function updateMyProfile(p: { spec?: string | null; bio?: string | null; address?: string | null; visible?: boolean | null; slug?: string | null; category?: string | null }): Promise<void> {
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

export async function setAvatar(url: string): Promise<void> {
  const { error } = await supabase.rpc("set_avatar", { p_url: url });
  if (error) throw error;
}

export async function submitVerification(docPath: string): Promise<void> {
  const { error } = await supabase.rpc("submit_verification", { p_doc_path: docPath });
  if (error) throw error;
}

export async function getMyGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase.rpc("get_my_gallery");
  if (error) throw error;
  return (data as GalleryItem[]) ?? [];
}

export async function addGalleryItem(url: string, caption?: string): Promise<void> {
  const { error } = await supabase.rpc("add_gallery_item", { p_url: url, p_caption: caption ?? null });
  if (error) throw error;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_gallery_item", { p_id: id });
  if (error) throw error;
}

export function useMyMaster() { return useResource<MyMaster | null>(getMyMaster); }
export function useMyGallery() { return useResource<GalleryItem[]>(getMyGallery); }
export function useMyClients() { return useResource<MasterClient[]>(getMyClients); }
export function useMasterBookings() { return useResource<MasterBooking[]>(getMasterBookings); }

export type Analytics = {
  total: number;
  count: number;
  by_day: { date: string; amount: number }[];
  by_service: { name: string; count: number; total: number }[];
};

export async function getMyAnalytics(days: number): Promise<Analytics> {
  const { data, error } = await supabase.rpc("get_my_analytics", { p_days: days });
  if (error) throw error;
  return (data as Analytics) ?? { total: 0, count: 0, by_day: [], by_service: [] };
}

export function useMasterAnalytics(days: number) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    if (!supabaseConfigured) return;
    setLoading(true);
    try { setData(await getMyAnalytics(days)); } catch { setData(null); } finally { setLoading(false); }
  }, [days]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, reload };
}
