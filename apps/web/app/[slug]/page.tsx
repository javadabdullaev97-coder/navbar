import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseBrowser, supabaseConfigured } from "@/lib/supabase";
import type { PublicMaster } from "@/lib/types";
import BookingWidget from "./BookingWidget";

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
      <main className="wrap">
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
    <main className="wrap">
      <div className="logo">
        nav<span>bar</span>
      </div>

      <div className="master-header">
        <div className="avatar" style={{ color: master.cover_color ?? undefined }}>
          {initial}
        </div>
        <div>
          <div className="master-name">{master.name}</div>
          <div className="muted">{master.specialization}</div>
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

      <BookingWidget master={master} />
    </main>
  );
}
