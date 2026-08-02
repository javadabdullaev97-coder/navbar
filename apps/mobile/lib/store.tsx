import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { detectDeviceLang } from "./locale";
import { setFmtLang } from "./format";
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
// Только ЯВНЫЙ выбор языка пользователем. Пусто → следуем языку телефона.
// Новый ключ (…pref) намеренно игнорирует старое авто-сохранение, которое «прилипало».
const LANG_KEY = "ora.lang.pref";
const THEME_KEY = "ora.theme";
const DEFAULT_PROFILE: ClientProfile = { name: "", phone: "" };

const isLang = (v: unknown): v is Lang => v === "ru" || v === "uz" || v === "en";
const isTheme = (v: unknown): v is ThemeMode => v === "light" || v === "dark" || v === "auto";

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
  specialist: "",
  initial: "•",
  spec: "",
  address: "",
  service: "",
  serviceIds: [],
  price: 0,
  duration: 60,
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
  // Первый запуск — язык устройства (en/ru/uz, иначе English). Потом — сохранённый.
  const [lang, setLangState] = useState<Lang>(() => detectDeviceLang());
  // Тема по умолчанию следует системе (светлая/тёмная по устройству).
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [profile, setProfileState] = useState<ClientProfile>(DEFAULT_PROFILE);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);

  // Загружаем сохранённые настройки при старте.
  useEffect(() => {
    let alive = true;
    AsyncStorage.multiGet([PROFILE_KEY, LANG_KEY, THEME_KEY])
      .then((pairs) => {
        if (!alive) return;
        const map = Object.fromEntries(pairs) as Record<string, string | null>;
        if (map[PROFILE_KEY]) { try { setProfileState(JSON.parse(map[PROFILE_KEY] as string)); } catch { /* игнор */ } }
        // Язык: только явный выбор пользователя переопределяет язык телефона.
        // Если пользователь ничего не выбирал — оставляем язык устройства (initial state)
        // и НЕ сохраняем, чтобы приложение всегда следовало языку телефона.
        if (isLang(map[LANG_KEY])) setLangState(map[LANG_KEY] as Lang);
        if (isTheme(map[THEME_KEY])) setThemeModeState(map[THEME_KEY] as ThemeMode);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const setProfile = (p: ClientProfile) => {
    setProfileState(p);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p)).catch(() => {});
  };

  // Смена языка/темы — сохраняем на устройстве, чтобы держалось между запусками.
  const setLang = (l: Lang) => { setLangState(l); AsyncStorage.setItem(LANG_KEY, l).catch(() => {}); };
  const setThemeMode = (m: ThemeMode) => { setThemeModeState(m); AsyncStorage.setItem(THEME_KEY, m).catch(() => {}); };

  // Держим форматтер дат/денег/длительности в том же языке (синхронно до рендера детей).
  setFmtLang(lang);

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
