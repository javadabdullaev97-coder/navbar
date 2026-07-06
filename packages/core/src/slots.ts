// Доменная логика расчёта свободных слотов. Чистые функции без побочек —
// одинаково работают на web, mobile и в edge functions.
// Все расчёты идут в часовом поясе мастера (app-spec §1.6 / architecture §5).

import type { Availability, Booking } from "./types.js";

export interface Interval {
  startMin: number; // минуты от полуночи
  endMin: number;
}

// JS Date.getDay(): 0=вс..6=сб → наша схема: 0=пн..6=вс
export function toOurDow(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Свободные слоты (минуты от полуночи) под суммарную длительность услуг.
 * Слот предлагается, только если весь интервал [t, t+total) свободен:
 * укладывается в рабочие часы и не пересекается с существующими бронями
 * и заблокированными интервалами.
 *
 * @param availability   график мастера на все дни недели
 * @param dayBookings    брони мастера на этот день (кроме отменённых)
 * @param blocked        интервалы, заблокированные мастером вручную
 * @param totalDuration  суммарная длительность выбранных услуг, мин
 * @param dow            день недели по нашей схеме (0=пн)
 * @param nowMin         текущее время в минутах (если день сегодня), иначе null
 * @param step           шаг сетки, мин (по умолчанию 30)
 */
export function freeSlots(params: {
  availability: Availability[];
  dayBookings: Booking[];
  blocked?: Interval[];
  totalDuration: number;
  dow: number;
  nowMin?: number | null;
  step?: number;
}): number[] {
  const { availability, dayBookings, totalDuration, dow } = params;
  const blocked = params.blocked ?? [];
  const nowMin = params.nowMin ?? null;
  const step = params.step ?? 30;
  if (totalDuration <= 0) return [];

  const sched = availability.find((a) => a.day_of_week === dow);
  if (!sched || sched.is_day_off) return [];

  // Занятые интервалы дня из броней
  const busy: Interval[] = dayBookings.map((b) => {
    const s = new Date(b.starts_at);
    const e = new Date(b.ends_at);
    return {
      startMin: s.getHours() * 60 + s.getMinutes(),
      endMin: e.getHours() * 60 + e.getMinutes(),
    };
  });
  busy.push(...blocked);

  const overlaps = (aS: number, aE: number) =>
    busy.some((b) => aS < b.endMin && aE > b.startMin);

  const result: number[] = [];
  for (let t = sched.start_min; t + totalDuration <= sched.end_min; t += step) {
    if (nowMin !== null && t <= nowMin) continue;
    if (overlaps(t, t + totalDuration)) continue;
    result.push(t);
  }
  return result;
}

/** Пересекается ли новый интервал с любым из существующих (для блока двойной записи). */
export function hasConflict(
  existing: Interval[],
  startMin: number,
  durationMin: number,
): boolean {
  const endMin = startMin + durationMin;
  return existing.some((e) => startMin < e.endMin && endMin > e.startMin);
}
