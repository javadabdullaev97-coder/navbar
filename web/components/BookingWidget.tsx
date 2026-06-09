"use client";

import { useEffect, useMemo, useState } from "react";
import type { Master, Service } from "@/lib/data";
import { t } from "@/lib/i18n";
import {
  formatPrice,
  getMarket,
  nowInTimeZone,
  validatePhone,
} from "@/lib/markets";

// JS getDay(): 0=вс..6=сб → наша схема: 0=пн..6=вс
function toOurDow(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
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
  const market = getMarket(master.marketId);
  const locale = master.locale;

  const [days, setDays] = useState<Date[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(market.phone.dialCode + " ");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const dowFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale]
  );
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }),
    [locale]
  );

  // Даты генерируем после маунта, чтобы серверный и клиентский
  // рендер не разошлись на границе суток
  useEffect(() => {
    const today = nowInTimeZone(master.timezone);
    today.setHours(0, 0, 0, 0);
    const list: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    setDays(list);
  }, [master.timezone]);

  const slots = useMemo(() => {
    if (!day || !service) return [];
    const sched = master.schedule.find((s) => s.dayOfWeek === toOurDow(day));
    if (!sched || sched.isDayOff) return [];

    const start = timeToMinutes(sched.startTime);
    const end = timeToMinutes(sched.endTime);
    // «Сегодня» и «сейчас» — в часовом поясе мастера, не клиента
    const now = nowInTimeZone(master.timezone);
    const isToday = day.toDateString() === now.toDateString();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const result: { min: number; busy: boolean }[] = [];
    for (let tMin = start; tMin + service.durationMin <= end; tMin += 30) {
      if (isToday && tMin <= nowMin) continue;
      result.push({ min: tMin, busy: isSlotBusy(day, tMin) });
    }
    return result;
  }, [day, service, master.schedule, master.timezone]);

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
    if (name.trim().length < 2) {
      setError(t(locale, "errName"));
      return;
    }
    if (!validatePhone(phone, market)) {
      setError(t(locale, "errPhone", { format: market.phone.placeholder }));
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
        <div className="success-title">{t(locale, "booked")}</div>
        <div className="success-details">
          {service.name}
          <br />
          {dateFormat.format(day)}, {minutesToTime(slot)}
          <br />
          {master.name} · {master.address}
        </div>
        <div className="success-hint">
          {t(locale, "reminderHint", { channel: market.reminderChannel })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">{t(locale, "services")}</div>
      {master.services.map((s) => (
        <button
          key={s.id}
          className={`service-item${service?.id === s.id ? " selected" : ""}`}
          onClick={() => selectService(s)}
        >
          <div>
            <div className="service-name">{s.name}</div>
            <div className="service-duration">
              {s.durationMin} {t(locale, "min")}
            </div>
          </div>
          <div className="service-price">
            {formatPrice(s.price, market, locale)}
          </div>
        </button>
      ))}

      {service && (
        <>
          <div className="section-title">{t(locale, "date")}</div>
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
                  <span className="dow">{dowFormat.format(d)}</span>
                  <span className="num">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {service && day && (
        <>
          <div className="section-title">{t(locale, "time")}</div>
          {slots.length === 0 ? (
            <div className="empty-note">{t(locale, "noSlots")}</div>
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
          <div className="section-title">{t(locale, "yourDetails")}</div>
          <div className="field">
            <label htmlFor="name">{t(locale, "name")}</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(locale, "namePlaceholder")}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">{t(locale, "phone")}</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={market.phone.placeholder}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-primary">
            {t(locale, "book")} · {minutesToTime(slot)},{" "}
            {dateFormat.format(day)}
          </button>
        </form>
      )}
    </div>
  );
}
