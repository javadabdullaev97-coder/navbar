"use client";

import { useEffect, useMemo, useState } from "react";
import {
  freeSlots,
  minutesToTime,
  toOurDow,
  validatePhone,
  MARKET_UZ,
} from "@/lib/booking";
import { supabaseClient } from "@/lib/supabase-client";
import { ensureAnonSession } from "@/lib/client-auth";
import type { BusyInterval, PublicMaster } from "@/lib/types";

const DOW = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

type Service = PublicMaster["services"][number];

export default function BookingWidget({ master }: { master: PublicMaster }) {
  const sb = useMemo(() => supabaseClient(), []);
  const [days, setDays] = useState<Date[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [day, setDay] = useState<Date | null>(null);
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureAnonSession();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDays(Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    }));
  }, []);

  const chosen: Service[] = master.services.filter((s) => selected.has(s.id));
  const totalMin = chosen.reduce((a, s) => a + s.duration_min, 0);
  const totalPrice = chosen.reduce((a, s) => a + s.price, 0);

  // Занятость дня подтягиваем с сервера (только времена, без ПДн)
  useEffect(() => {
    if (!day) return;
    const p = day.toISOString().slice(0, 10);
    sb.rpc("get_day_busy", { p_slug: master.slug, p_day: p }).then(({ data }) => {
      setBusy((data as BusyInterval[]) ?? []);
    });
  }, [day, master.slug, sb]);

  const slots = useMemo(() => {
    if (!day || totalMin <= 0) return [];
    const now = new Date();
    const isToday = day.toDateString() === now.toDateString();
    return freeSlots({
      availability: master.availability,
      busy,
      totalDuration: totalMin,
      dow: toOurDow(day),
      nowMin: isToday ? now.getHours() * 60 + now.getMinutes() : null,
    });
  }, [day, totalMin, busy, master.availability]);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    setSlot(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Введите имя");
    if (!validatePhone(phone, MARKET_UZ)) return setError("Введите телефон в формате +998 90 123 45 67");
    if (!day || slot === null) return;
    setError("");
    setSaving(true);
    await ensureAnonSession();

    const startsAt = new Date(day);
    startsAt.setHours(Math.floor(slot / 60), slot % 60, 0, 0);

    const { error: rpcErr } = await sb.rpc("create_public_booking", {
      p_slug: master.slug,
      p_service_ids: chosen.map((s) => s.id),
      p_starts_at: startsAt.toISOString(),
      p_client_name: name.trim(),
      p_client_phone: phone.replace(/\s/g, ""),
    });
    setSaving(false);
    if (rpcErr) { setError("Не удалось записаться: " + rpcErr.message); return; }
    setDone(true);
  }

  if (done && day && slot !== null) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 40 }}>⏳</div>
        <h2 style={{ marginTop: 12 }}>Заявка отправлена!</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          {chosen.map((s) => s.name).join(" + ")}<br />
          {day.getDate()} {MONTHS[day.getMonth()]}, {minutesToTime(slot)}<br />
          {master.name}
        </p>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Мастер подтвердит запись. Напомним за 2 часа до визита.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="section">Услуги</div>
      {master.services.map((s) => {
        const on = selected.has(s.id);
        return (
          <button key={s.id} className={`row${on ? " on" : ""}`} onClick={() => toggle(s.id)}>
            <span>{on ? "☑" : "☐"} {s.name} · {s.duration_min} мин</span>
            <span className="price">{s.price.toLocaleString("ru-RU")} сум</span>
          </button>
        );
      })}

      {totalMin > 0 && (
        <>
          <div className="section">Дата</div>
          <div className="days">
            {days.map((d) => {
              const sched = master.availability.find((a) => a.day_of_week === toOurDow(d));
              const off = !sched || sched.is_day_off;
              const sel = day?.getTime() === d.getTime();
              return (
                <button key={d.getTime()} className={`day${sel ? " on" : ""}`}
                  disabled={off} onClick={() => { setDay(d); setSlot(null); }}>
                  <span className="dow">{DOW[toOurDow(d)]}</span>
                  <span className="num">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {day && totalMin > 0 && (
        <>
          <div className="section">Время</div>
          {slots.length === 0 ? (
            <p className="muted">На этот день свободного времени нет</p>
          ) : (
            <div className="slots">
              {slots.map((t) => (
                <button key={t} className={`slot${slot === t ? " on" : ""}`}
                  onClick={() => setSlot(t)}>
                  {minutesToTime(t)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {day && slot !== null && (
        <form onSubmit={submit}>
          <div className="section">Ваши данные</div>
          <input className="input" placeholder="Имя" value={name}
            onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="+998 90 123 45 67" value={phone}
            onChange={(e) => setPhone(e.target.value)} />
          {error && <div className="err">{error}</div>}
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Отправляем…" : `Записаться · ${minutesToTime(slot)} · ${totalPrice.toLocaleString("ru-RU")} сум`}
          </button>
        </form>
      )}
    </div>
  );
}
