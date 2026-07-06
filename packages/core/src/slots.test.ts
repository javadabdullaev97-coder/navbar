import { test } from "node:test";
import assert from "node:assert/strict";
import { freeSlots, hasConflict, minutesToTime, toOurDow } from "./slots.ts";
import type { Availability, Booking } from "./types.ts";

const av = (dow: number, start: number, end: number, off = false): Availability => ({
  id: `a${dow}`,
  org_id: "o",
  master_id: "m",
  day_of_week: dow,
  start_min: start,
  end_min: end,
  is_day_off: off,
});

const booking = (h1: number, h2: number): Booking => ({
  id: "b",
  org_id: "o",
  master_id: "m",
  client_id: null,
  service_id: null,
  starts_at: new Date(2030, 0, 1, h1, 0).toISOString(),
  ends_at: new Date(2030, 0, 1, h2, 0).toISOString(),
  status: "confirmed",
  source: "app",
  notes: null,
  created_at: "",
});

test("рабочий день 10:00–12:00, услуга 60 мин, шаг 30 → 3 слота", () => {
  const slots = freeSlots({
    availability: [av(0, 600, 720)],
    dayBookings: [],
    totalDuration: 60,
    dow: 0,
  });
  assert.deepEqual(slots.map(minutesToTime), ["10:00", "10:30", "11:00"]);
});

test("выходной → нет слотов", () => {
  const slots = freeSlots({
    availability: [av(6, 0, 0, true)],
    dayBookings: [],
    totalDuration: 60,
    dow: 6,
  });
  assert.equal(slots.length, 0);
});

test("бронь 10:00–11:00 убирает пересекающиеся слоты", () => {
  const slots = freeSlots({
    availability: [av(0, 600, 720)], // 10:00–12:00
    dayBookings: [booking(10, 11)], // занято 10:00–11:00
    totalDuration: 60,
    dow: 0,
  });
  assert.deepEqual(slots.map(minutesToTime), ["11:00"]);
});

test("суммарная длительность 90 мин не влезает между бронями по 60 мин", () => {
  // Рабочее 10:00–13:00, бронь 11:00–12:00 → свободны два куска по 60 мин.
  // Услуга 90 мин никуда не помещается целиком → 0 слотов.
  const slots = freeSlots({
    availability: [av(0, 600, 780)],
    dayBookings: [booking(11, 12)],
    totalDuration: 90,
    dow: 0,
  });
  assert.equal(slots.length, 0);

  // А услуга 60 мин влезает: 10:00 и 12:00.
  const sixty = freeSlots({
    availability: [av(0, 600, 780)],
    dayBookings: [booking(11, 12)],
    totalDuration: 60,
    dow: 0,
  });
  assert.deepEqual(sixty.map(minutesToTime), ["10:00", "12:00"]);
});

test("заблокированный интервал исключает слот", () => {
  const slots = freeSlots({
    availability: [av(0, 600, 720)],
    dayBookings: [],
    blocked: [{ startMin: 600, endMin: 660 }], // 10:00–11:00
    totalDuration: 60,
    dow: 0,
  });
  assert.deepEqual(slots.map(minutesToTime), ["11:00"]);
});

test("nowMin отсекает прошедшие слоты сегодня", () => {
  const slots = freeSlots({
    availability: [av(0, 600, 720)],
    dayBookings: [],
    totalDuration: 60,
    dow: 0,
    nowMin: 615, // 10:15 — слот 10:00 уже нельзя
  });
  assert.deepEqual(slots.map(minutesToTime), ["10:30", "11:00"]);
});

test("hasConflict ловит пересечение и пропускает соседний интервал", () => {
  const existing = [{ startMin: 600, endMin: 660 }];
  assert.equal(hasConflict(existing, 630, 60), true); // 10:30–11:30 пересекает
  assert.equal(hasConflict(existing, 660, 60), false); // 11:00–12:00 — впритык, ок
});

test("toOurDow: воскресенье JS(0) → 6, понедельник JS(1) → 0", () => {
  assert.equal(toOurDow(new Date(2024, 0, 7)), 6); // вс
  assert.equal(toOurDow(new Date(2024, 0, 8)), 0); // пн
});
