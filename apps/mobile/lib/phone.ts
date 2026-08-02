// Телефонный ввод на libphonenumber-js: все страны, формат по стране,
// определение страны по номеру, флаг из ISO-кода. Код оператора (2-я группа)
// оборачиваем в скобки, чтобы отличался от основного номера.
import { AsYouType, CountryCode, getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";

/** Эмодзи-флаг из ISO-кода страны. */
export function flagOf(iso: string): string {
  return iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export type PhoneInfo = { text: string; country?: string; hasNational: boolean };

/** Форматирует ввод и возвращает страну. Флага нет, если страна не определена. */
export function formatPhone(raw: string): PhoneInfo {
  const ayt = new AsYouType();
  let text = ayt.input(raw);
  const country = ayt.getCountry();
  const digits = raw.replace(/\D/g, "");
  let callLen = 0;
  try { if (country) callLen = getCountryCallingCode(country).length; } catch { /* noop */ }
  const hasNational = !!country && digits.length > callLen;
  // Скобки вокруг кода оператора/региона (2-й группы), когда он уже введён.
  const parts = text.split(" ");
  if (parts.length >= 3 && parts[0].startsWith("+")) {
    parts[1] = `(${parts[1]})`;
    text = parts.join(" ");
  }
  return { text, country, hasNational };
}

/** Код страны (без +) по ISO-региону; по умолчанию Узбекистан. */
export function dialForRegion(region?: string | null): string {
  if (!region) return "998";
  try { return getCountryCallingCode(region.toUpperCase() as CountryCode); } catch { return "998"; }
}

/** Валидный ли полный номер (по правилам страны). */
export function isValidPhone(raw: string): boolean {
  try { return isValidPhoneNumber(raw); } catch { return false; }
}
