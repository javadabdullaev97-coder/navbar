// i18n-словари. База — English (CLAUDE.md §12, app-spec §1.3).
// Все строки UI — только отсюда; в компонентах не хардкодить.

import type { Locale } from "../types.js";
import { en } from "./en.js";
import { ru } from "./ru.js";
import { uz } from "./uz.js";

export type MessageKey = keyof typeof en;

const dicts: Record<Locale, Record<MessageKey, string>> = { en, ru, uz };

export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string>,
): string {
  let s = dicts[locale]?.[key] ?? en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v);
    }
  }
  return s;
}

/** Язык первого входа: язык устройства, если поддержан, иначе English. */
export function resolveInitialLocale(deviceLang: string | undefined): Locale {
  const base = (deviceLang ?? "").slice(0, 2).toLowerCase();
  return base === "ru" || base === "uz" ? (base as Locale) : "en";
}

export { en, ru, uz };
