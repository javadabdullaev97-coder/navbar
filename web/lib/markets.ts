import type { Locale } from "./i18n";

// Реестр рынков. Всё страновое — валюта, телефонный код, часовой пояс,
// канал напоминаний — живёт здесь, а не в коде компонентов.
// Выход на новый рынок = новая запись в этом реестре, без правки логики.

export type Market = {
  id: string; // ISO-код страны
  defaultLocale: Locale;
  locales: Locale[]; // доступные языки интерфейса на этом рынке
  currency: string; // ISO 4217
  currencySuffix?: string; // локальное написание вместо кода валюты
  timezone: string; // IANA, дефолт для мастеров рынка
  phone: {
    dialCode: string; // "+998"
    totalDigits: number; // цифр всего, включая код страны
    placeholder: string;
  };
  reminderChannel: string; // основной канал напоминаний на рынке
};

export const MARKETS: Record<string, Market> = {
  UZ: {
    id: "UZ",
    defaultLocale: "ru",
    locales: ["ru", "uz"],
    currency: "UZS",
    currencySuffix: "сум",
    timezone: "Asia/Tashkent",
    phone: {
      dialCode: "+998",
      totalDigits: 12,
      placeholder: "+998 90 123 45 67",
    },
    reminderChannel: "Telegram",
  },
  // Шаблоны будущих рынков (раскомментировать при запуске):
  // KZ: { ..., currency: "KZT", phone: { dialCode: "+7", ... }, reminderChannel: "Telegram" }
  // MX: { ..., defaultLocale: "es", currency: "MXN", phone: { dialCode: "+52", ... }, reminderChannel: "WhatsApp" }
  // ID: { ..., defaultLocale: "en", currency: "IDR", phone: { dialCode: "+62", ... }, reminderChannel: "WhatsApp" }
};

export function getMarket(id: string): Market {
  const m = MARKETS[id];
  if (!m) throw new Error(`Unknown market: ${id}`);
  return m;
}

// Цены храним целым числом в минимальных единицах валюты (UZS — без копеек).
export function formatPrice(
  amount: number,
  market: Market,
  locale: Locale
): string {
  if (market.currencySuffix) {
    return amount.toLocaleString(locale) + " " + market.currencySuffix;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: market.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function validatePhone(raw: string, market: Market): boolean {
  const digits = raw.replace(/\D/g, "");
  const dial = market.phone.dialCode.replace(/\D/g, "");
  return digits.startsWith(dial) && digits.length === market.phone.totalDigits;
}

// Текущее время в часовом поясе мастера — слоты считаем в его поясе,
// а не в поясе устройства клиента.
export function nowInTimeZone(tz: string): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
}
