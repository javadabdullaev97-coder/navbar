import type { en } from "./en.js";

export const ru: Record<keyof typeof en, string> = {
  services: "Услуги",
  date: "Дата",
  time: "Время",
  book: "Записаться",
  booked: "Вы записаны!",
  bookingPending: "Ожидает подтверждения мастера",
  reminderHint: "Напомним за {hours} ч до визита",
  noSlots: "На этот день свободного времени нет",
  yourName: "Ваше имя",
  yourPhone: "Номер телефона",
  errName: "Введите имя",
  errPhone: "Введите номер в международном формате, например +998 90 123 45 67",
  minutesShort: "мин",
  morning: "Утро",
  day: "День",
  evening: "Вечер",
};
