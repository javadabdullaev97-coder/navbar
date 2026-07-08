// Словарь переводов: русский ключ → { uz (uz-Latn), en }.
// Русский язык не хранится здесь — он и есть ключ (см. i18n.tsx).
// Строки с подстановкой используют {name}, {count} и т.п.
import type { Lang } from "./store";

export type Translations = Record<string, Partial<Record<Exclude<Lang, "ru">, string>>>;

export const DICT: Translations = {
  // Наполняется по мере перевода экранов.
};
