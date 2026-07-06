"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export interface Booking {
  id: string;
  client_name: string | null;
  client_phone: string | null;
  service_name: string | null;
  starts_at: string;
  ends_at: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
}

const STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "ожидает",
  confirmed: "подтверждена",
  done: "выполнена",
  cancelled: "отменена",
};
const STATUS_COLOR: Record<Booking["status"], string> = {
  pending: "#ffc850",
  confirmed: "#a8ff78",
  done: "#78b4ff",
  cancelled: "rgba(255,255,255,0.35)",
};

function fmt(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function DashboardClient({
  initial,
  email,
}: {
  initial: Booking[];
  email: string;
}) {
  const [bookings, setBookings] = useState<Booking[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: Booking["status"]) {
    setBusy(id);
    const sb = supabaseClient();
    const { error } = await sb.rpc("set_booking_status", {
      p_booking: id,
      p_status: status,
    });
    setBusy(null);
    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b)),
      );
    }
  }

  async function logout() {
    await supabaseClient().auth.signOut();
    window.location.href = "/login";
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const other = bookings.filter((b) => b.status !== "pending");

  return (
    <main className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="logo">
          nav<span>bar</span>
        </div>
        <button className="linkbtn" onClick={logout}>
          Выйти
        </button>
      </div>
      <h1>Заявки</h1>
      <p className="muted" style={{ marginTop: -4 }}>{email}</p>

      {bookings.length === 0 && (
        <div className="card">
          <p className="muted">Пока нет записей. Поделитесь ссылкой navbar/asror с клиентами.</p>
        </div>
      )}

      {pending.length > 0 && <div className="section">Новые заявки ({pending.length})</div>}
      {pending.map((b) => (
        <div key={b.id} className="card" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{b.client_name}</strong>
            <span style={{ color: STATUS_COLOR[b.status], fontSize: 13 }}>
              {STATUS_LABEL[b.status]}
            </span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            {b.service_name} · {fmt(b.starts_at)}
            <br />
            {b.client_phone}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn small" disabled={busy === b.id}
              onClick={() => setStatus(b.id, "confirmed")}>
              Подтвердить
            </button>
            <button className="linkbtn" disabled={busy === b.id}
              onClick={() => setStatus(b.id, "cancelled")}>
              Отклонить
            </button>
          </div>
        </div>
      ))}

      {other.length > 0 && <div className="section">Остальные</div>}
      {other.map((b) => (
        <div key={b.id} className="card" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{b.client_name}</strong>
            <span style={{ color: STATUS_COLOR[b.status], fontSize: 13 }}>
              {STATUS_LABEL[b.status]}
            </span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            {b.service_name} · {fmt(b.starts_at)}
          </p>
          {b.status === "confirmed" && (
            <button className="linkbtn" disabled={busy === b.id}
              style={{ marginTop: 8 }} onClick={() => setStatus(b.id, "done")}>
              Отметить выполненной
            </button>
          )}
        </div>
      ))}
    </main>
  );
}
