// Хуки данных с откатом на демо: пока Supabase не подключён (нет env) или
// пришла ошибка — возвращаем null, и экран показывает демо-данные.
import { useEffect, useState } from "react";
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

export function useCatalog(category?: string): CatalogMaster[] | null {
  const [data, setData] = useState<CatalogMaster[] | null>(null);
  useEffect(() => {
    if (!supabaseConfigured) return;
    let alive = true;
    listMasters(category)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData([]));
    return () => { alive = false; };
  }, [category]);
  return data;
}

export function useSearchMasters(q: string): CatalogMaster[] | null {
  const [data, setData] = useState<CatalogMaster[] | null>(null);
  useEffect(() => {
    if (!supabaseConfigured) return;
    let alive = true;
    const run = q.trim() ? searchMasters(q.trim()) : listMasters();
    run.then((d) => alive && setData(d)).catch(() => alive && setData([]));
    return () => { alive = false; };
  }, [q]);
  return data;
}

export function useMaster(slug?: string): { master: PublicMaster | null; loading: boolean } {
  const [master, setMaster] = useState<PublicMaster | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!supabaseConfigured || !slug) return;
    let alive = true;
    setLoading(true);
    getMaster(slug)
      .then((m) => alive && setMaster(m))
      .catch(() => alive && setMaster(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [slug]);
  return { master, loading };
}

export function useReviews(slug?: string): Review[] | null {
  const [data, setData] = useState<Review[] | null>(null);
  useEffect(() => {
    if (!supabaseConfigured || !slug) return;
    let alive = true;
    getReviews(slug).then((d) => alive && setData(d)).catch(() => alive && setData([]));
    return () => { alive = false; };
  }, [slug]);
  return data;
}

/** Инициал из имени для аватар-плейсхолдера. */
export function initialOf(name: string): string {
  return (name.trim()[0] ?? "•").toUpperCase();
}
