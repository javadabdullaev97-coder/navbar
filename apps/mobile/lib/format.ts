// Форматирование дат/денег/длительности с учётом языка (ru/uz/en).
// Язык задаётся setFmtLang() из StoreProvider — функции читают его синхронно,
// поэтому при смене языка все экраны переформатируются при перерендере.
// Без Intl (Hermes его урезает) — таблицы вручную.

type FLang = "ru" | "uz" | "en";
let _lang: FLang = "ru";
export function setFmtLang(l: FLang) { _lang = l; }

const WD = {
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  uz: ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sh"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
// Родительный падеж (для «12 июля»); в uz/en — обычные названия месяцев.
const MON_GEN = {
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
// Именительный падеж (для заголовков «Июль 2026»).
const MON_NOM = {
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  uz: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const UNIT = {
  ru: { h: "ч", m: "мин", cur: "сум" },
  uz: { h: "soat", m: "daq", cur: "so'm" },
  en: { h: "h", m: "min", cur: "sum" },
};

/** Короткий день недели по индексу getDay() (0=Вс). */
export const wdShort = (i: number) => WD[_lang][i] ?? "";
/** Месяц в родительном падеже по индексу getMonth(). */
export const monGen = (i: number) => MON_GEN[_lang][i] ?? "";
/** Месяц в именительном падеже по индексу getMonth(). */
export const monNom = (i: number) => MON_NOM[_lang][i] ?? "";

const p2 = (n: number) => String(n).padStart(2, "0");

/** «Пт, 12 июля» */
export function fmtDate(d: Date): string {
  return `${wdShort(d.getDay())}, ${d.getDate()} ${monGen(d.getMonth())}`;
}

/** «11:00» */
export function fmtTime(d: Date): string {
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

/** «180 000 сум» / «180 000 so'm» / «180 000 sum» */
export function fmtMoney(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + UNIT[_lang].cur;
}

/** Следующие N дней начиная с сегодня. */
export function nextDays(count: number, from: Date = new Date()): Date[] {
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

/** Минуты → «1 ч 30 мин» / «1 ч» / «45 мин» (с учётом языка). */
export function fmtDur(total: number): string {
  const u = UNIT[_lang];
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h} ${u.h} ${m} ${u.m}`;
  if (h) return `${h} ${u.h}`;
  return `${m} ${u.m}`;
}

/** Минуты от полуночи → «HH:MM». 1440 (полночь) → «00:00», т.е. 24 = 0. */
export function minToHHMM(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${p2(h)}:${p2(m)}`;
}

/** Дата + время «HH:MM» → новый Date. */
export function withTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}
