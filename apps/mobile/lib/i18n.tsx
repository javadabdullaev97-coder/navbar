// Лёгкий i18n: русский текст — это и есть ключ. Для uz/en берём перевод из
// словаря; если его нет — показываем русский (безопасный фолбэк).
// Использование: const t = useT(); <AppText>{t("Записаться")}</AppText>
// С подстановкой: t("Привет, {name}", { name }) → "Привет, Азиз".
import { Lang, useStore } from "./store";
import { DICT } from "./i18n-dict";

function interpolate(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function translate(key: string, lang: Lang, params?: Record<string, string | number>): string {
  const base = lang === "ru" ? key : DICT[key]?.[lang] ?? key;
  return interpolate(base, params);
}

/** Хук перевода. Реагирует на смену языка в настройках. */
export function useT() {
  const { lang } = useStore();
  return (key: string, params?: Record<string, string | number>) => translate(key, lang, params);
}
