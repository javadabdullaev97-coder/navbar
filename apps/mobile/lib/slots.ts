// Расчёт свободных слотов — порт логики @navbar/core (Пн=0…Вс=6, шаг 30 мин).

export type Avail = { day_of_week: number; start_min: number; end_min: number; is_day_off: boolean };
export type Busy = { start_min: number; end_min: number };

/** JS getDay (0=Вс) → наша неделя (Пн=0…Вс=6). */
export function toOurDow(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Свободные времена начала (в минутах от полуночи) для дня недели. */
export function freeSlots(params: {
  availability: Avail[];
  busy: Busy[];
  totalDuration: number;
  dow: number;
  nowMin?: number | null;
  step?: number;
}): number[] {
  const { availability, busy, totalDuration, dow } = params;
  const nowMin = params.nowMin ?? null;
  const step = params.step ?? 30;
  if (totalDuration <= 0) return [];

  const sched = availability.find((a) => a.day_of_week === dow);
  if (!sched || sched.is_day_off) return [];

  const overlaps = (aS: number, aE: number) =>
    busy.some((b) => aS < b.end_min && aE > b.start_min);

  const out: number[] = [];
  for (let t = sched.start_min; t + totalDuration <= sched.end_min; t += step) {
    if (nowMin !== null && t <= nowMin) continue;
    if (overlaps(t, t + totalDuration)) continue;
    out.push(t);
  }
  return out;
}
