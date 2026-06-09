// Мок-данные на время разработки.
// Структура повторяет будущие таблицы Supabase (masters, services, schedules),
// чтобы при подключении БД заменить только функции получения данных.

import type { Locale } from "./i18n";

export type Service = {
  id: string;
  name: string; // тексты услуг пишет сам мастер, они не переводятся
  durationMin: number;
  price: number; // целое число в минимальных единицах валюты мастера
};

export type ScheduleDay = {
  dayOfWeek: number; // 0=пн ... 6=вс
  startTime: string; // "09:00"
  endTime: string; // "20:00"
  isDayOff: boolean;
};

export type Master = {
  slug: string;
  name: string;
  specialization: string;
  address: string;
  bio: string;
  avatarUrl: string | null;
  marketId: string; // ссылка на реестр рынков (lib/markets.ts)
  locale: Locale; // язык страницы мастера
  timezone: string; // IANA, может отличаться от дефолта рынка
  services: Service[];
  schedule: ScheduleDay[];
};

const masters: Master[] = [
  {
    slug: "asror",
    name: "Асрор Каримов",
    specialization: "Барбер",
    address: "Ташкент, Чиланзар, ул. Бунёдкор 12",
    bio: "Мужские стрижки и оформление бороды. Опыт 7 лет.",
    avatarUrl: null,
    marketId: "UZ",
    locale: "ru",
    timezone: "Asia/Tashkent",
    services: [
      { id: "s1", name: "Мужская стрижка", durationMin: 60, price: 80000 },
      { id: "s2", name: "Стрижка + борода", durationMin: 90, price: 120000 },
      { id: "s3", name: "Оформление бороды", durationMin: 30, price: 50000 },
      { id: "s4", name: "Детская стрижка", durationMin: 45, price: 60000 },
    ],
    schedule: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 1, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 2, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 3, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 4, startTime: "09:00", endTime: "20:00", isDayOff: false },
      { dayOfWeek: 5, startTime: "10:00", endTime: "18:00", isDayOff: false },
      { dayOfWeek: 6, startTime: "00:00", endTime: "00:00", isDayOff: true },
    ],
  },
];

export function getMasterBySlug(slug: string): Master | undefined {
  return masters.find((m) => m.slug === slug);
}

export function getAllMasters(): Master[] {
  return masters;
}
