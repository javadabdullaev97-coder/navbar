// Коды стран для телефонного ввода. Флаг вычисляется из ISO-кода (эмодзи),
// поэтому картинки не нужны. Определение страны — по набранному коду (самый
// длинный совпавший префикс) и по IP/региону при старте.

export type Country = { code: string; dial: string; name: string };

// Порядок важен для общих кодов (+7 → берём Россию первой).
export const COUNTRIES: Country[] = [
  { code: "UZ", dial: "998", name: "Uzbekistan" },
  { code: "RU", dial: "7", name: "Russia" },
  { code: "KZ", dial: "7", name: "Kazakhstan" },
  { code: "KG", dial: "996", name: "Kyrgyzstan" },
  { code: "TJ", dial: "992", name: "Tajikistan" },
  { code: "TM", dial: "993", name: "Turkmenistan" },
  { code: "AZ", dial: "994", name: "Azerbaijan" },
  { code: "GE", dial: "995", name: "Georgia" },
  { code: "AM", dial: "374", name: "Armenia" },
  { code: "BY", dial: "375", name: "Belarus" },
  { code: "UA", dial: "380", name: "Ukraine" },
  { code: "TR", dial: "90", name: "Turkey" },
  { code: "AE", dial: "971", name: "UAE" },
  { code: "SA", dial: "966", name: "Saudi Arabia" },
  { code: "QA", dial: "974", name: "Qatar" },
  { code: "IR", dial: "98", name: "Iran" },
  { code: "IN", dial: "91", name: "India" },
  { code: "PK", dial: "92", name: "Pakistan" },
  { code: "CN", dial: "86", name: "China" },
  { code: "KR", dial: "82", name: "South Korea" },
  { code: "JP", dial: "81", name: "Japan" },
  { code: "ID", dial: "62", name: "Indonesia" },
  { code: "MY", dial: "60", name: "Malaysia" },
  { code: "TH", dial: "66", name: "Thailand" },
  { code: "US", dial: "1", name: "United States" },
  { code: "GB", dial: "44", name: "United Kingdom" },
  { code: "DE", dial: "49", name: "Germany" },
  { code: "FR", dial: "33", name: "France" },
  { code: "IT", dial: "39", name: "Italy" },
  { code: "ES", dial: "34", name: "Spain" },
  { code: "PL", dial: "48", name: "Poland" },
  { code: "NL", dial: "31", name: "Netherlands" },
  { code: "SE", dial: "46", name: "Sweden" },
  { code: "CA", dial: "1", name: "Canada" },
  { code: "BR", dial: "55", name: "Brazil" },
  { code: "MX", dial: "52", name: "Mexico" },
  { code: "EG", dial: "20", name: "Egypt" },
  { code: "NG", dial: "234", name: "Nigeria" },
  { code: "ZA", dial: "27", name: "South Africa" },
  { code: "AU", dial: "61", name: "Australia" },
];

const DEFAULT: Country = COUNTRIES[0]; // Uzbekistan

/** Эмодзи-флаг из ISO-кода страны (регион-индикаторы). */
export function flagOf(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/** Страна по номеру: самый длинный код-префикс, совпавший с цифрами. */
export function countryFromNumber(input: string): Country {
  const digits = input.replace(/[^\d]/g, "");
  let best: Country | null = null;
  for (const c of COUNTRIES) {
    if (digits.startsWith(c.dial) && (!best || c.dial.length > best.dial.length)) best = c;
  }
  return best ?? DEFAULT;
}

/** Страна по ISO-коду (из IP/региона устройства). */
export function countryByCode(code?: string | null): Country | undefined {
  if (!code) return undefined;
  const up = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === up);
}

export const DEFAULT_COUNTRY = DEFAULT;
