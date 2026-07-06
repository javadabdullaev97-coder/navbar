// @navbar/core — общий TS-core (CLAUDE.md §1, §4).
// Единственный источник типов, валидации, доменной логики и Supabase-клиента
// для web, mobile и edge functions. Логику между поверхностями не дублировать.

export * from "./types.js";
export * from "./schemas.js";
export * from "./slots.js";
export * from "./supabase.js";
export * from "./design.js";
export { t, resolveInitialLocale, type MessageKey } from "./i18n/index.js";
