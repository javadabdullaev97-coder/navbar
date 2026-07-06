"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { ensureAnonSession } from "@/lib/client-auth";

export default function FavoriteButton({ slug }: { slug: string }) {
  const [sb] = useState(() => supabaseClient());
  const [fav, setFav] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureAnonSession();
      const { data } = await sb.rpc("get_my_favorites");
      const list = (data as { slug: string }[]) ?? [];
      setFav(list.some((m) => m.slug === slug));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function toggle() {
    await ensureAnonSession();
    const { data } = await sb.rpc("toggle_favorite", { p_slug: slug });
    setFav(Boolean(data));
  }

  return (
    <button className="favbtn" onClick={toggle} aria-label="Избранное">
      <span style={{ color: fav ? "#D68A2E" : "var(--muted)" }}>{fav ? "♥" : "♡"}</span>
    </button>
  );
}
