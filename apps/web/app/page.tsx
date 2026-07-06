import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import { categoryColors } from "@navbar/core";
import type { CatalogMaster } from "@/lib/types";
import SearchBox from "./SearchBox";

export const dynamic = "force-dynamic";

function MasterCard({ m }: { m: CatalogMaster }) {
  const accent = categoryColors[m.category ?? ""] ?? "var(--accent)";
  return (
    <Link href={`/${m.slug}`} className="master-card">
      <div className="mc-top">
        <div className="mc-av" style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}>
          {m.name.charAt(0)}
        </div>
        <div>
          <div className="mc-name">{m.name}</div>
          <div className="muted" style={{ fontSize: 13 }}>{m.specialization}</div>
        </div>
      </div>
      <div className="mc-foot">
        <span className="muted" style={{ fontSize: 13 }}>
          {m.min_price ? `от ${m.min_price.toLocaleString("ru-RU")} сум` : " "}
        </span>
        <span className="stars">★ {m.rating > 0 ? m.rating.toFixed(1) : "—"}</span>
      </div>
    </Link>
  );
}

export default async function Home() {
  let masters: CatalogMaster[] = [];
  if (supabaseConfigured) {
    const sb = await supabaseServer();
    const { data } = await sb.rpc("list_public_masters", { p_category: null });
    masters = (data as CatalogMaster[]) ?? [];
  }

  const byCategory = new Map<string, CatalogMaster[]>();
  for (const m of masters) {
    const cat = m.category ?? "Мастера";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(m);
  }

  return (
    <main className="wrap">
      <section className="hero">
        <h1>Найдите своего мастера</h1>
        <p>Барберы и мастера красоты Ташкента. Запись онлайн за 30 секунд — без звонков.</p>
      </section>
      <SearchBox />

      {masters.length === 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <p className="muted">
            Пока нет мастеров в поиске. Демо: <Link href="/asror" style={{ color: "var(--accent)" }}>navbar / asror</Link>
          </p>
        </div>
      )}

      {[...byCategory.entries()].map(([cat, list]) => (
        <section key={cat}>
          <div className="section">{cat}</div>
          <div className="grid">
            {list.map((m) => <MasterCard key={m.slug} m={m} />)}
          </div>
        </section>
      ))}

      <footer className="site-footer">Navbar · онлайн-запись к мастерам · Узбекистан</footer>
    </main>
  );
}
