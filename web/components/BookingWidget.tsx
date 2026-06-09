"use client";

import { useEffect, useMemo, useState } from "react";
import type { Master, Service } from "@/lib/data";
import { formatPrice } from "@/lib/data";

const DOW_LABELS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MONTH_LABELS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

// JS getDay(): 0=вс..6=сб → наша схема: 0=пн..6=вс
function toOurDow(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Детерминированная имитация занятых слотов, пока нет реальной БД
function isSlotBusy(date: Date, slotMin: number): boolean {
  const seed = date.getDate() * 31 + slotMin;
  return seed % 7 === 0 || seed % 11 === 0;
}

export default function BookingWidget({ master }: { master: Master }) {
  const [days, setDays] = useState<Date[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Даты генерируем после маунта, чтобы серверный и клиентский
  // рендер не разошлись на границе суток
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const list: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    setDays(list);
  }, []);

  const slots = useMemo(() => {
    if (!day || !service) return [];
    const sched = master.schedule.find((s) => s.dayOfWeek === toOurDow(day));
    if (!sched || sched.isDayOff) return [];

    const start = timeToMinutes(sched.startTime);
    const end = timeToMinutes(sched.endTime);
    const now = new Date();
    const isToday = day.toDateString() === now.toDateString();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const result: { min: number; busy: boolean }[] = [];
    for (let t = start; t + service.durationMin <= end; t += 30) {
      if (isToday && t <= nowMin) continue;
      result.push({ min: t, busy: isSlotBusy(day, t) });
    }
    return result;
  }, [day, service, master.schedule]);

  function selectService(s: Service) {
    setService(s);
    setSlot(null);
  }

  function selectDay(d: Date) {
    setDay(d);
    setSlot(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) {
      setError("Введите имя");
      return;
    }
    if (!digits.startsWith("998") || digits.length !== 12) {
      setError("Введите номер в формате +998 XX XXX XX XX");
      return;
    }
    setError("");
    // TODO: запись в Supabase (appointments) + уведомление мастеру
    setDone(true);
  }

  if (done && service && day && slot !== null) {
    return (
      <div className="success-box card">
        <div className="success-icon">✓</div>
        <div className="success-title">Вы записаны!</div>
        <div className="success-details">
          {service.name}
          <br />
          {day.getDate()} {MONTH_LABELS[day.getMonth()]},{" "}
          {minutesToTime(slot)}
          <br />
          {master.name} · {master.address}
        </div>
        <div className="success-hint">
          Мы напомним о записи в Telegram за 2 часа до визита
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">Услуги</div>
      {master.services.map((s) => (
        <button
          key={s.id}
          className={`service-item${service?.id === s.id ? " selected" : ""}`}
          onClick={() => selectService(s)}
        >
          <div>
            <div className="service-name">{s.name}</div>
            <div className="service-duration">{s.durationMin} мин</div>
          </div>
          <div className="service-price">{formatPrice(s.price)}</div>
        </button>
      ))}

      {service && (
        <>
          <div className="section-title">Дата</div>
          <div className="days-scroll">
            {days.map((d) => {
              const sched = master.schedule.find(
                (s) => s.dayOfWeek === toOurDow(d)
              );
              const off = !sched || sched.isDayOff;
              const isSel = day?.getTime() === d.getTime();
              return (
                <button
                  key={d.getTime()}
                  className={`day-chip${isSel ? " selected" : ""}`}
                  disabled={off}
                  onClick={() => selectDay(d)}
                >
                  <span className="dow">{DOW_LABELS[toOurDow(d)]}</span>
                  <span className="num">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {service && day && (
        <>
          <div className="section-title">Время</div>
          {slots.length === 0 ? (
            <div className="empty-note">
              На этот день свободных слотов нет
            </div>
          ) : (
            <div className="slots-grid">
              {slots.map(({ min, busy }) => (
                <button
                  key={min}
                  className={`slot${slot === min ? " selected" : ""}`}
                  disabled={busy}
                  onClick={() => setSlot(min)}
                >
                  {minutesToTime(min)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {service && day && slot !== null && (
        <form onSubmit={submit}>
          <div className="section-title">Ваши данные</div>
          <div className="field">
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться"
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Номер телефона</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-primary">
            Записаться · {minutesToTime(slot)},{" "}
            {day.getDate()} {MONTH_LABELS[day.getMonth()]}
          </button>
        </form>
      )}
    </div>
  );
}
