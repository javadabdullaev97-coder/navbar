// Хуки данных с откатом на демо и функцией reload (для pull-to-refresh).
import { useCallback, useEffect, useState } from "react";
import {
  CatalogMaster,
  getMaster,
  getReviews,
  listMasters,
  PublicMaster,
  Review,
  searchMasters,
} from "./api";
import { supabaseConfigured } from "./supabase";

export { supabaseConfigured };

type Resource<T> = { data: T | null; loading: boolean; reload: () => Promise<void> };

function useResource<T>(enabled: boolean, fetcher: () => Promise<T>, deps: unknown[]): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try { setData(await fetcher()); }
    catch { setData(null); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { reload(); }, [reload]);
  return { data, loading, reload };
}

export function useCatalog(category?: string) {
  return useResource<CatalogMaster[]>(supabaseConfigured, () => listMasters(category), [category]);
}

export function useSearchMasters(q: string) {
  return useResource<CatalogMaster[]>(supabaseConfigured, () => (q.trim() ? searchMasters(q.trim()) : listMasters()), [q]);
}

export function useReviews(slug?: string) {
  return useResource<Review[]>(Boolean(supabaseConfigured && slug), () => getReviews(slug as string), [slug]);
}

export function useMaster(slug?: string) {
  const r = useResource<PublicMaster | null>(Boolean(supabaseConfigured && slug), () => getMaster(slug as string), [slug]);
  return { master: r.data, loading: r.loading, reload: r.reload };
}

/** Инициал из имени для аватар-плейсхолдера. */
export function initialOf(name: string): string {
  return (name.trim()[0] ?? "•").toUpperCase();
}
