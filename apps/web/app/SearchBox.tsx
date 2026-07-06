"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-client";
import type { CatalogMaster } from "@/lib/types";

export default function SearchBox() {
  const [sb] = useState(() => supabaseClient());
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CatalogMaster[] | null>(null);

  async function onChange(v: string) {
    setQ(v);
    if (v.trim().length < 2) {
      setResults(null);
      return;
    }
    const { data } = await sb.rpc("search_public_masters", { p_q: v.trim() });
    setResults((data as CatalogMaster[]) ?? []);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <input
        className="input"
        placeholder="Поиск: имя мастера или услуга"
        value={q}
        onChange={(e) => onChange(e.target.value)}
      />
      {results !== null && (
        <div style={{ marginBottom: 8 }}>
          {results.length === 0 ? (
            <p className="muted">Ничего не найдено</p>
          ) : (
            results.map((m) => (
              <Link key={m.slug} href={`/${m.slug}`} className="row" style={{ textDecoration: "none" }}>
                <span>
                  <strong>{m.name}</strong>{" "}
                  <span className="muted" style={{ fontSize: 13 }}>{m.specialization}</span>
                </span>
                <span className="stars">★ {m.rating > 0 ? m.rating.toFixed(1) : "—"}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
