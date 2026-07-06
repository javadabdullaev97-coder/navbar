"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import type { Review } from "@/lib/types";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export default function Reviews({ slug }: { slug: string }) {
  const sb = useMemo(() => supabaseClient(), []);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await sb.rpc("get_master_reviews", { p_slug: slug });
    setReviews((data as Review[]) ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function submit() {
    if (author.trim().length < 1) return;
    setBusy(true);
    await sb.rpc("add_review", {
      p_slug: slug,
      p_stars: stars,
      p_text: text.trim(),
      p_author: author.trim(),
    });
    setBusy(false);
    setOpen(false);
    setText("");
    setAuthor("");
    setStars(5);
    load();
  }

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="section" style={{ margin: 0 }}>Отзывы ({reviews.length})</div>
        <button className="linkbtn" onClick={() => setOpen((v) => !v)}>
          {open ? "Отмена" : "Оставить отзыв"}
        </button>
      </div>

      {open && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 26, color: n <= stars ? "#D68A2E" : "var(--border)" }}>
                ★
              </button>
            ))}
          </div>
          <input className="input" placeholder="Ваше имя" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <textarea className="input" placeholder="Как всё прошло?" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn" disabled={busy} onClick={submit}>
            {busy ? "Отправляем…" : "Отправить отзыв"}
          </button>
        </div>
      )}

      {reviews.map((r, i) => (
        <div key={i} className="card" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{r.author_name}</strong>
            <span>
              <span style={{ color: "#D68A2E" }}>{"★".repeat(r.stars)}</span>
              <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>{fmtDate(r.created_at)}</span>
            </span>
          </div>
          {r.text && <p className="muted" style={{ marginTop: 4 }}>{r.text}</p>}
        </div>
      ))}
    </div>
  );
}
