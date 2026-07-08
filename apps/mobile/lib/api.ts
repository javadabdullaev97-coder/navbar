// Обёртки над RPC Supabase (тот же контракт, что и веб). Все функции —
// тонкие вызовы security-definer функций из supabase/migrations.
import { ensureAnonSession, supabase } from "./supabase";

export type CatalogMaster = {
  slug: string;
  name: string;
  specialization: string | null;
  category: string | null;
  address: string | null;
  rating: number;
  review_count: number;
  min_price: number | null;
};

export type PublicMaster = {
  slug: string;
  name: string;
  specialization: string | null;
  category: string | null;
  bio: string | null;
  address: string | null;
  cover_color: string | null;
  org_id: string;
  master_id: string;
  rating: number;
  review_count: number;
  services: { id: string; name: string; duration_min: number; price: number }[];
  availability: { day_of_week: number; start_min: number; end_min: number; is_day_off: boolean }[];
  portfolio: { url: string; caption: string | null }[];
};

export type ClientBooking = {
  id: string;
  master_slug: string;
  master_name: string;
  master_address: string | null;
  service_name: string | null;
  starts_at: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
};

export type Review = { author_name: string; stars: number; text: string | null; created_at: string };
export type Favorite = { slug: string; name: string; specialization: string | null };

// ── Чтение (доступно анониму, без входа) ──────────────────────────
export async function listMasters(category?: string): Promise<CatalogMaster[]> {
  const { data, error } = await supabase.rpc("list_public_masters", { p_category: category ?? null });
  if (error) throw error;
  return (data as CatalogMaster[]) ?? [];
}

export async function searchMasters(q: string): Promise<CatalogMaster[]> {
  const { data, error } = await supabase.rpc("search_public_masters", { p_q: q });
  if (error) throw error;
  return (data as CatalogMaster[]) ?? [];
}

export async function getMaster(slug: string): Promise<PublicMaster | null> {
  const { data, error } = await supabase.rpc("get_public_master", { p_slug: slug });
  if (error) throw error;
  return (data as PublicMaster | null) ?? null;
}

export async function getDayBusy(slug: string, dayISO: string): Promise<{ start_min: number; end_min: number }[]> {
  const { data, error } = await supabase.rpc("get_day_busy", { p_slug: slug, p_day: dayISO });
  if (error) throw error;
  return (data as { start_min: number; end_min: number }[]) ?? [];
}

export async function getReviews(slug: string): Promise<Review[]> {
  const { data, error } = await supabase.rpc("get_master_reviews", { p_slug: slug });
  if (error) throw error;
  return (data as Review[]) ?? [];
}

// ── Запись/личное (нужна анонимная сессия) ────────────────────────
export async function createBooking(params: {
  slug: string; serviceIds: string[]; startsAt: string; name: string; phone: string;
}) {
  await ensureAnonSession();
  const { data, error } = await supabase.rpc("create_public_booking", {
    p_slug: params.slug,
    p_service_ids: params.serviceIds,
    p_starts_at: params.startsAt,
    p_client_name: params.name,
    p_client_phone: params.phone,
  });
  if (error) throw error;
  return data;
}

export async function getMyBookings(): Promise<ClientBooking[]> {
  await ensureAnonSession();
  const { data, error } = await supabase.rpc("get_my_client_bookings");
  if (error) throw error;
  return (data as ClientBooking[]) ?? [];
}

export async function cancelBookingRpc(id: string) {
  await ensureAnonSession();
  const { error } = await supabase.rpc("cancel_my_booking", { p_booking: id });
  if (error) throw error;
}

export async function toggleFavorite(slug: string): Promise<boolean> {
  await ensureAnonSession();
  const { data, error } = await supabase.rpc("toggle_favorite", { p_slug: slug });
  if (error) throw error;
  return Boolean(data);
}

export async function getFavorites(): Promise<Favorite[]> {
  await ensureAnonSession();
  const { data, error } = await supabase.rpc("get_my_favorites");
  if (error) throw error;
  return (data as Favorite[]) ?? [];
}

export async function addReview(slug: string, stars: number, text: string, author: string) {
  await ensureAnonSession();
  const { error } = await supabase.rpc("add_review", { p_slug: slug, p_stars: stars, p_text: text, p_author: author });
  if (error) throw error;
}
