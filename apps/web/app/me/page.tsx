"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-client";
import { ensureAnonSession } from "@/lib/client-auth";

interface ClientBooking {
  id: string;
  master_slug: string;
  master_name: string;
  master_address: string | null;
  service_name: string | null;
  starts_at: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
}
interface Fav {
  slug: string;
  name: string;
  specialization: string | null;
}

const LABEL: Record<ClientBooking["status"], string> = {
  pending: "ожидает подтверждения",
  confirmed: "подтверждена",
  done: "выполнена",
  cancelled: "отменена",
};
function fmt(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function MePage() {
  const [sb] = useState(() => supabaseClient());
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [favs, setFavs] = useState<Fav[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    await ensureAnonSession();
    const [{ data: b }, { data: f }] = await Promise.all([
      sb.rpc("get_my_client_bookings"),
      sb.rpc("get_my_favorites"),
    ]);
    setBookings((b as ClientBooking[]) ?? []);
    setFavs((f as Fav[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancel(id: string) {
    await sb.rpc("cancel_my_booking", { p_booking: id });
    load();
  }

  const now = Date.now();
  const upcoming = bookings.filter((b) => new Date(b.starts_at).getTime() > now && b.status !== "cancelled");
  const past = bookings.filter((b) => !(new Date(b.starts_at).getTime() > now && b.status !== "cancelled"));

  return (
    <main className="narrow">
      <h1>Мои записи</h1>

      {loading && <p className="muted">Загрузка…</p>}

      {!loading && bookings.length === 0 && (
        <div className="card">
          <p className="muted">Записей пока нет. <Link href="/" style={{ color: "var(--accent)" }}>Найти мастера →</Link></p>
        </div>
      )}

      {upcoming.length > 0 && <div className="section">Предстоящие</div>}
      {upcoming.map((b) => (
        <div key={b.id} className="card" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{b.service_name}</strong>
            <span className={`st st-${b.status}`}>{LABEL[b.status]}</span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            {b.master_name} · {fmt(b.starts_at)}<br />{b.master_address}
          </p>
          <button className="linkbtn" onClick={() => cancel(b.id)} style={{ marginTop: 6 }}>Отменить</button>
        </div>
      ))}

      {past.length > 0 && <div className="section">История</div>}
      {past.map((b) => (
        <div key={b.id} className="card" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{b.service_name}</strong>
            <span className={`st st-${b.status}`}>{LABEL[b.status]}</span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            <Link href={`/${b.master_slug}`} style={{ color: "var(--accent)" }}>{b.master_name}</Link> · {fmt(b.starts_at)}
          </p>
        </div>
      ))}

      {favs.length > 0 && (
        <>
          <div className="section">Избранное</div>
          {favs.map((m) => (
            <Link key={m.slug} href={`/${m.slug}`} className="row" style={{ textDecoration: "none" }}>
              <span><strong>{m.name}</strong> <span className="muted" style={{ fontSize: 13 }}>{m.specialization}</span></span>
              <span style={{ color: "var(--accent)" }}>♥</span>
            </Link>
          ))}
        </>
      )}
    </main>
  );
}
