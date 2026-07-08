// Форматирование дат/денег на русском (без зависимости от Intl — Hermes его урезает).

export const WD_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
export const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
export const MONTHS_NOM = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const p2 = (n: number) => String(n).padStart(2, "0");

/** «Пт, 12 июля» */
export function fmtDate(d: Date): string {
  return `${WD_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

/** «11:00» */
export function fmtTime(d: Date): string {
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

/** «180 000 сум» */
export function fmtMoney(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " сум";
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

/** Дата + время «HH:MM» → новый Date. */
export function withTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}
