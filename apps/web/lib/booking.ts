// Тонкая обёртка над @navbar/core для web: адаптирует занятые интервалы
// (из RPC get_day_busy) к доменной функции слотов и даёт валидацию телефона.
import {
  freeSlots as coreFreeSlots,
  minutesToTime,
  toOurDow,
} from "@navbar/core";
import type { BusyInterval } from "./types";

export { minutesToTime, toOurDow };

// core.freeSlots использует только эти поля графика (без id/org_id/master_id)
type AvailabilitySlim = {
  day_of_week: number;
  start_min: number;
  end_min: number;
  is_day_off: boolean;
};

export const MARKET_UZ = { dialDigits: "998", totalDigits: 12 };

export function validatePhone(raw: string, market = MARKET_UZ): boolean {
  const digits = raw.replace(/\D/g, "");
  return (
    digits.startsWith(market.dialDigits) && digits.length === market.totalDigits
  );
}

export function freeSlots(params: {
  availability: AvailabilitySlim[];
  busy: BusyInterval[];
  totalDuration: number;
  dow: number;
  nowMin: number | null;
}): number[] {
  return coreFreeSlots({
    // core использует только структурную часть — id/org_id/master_id не нужны
    availability: params.availability as never,
    dayBookings: [],
    blocked: params.busy.map((b) => ({
      startMin: b.start_min,
      endMin: b.end_min,
    })),
    totalDuration: params.totalDuration,
    dow: params.dow,
    nowMin: params.nowMin,
  });
}
