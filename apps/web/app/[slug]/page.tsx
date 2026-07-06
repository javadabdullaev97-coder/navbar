import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseBrowser, supabaseConfigured } from "@/lib/supabase";
import type { PublicMaster } from "@/lib/types";
import Link from "next/link";
import BookingWidget from "./BookingWidget";
import Reviews from "./Reviews";
import FavoriteButton from "./FavoriteButton";

type Props = { params: Promise<{ slug: string }> };

async function fetchMaster(slug: string): Promise<PublicMaster | null> {
  if (!supabaseConfigured) return null;
  const sb = supabaseBrowser();
  const { data, error } = await sb.rpc("get_public_master", { p_slug: slug });
  if (error || !data) return null;
  return data as PublicMaster;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = await fetchMaster(slug);
  if (!m) return { title: "Navbar" };
  return {
    title: `${m.name} — запись онлайн | Navbar`,
    description: `${m.specialization ?? ""}, ${m.address ?? ""}`.trim(),
  };
}

export default async function MasterPage({ params }: Props) {
  const { slug } = await params;

  if (!supabaseConfigured) {
    return (
      <main className="narrow">
        <div className="logo">
          nav<span>bar</span>
        </div>
        <div className="card">
          <strong>Supabase не настроен</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            Добавь NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в
            apps/web/.env.local.
          </p>
        </div>
      </main>
    );
  }

  const master = await fetchMaster(slug);
  if (!master) notFound();

  const initial = master.name.charAt(0).toUpperCase();

  return (
    <main className="narrow">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <FavoriteButton slug={master.slug} />
      </div>

      <div className="master-header">
        <div className="avatar" style={{ color: master.cover_color ?? undefined }}>
          {initial}
        </div>
        <div>
          <div className="master-name">{master.name}</div>
          <div className="muted">{master.specialization}</div>
          {master.review_count > 0 && (
            <div className="stars" style={{ marginTop: 2 }}>
              ★ {master.rating.toFixed(1)}
              <span className="muted" style={{ fontSize: 13, marginLeft: 6 }}>
                · {master.review_count} отзыв(ов)
              </span>
            </div>
          )}
          {master.address && (
            <div className="muted" style={{ fontSize: 13 }}>
              {master.address}
            </div>
          )}
        </div>
      </div>
      {master.bio && (
        <p className="muted" style={{ marginTop: 12 }}>
          {master.bio}
        </p>
      )}

      {master.portfolio.length > 0 && (
        <>
          <div className="section">Портфолио</div>
          <div className="gallery">
            {master.portfolio.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p.url} alt={p.caption ?? "работа"} className="gallery-img" />
            ))}
          </div>
        </>
      )}

      <BookingWidget master={master} />
      <Reviews slug={master.slug} />
    </main>
  );
}
