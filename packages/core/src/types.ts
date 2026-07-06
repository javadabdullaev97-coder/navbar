// Доменные типы Navbar. Отражают таблицы Supabase (supabase/migrations/0001_schema.sql).
// Источник истины по данным — БД; эти типы держим в синхроне со схемой вручную,
// пока не подключим генерацию через `supabase gen types typescript`.

export type OrgType = "solo" | "salon";
export type MemberRole = "owner" | "admin" | "master";
export type MemberStatus = "invited" | "pending" | "active" | "left";
export type SubscriptionPlan = "free" | "solo" | "salon";
export type SubscriptionStatus = "active" | "past_due" | "canceled";
export type CoverType = "color" | "photo";
export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";
export type BookingSource = "manual" | "web" | "app" | "telegram";
export type PaymentProvider = "payme" | "click" | "uzum" | "stripe";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Locale = "en" | "ru" | "uz";

export interface Organization {
  id: string;
  type: OrgType;
  name: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
}

export interface MasterProfile {
  id: string;
  org_id: string;
  user_id: string;
  slug: string | null;
  specialization: string | null;
  bio: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  cover_type: CoverType;
  cover_color: string | null;
  visible_in_search: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  org_id: string;
  master_id: string;
  name: string;
  duration_min: number;
  price: number; // минимальные единицы валюты
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Availability {
  id: string;
  org_id: string;
  master_id: string;
  day_of_week: number; // 0=пн ... 6=вс
  start_min: number; // минуты от полуночи
  end_min: number;
  is_day_off: boolean;
}

export interface Client {
  id: string;
  org_id: string;
  master_id: string;
  user_id: string | null;
  name: string;
  phone: string; // E.164
  notes: string | null;
  rating_sum: number;
  rating_count: number;
  visit_count: number;
  last_visit_at: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  org_id: string;
  master_id: string;
  client_id: string | null;
  service_id: string | null;
  starts_at: string; // ISO, timestamptz (UTC)
  ends_at: string;
  status: BookingStatus;
  source: BookingSource;
  notes: string | null;
  created_at: string;
}
