"use client";

import { useEffect, useState } from "react";
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

export interface MyService {
  id: string;
  name: string;
  duration_min: number;
  price: number;
  is_active: boolean;
}
export interface MyAvailability {
  day_of_week: number;
  start_min: number;
  end_min: number;
  is_day_off: boolean;
}
export interface GalleryItem {
  id: string;
  url: string;
  caption: string | null;
}
export interface MyMaster {
  org_id: string;
  slug: string | null;
  specialization: string | null;
  category: string | null;
  bio: string | null;
  address: string | null;
  visible_in_search: boolean;
  services: MyService[];
  availability: MyAvailability[];
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
const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function fmt(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function toHHMM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

type Tab = "bookings" | "services" | "schedule" | "portfolio" | "profile";

export default function DashboardClient({
  initialBookings,
  initialMaster,
  email,
}: {
  initialBookings: Booking[];
  initialMaster: MyMaster;
  email: string;
}) {
  const sb = supabaseClient();
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState(initialBookings);
  const [master, setMaster] = useState(initialMaster);
  const [busy, setBusy] = useState(false);

  async function reloadMaster() {
    const { data } = await sb.rpc("get_my_master");
    if (data) setMaster(data as MyMaster);
  }

  async function setStatus(id: string, status: Booking["status"]) {
    setBusy(true);
    const { error } = await sb.rpc("set_booking_status", { p_booking: id, p_status: status });
    setBusy(false);
    if (!error) setBookings((p) => p.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  async function logout() {
    await sb.auth.signOut();
    window.location.href = "/login";
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const other = bookings.filter((b) => b.status !== "pending");

  return (
    <main className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="logo">nav<span>bar</span></div>
        <button className="linkbtn" onClick={logout}>Выйти</button>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>{email}</p>

      <div className="tabs">
        {([["bookings", "Заявки"], ["services", "Услуги"], ["schedule", "График"], ["portfolio", "Портфолио"], ["profile", "Профиль"]] as [Tab, string][]).map(
          ([k, label]) => (
            <button key={k} className={`tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>
              {label}
              {k === "bookings" && pending.length > 0 && <span className="badge">{pending.length}</span>}
            </button>
          ),
        )}
      </div>

      {tab === "bookings" && (
        <>
          {bookings.length === 0 && (
            <div className="card"><p className="muted">Пока нет записей. Поделитесь ссылкой navbar/{master?.slug ?? "asror"}.</p></div>
          )}
          {pending.length > 0 && <div className="section">Новые заявки ({pending.length})</div>}
          {pending.map((b) => (
            <div key={b.id} className="card" style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{b.client_name}</strong>
                <span style={{ color: STATUS_COLOR[b.status], fontSize: 13 }}>{STATUS_LABEL[b.status]}</span>
              </div>
              <p className="muted" style={{ marginTop: 4 }}>{b.service_name} · {fmt(b.starts_at)}<br />{b.client_phone}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn small" disabled={busy} onClick={() => setStatus(b.id, "confirmed")}>Подтвердить</button>
                <button className="linkbtn" disabled={busy} onClick={() => setStatus(b.id, "cancelled")}>Отклонить</button>
              </div>
            </div>
          ))}
          {other.length > 0 && <div className="section">Остальные</div>}
          {other.map((b) => (
            <div key={b.id} className="card" style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{b.client_name}</strong>
                <span style={{ color: STATUS_COLOR[b.status], fontSize: 13 }}>{STATUS_LABEL[b.status]}</span>
              </div>
              <p className="muted" style={{ marginTop: 4 }}>{b.service_name} · {fmt(b.starts_at)}</p>
              {b.status === "confirmed" && (
                <button className="linkbtn" disabled={busy} style={{ marginTop: 8 }} onClick={() => setStatus(b.id, "done")}>Отметить выполненной</button>
              )}
            </div>
          ))}
        </>
      )}

      {tab === "services" && <ServicesTab master={master} sb={sb} onChange={reloadMaster} />}
      {tab === "schedule" && <ScheduleTab master={master} sb={sb} onChange={reloadMaster} />}
      {tab === "portfolio" && <PortfolioTab master={master} sb={sb} onChange={reloadMaster} />}
      {tab === "profile" && <ProfileTab master={master} sb={sb} onChange={reloadMaster} />}
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;

function ServicesTab({ master, sb, onChange }: { master: MyMaster; sb: SB; onChange: () => void }) {
  const [editing, setEditing] = useState<MyService | "new" | null>(null);
  const [name, setName] = useState("");
  const [dur, setDur] = useState("60");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  function open(s: MyService | "new") {
    setEditing(s);
    if (s === "new") { setName(""); setDur("60"); setPrice(""); }
    else { setName(s.name); setDur(String(s.duration_min)); setPrice(String(s.price)); }
  }
  async function save() {
    setBusy(true);
    await sb.rpc("upsert_service", {
      p_id: editing === "new" ? null : (editing as MyService).id,
      p_name: name.trim(), p_duration: Number(dur), p_price: Number(price),
    });
    setBusy(false); setEditing(null); onChange();
  }
  async function remove(id: string) {
    await sb.rpc("delete_service", { p_id: id }); onChange();
  }

  return (
    <>
      <div className="section">Услуги</div>
      {master.services.map((s) => (
        <div key={s.id} className="row" onClick={() => open(s)}>
          <span>{s.name} · {s.duration_min} мин</span>
          <span className="price">{s.price.toLocaleString("ru-RU")} сум</span>
        </div>
      ))}
      <button className="btn" style={{ marginTop: 12 }} onClick={() => open("new")}>+ Новая услуга</button>

      {editing && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section" style={{ marginTop: 0 }}>{editing === "new" ? "Новая услуга" : "Услуга"}</div>
          <input className="input" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Длительность, мин" value={dur} onChange={(e) => setDur(e.target.value)} />
          <input className="input" placeholder="Цена, сум" value={price} onChange={(e) => setPrice(e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn small" disabled={busy} onClick={save}>Сохранить</button>
            {editing !== "new" && <button className="linkbtn" onClick={() => remove((editing as MyService).id)}>Удалить</button>}
            <button className="linkbtn" onClick={() => setEditing(null)}>Отмена</button>
          </div>
        </div>
      )}
    </>
  );
}

function ScheduleTab({ master, sb, onChange }: { master: MyMaster; sb: SB; onChange: () => void }) {
  const byDow = (d: number) => master.availability.find((a) => a.day_of_week === d);
  async function update(d: number, patch: Partial<MyAvailability>) {
    const cur = byDow(d) ?? { day_of_week: d, start_min: 540, end_min: 1080, is_day_off: false };
    const next = { ...cur, ...patch };
    await sb.rpc("set_availability", {
      p_dow: d, p_start: next.start_min, p_end: next.end_min, p_dayoff: next.is_day_off,
    });
    onChange();
  }
  return (
    <>
      <div className="section">График работы</div>
      {DOW.map((label, d) => {
        const a = byDow(d);
        const off = a?.is_day_off ?? false;
        return (
          <div key={d} className="card" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <strong style={{ width: 36 }}>{label}</strong>
            {off ? (
              <span className="muted" style={{ flex: 1 }}>Выходной</span>
            ) : (
              <span style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
                <input className="input" style={{ width: 90, margin: 0 }} type="time"
                  value={toHHMM(a?.start_min ?? 540)} onChange={(e) => update(d, { start_min: toMin(e.target.value) })} />
                <span className="muted">—</span>
                <input className="input" style={{ width: 90, margin: 0 }} type="time"
                  value={toHHMM(a?.end_min ?? 1080)} onChange={(e) => update(d, { end_min: toMin(e.target.value) })} />
              </span>
            )}
            <button className="linkbtn" onClick={() => update(d, { is_day_off: !off, start_min: a?.start_min ?? 540, end_min: a?.end_min ?? 1080 })}>
              {off ? "Рабочий" : "Выходной"}
            </button>
          </div>
        );
      })}
    </>
  );
}

function PortfolioTab({ master, sb, onChange }: { master: MyMaster; sb: SB; onChange: () => void }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await sb.rpc("get_my_gallery");
    setItems((data as GalleryItem[]) ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    const { data: userRes } = await sb.auth.getUser();
    const uid = userRes?.user?.id;
    const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const up = await sb.storage.from("portfolio").upload(path, file, { upsert: false });
    if (up.error) { setError("Ошибка загрузки: " + up.error.message); setBusy(false); return; }
    const { data: pub } = sb.storage.from("portfolio").getPublicUrl(path);
    await sb.rpc("add_gallery_item", { p_url: pub.publicUrl, p_caption: null });
    setBusy(false);
    load();
    onChange();
  }

  async function remove(id: string) {
    await sb.rpc("delete_gallery_item", { p_id: id });
    load();
    onChange();
  }

  return (
    <>
      <div className="section">Портфолио</div>
      <p className="muted" style={{ marginBottom: 12 }}>Фото ваших работ — их видят клиенты на публичной странице.</p>
      <label className="btn" style={{ display: "inline-block", width: "auto", cursor: "pointer" }}>
        {busy ? "Загружаем…" : "+ Добавить фото"}
        <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
      </label>
      {error && <div className="err">{error}</div>}
      <div className="gallery" style={{ marginTop: 16 }}>
        {items.map((g) => (
          <div key={g.id} style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt={g.caption ?? ""} className="gallery-img" />
            <button className="gallery-del" onClick={() => remove(g.id)}>✕</button>
          </div>
        ))}
      </div>
    </>
  );
}

const CATEGORIES = ["Барберы", "Парикмахеры", "Ногти", "Брови и ресницы", "Макияж", "Массаж"];

function ProfileTab({ master, sb, onChange }: { master: MyMaster; sb: SB; onChange: () => void }) {
  const [spec, setSpec] = useState(master.specialization ?? "");
  const [category, setCategory] = useState(master.category ?? "");
  const [bio, setBio] = useState(master.bio ?? "");
  const [address, setAddress] = useState(master.address ?? "");
  const [visible, setVisible] = useState(master.visible_in_search);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    await sb.rpc("update_my_profile", {
      p_spec: spec.trim(), p_bio: bio.trim(), p_address: address.trim(),
      p_visible: visible, p_slug: null, p_category: category || null,
    });
    setBusy(false); setSaved(true); onChange();
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <>
      <div className="section">Профиль и публичная страница</div>
      <p className="muted" style={{ marginBottom: 12 }}>Ваша ссылка: navbar.uz/{master.slug ?? "asror"}</p>
      <input className="input" placeholder="Специализация" value={spec} onChange={(e) => setSpec(e.target.value)} />
      <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Категория (для каталога)</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <textarea className="input" placeholder="О себе" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      <input className="input" placeholder="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} />
      <label style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0", color: "var(--text-secondary)" }}>
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        Показывать в поиске
      </label>
      <button className="btn" disabled={busy} onClick={save}>{saved ? "Сохранено ✓" : busy ? "Сохраняем…" : "Сохранить"}</button>
    </>
  );
}
