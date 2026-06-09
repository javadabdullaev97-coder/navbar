// Слой переводов интерфейса. Все строки UI — только отсюда,
// в компонентах хардкодить текст нельзя: это условие выхода
// на новые рынки без переписывания.

export type Locale = "ru" | "uz" | "en" | "es";

export const LOCALES: Locale[] = ["ru", "uz", "en", "es"];

type MsgKey =
  | "services"
  | "date"
  | "time"
  | "yourDetails"
  | "name"
  | "namePlaceholder"
  | "phone"
  | "book"
  | "booked"
  | "reminderHint"
  | "noSlots"
  | "min"
  | "errName"
  | "errPhone"
  | "notFound";

const dict: Record<Locale, Record<MsgKey, string>> = {
  ru: {
    services: "Услуги",
    date: "Дата",
    time: "Время",
    yourDetails: "Ваши данные",
    name: "Имя",
    namePlaceholder: "Как к вам обращаться",
    phone: "Номер телефона",
    book: "Записаться",
    booked: "Вы записаны!",
    reminderHint: "Мы напомним о записи в {channel} за 2 часа до визита",
    noSlots: "На этот день свободных слотов нет",
    min: "мин",
    errName: "Введите имя",
    errPhone: "Введите номер в формате {format}",
    notFound: "Мастер не найден",
  },
  uz: {
    services: "Xizmatlar",
    date: "Sana",
    time: "Vaqt",
    yourDetails: "Ma'lumotlaringiz",
    name: "Ismingiz",
    namePlaceholder: "Sizga qanday murojaat qilaylik",
    phone: "Telefon raqami",
    book: "Yozilish",
    booked: "Siz yozildingiz!",
    reminderHint: "Tashrifdan 2 soat oldin {channel} orqali eslatamiz",
    noSlots: "Bu kunga bo'sh vaqt yo'q",
    min: "daq",
    errName: "Ismingizni kiriting",
    errPhone: "Raqamni {format} formatida kiriting",
    notFound: "Usta topilmadi",
  },
  en: {
    services: "Services",
    date: "Date",
    time: "Time",
    yourDetails: "Your details",
    name: "Name",
    namePlaceholder: "What should we call you",
    phone: "Phone number",
    book: "Book",
    booked: "You're booked!",
    reminderHint: "We'll remind you via {channel} 2 hours before your visit",
    noSlots: "No available slots on this day",
    min: "min",
    errName: "Enter your name",
    errPhone: "Enter phone in format {format}",
    notFound: "Master not found",
  },
  es: {
    services: "Servicios",
    date: "Fecha",
    time: "Hora",
    yourDetails: "Tus datos",
    name: "Nombre",
    namePlaceholder: "¿Cómo te llamamos?",
    phone: "Número de teléfono",
    book: "Reservar",
    booked: "¡Reserva confirmada!",
    reminderHint: "Te recordaremos por {channel} 2 horas antes de tu visita",
    noSlots: "No hay horarios disponibles este día",
    min: "min",
    errName: "Ingresa tu nombre",
    errPhone: "Ingresa el número en formato {format}",
    notFound: "Profesional no encontrado",
  },
};

export function t(
  locale: Locale,
  key: MsgKey,
  vars?: Record<string, string>
): string {
  let s = dict[locale]?.[key] ?? dict.ru[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v);
    }
  }
  return s;
}
