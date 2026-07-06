import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import type { CatalogMaster } from "@/lib/types";
import SearchBox from "./SearchBox";

export const dynamic = "force-dynamic";

function Stars({ value }: { value: number }) {
  return (
    <span className="stars">
      ★ {value > 0 ? value.toFixed(1) : "—"}
    </span>
  );
}

export default async function Home() {
  let masters: CatalogMaster[] = [];
  if (supabaseConfigured) {
    const sb = await supabaseServer();
    const { data } = await sb.rpc("list_public_masters", { p_category: null });
    masters = (data as CatalogMaster[]) ?? [];
  }

  // Группируем по категориям
  const byCategory = new Map<string, CatalogMaster[]>();
  for (const m of masters) {
    const cat = m.category ?? "Мастера";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(m);
  }

  return (
    <main className="wrap">
      <div className="logo">
        nav<span>bar</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link href="/me" className="linkbtn">Мои записи →</Link>
      </div>
      <h1>Найдите своего мастера</h1>
      <p className="muted">Барберы и мастера красоты — запись онлайн за 30 секунд.</p>
      <SearchBox />

      {masters.length === 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="muted">
            Пока нет мастеров в поиске. Откройте демо: <Link href="/asror" style={{ color: "var(--accent)" }}>navbar/asror</Link>
          </p>
        </div>
      )}

      {[...byCategory.entries()].map(([cat, list]) => (
        <div key={cat}>
          <div className="section">{cat}</div>
          {list.map((m) => (
            <Link key={m.slug} href={`/${m.slug}`} className="row" style={{ textDecoration: "none" }}>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <strong>{m.name}</strong>
                <span className="muted" style={{ fontSize: 13 }}>
                  {m.specialization}
                  {m.min_price ? ` · от ${m.min_price.toLocaleString("ru-RU")} сум` : ""}
                </span>
              </span>
              <Stars value={m.rating} />
            </Link>
          ))}
        </div>
      ))}

      <div className="section">Для мастеров</div>
      <Link href="/login" className="row" style={{ textDecoration: "none" }}>
        <strong>Кабинет мастера →</strong>
        <span className="muted" style={{ fontSize: 13 }}>вход и заявки</span>
      </Link>
    </main>
  );
}
