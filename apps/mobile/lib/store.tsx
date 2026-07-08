import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Avail } from "./slots";

export type Role = "client" | "master";
export type Lang = "ru" | "uz" | "en";
export type ThemeMode = "light" | "dark" | "auto";
export type BookingStatus = "confirmed" | "pending" | "done" | "cancelled";

export const LANG_LABEL: Record<Lang, string> = { ru: "Русский", uz: "Oʻzbekcha", en: "English" };
export const THEME_LABEL: Record<ThemeMode, string> = { light: "Светлая", dark: "Тёмная", auto: "Авто" };

/** Профиль клиента на устройстве (без OTP). Имя/телефон для записей. */
export type ClientProfile = { name: string; phone: string };
const PROFILE_KEY = "ora.client.profile";
const DEFAULT_PROFILE: ClientProfile = { name: "", phone: "" };

export type Booking = {
  id: string;
  specialist: string;
  initial: string;
  spec: string;
  service: string;
  date: Date;
  duration: number;
  price: number;
  address: string;
  status: BookingStatus;
};

export type Draft = {
  slug: string;            // slug специалиста из БД ("" = демо-режим)
  specialist: string;
  initial: string;
  spec: string;
  address: string;
  service: string;          // название(я) выбранных услуг (через запятую)
  serviceIds: string[];     // uuid выбранных услуг из БД
  price: number;            // суммарная цена
  duration: number;         // суммарная длительность (для расчёта слотов)
  date: Date | null;
  availability: Avail[] | null; // график из БД для расчёта слотов
  serviceOptions: { id: string; name: string; duration_min: number; price: number }[] | null;
};

const DEFAULT_DRAFT: Draft = {
  slug: "",
  specialist: "Дилноза Каримова",
  initial: "Д",
  spec: "Клинический психолог",
  address: "Ташкент, Мирабад",
  service: "Индивидуальная консультация",
  serviceIds: [],
  price: 180000,
  duration: 50,
  date: null,
  availability: null,
  serviceOptions: null,
};

type StoreValue = {
  role: Role; setRole: (r: Role) => void;
  lang: Lang; setLang: (l: Lang) => void;
  themeMode: ThemeMode; setThemeMode: (t: ThemeMode) => void;
  profile: ClientProfile; setProfile: (p: ClientProfile) => void;
  bookings: Booking[];
  draft: Draft; patchDraft: (d: Partial<Draft>) => void;
  confirmBooking: () => Booking;
  cancelBooking: (id: string) => void;
};

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("client");
  const [lang, setLang] = useState<Lang>("ru");
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [profile, setProfileState] = useState<ClientProfile>(DEFAULT_PROFILE);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);

  // Загружаем профиль клиента из хранилища при старте.
  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then((raw) => { if (raw) setProfileState(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  const setProfile = (p: ClientProfile) => {
    setProfileState(p);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p)).catch(() => {});
  };

  const value = useMemo<StoreValue>(() => ({
    role, setRole,
    lang, setLang,
    themeMode, setThemeMode,
    profile, setProfile,
    bookings,
    draft,
    patchDraft: (d) => setDraft((prev) => ({ ...prev, ...d })),
    confirmBooking: () => {
      const b: Booking = {
        id: String(Date.now()),
        specialist: draft.specialist,
        initial: draft.initial,
        spec: draft.spec,
        service: draft.service,
        date: draft.date ?? new Date(),
        duration: draft.duration,
        price: draft.price,
        address: draft.address,
        status: "confirmed",
      };
      setBookings((prev) => [b, ...prev]);
      return b;
    },
    cancelBooking: (id) =>
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))),
  }), [role, lang, themeMode, profile, bookings, draft]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}
