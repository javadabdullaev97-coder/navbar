-- 0007_portfolio.sql — портфолио мастера (галерея работ) + Storage-бакет для фото.
-- Метаданные галереи — в таблице gallery (уже есть, §5). Файлы — в Storage.

-- ── Storage-бакет 'portfolio' (публичное чтение). Только в реальном Supabase:
-- в локальном тесте схемы storage нет, поэтому под guard. ──
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('portfolio', 'portfolio', true)
    on conflict (id) do nothing;

    -- Публичное чтение файлов бакета
    drop policy if exists portfolio_read on storage.objects;
    create policy portfolio_read on storage.objects
      for select to anon, authenticated
      using (bucket_id = 'portfolio');

    -- Загрузка/удаление — авторизованным (мастер грузит в папку своего uid)
    drop policy if exists portfolio_write on storage.objects;
    create policy portfolio_write on storage.objects
      for insert to authenticated
      with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

    drop policy if exists portfolio_delete on storage.objects;
    create policy portfolio_delete on storage.objects
      for delete to authenticated
      using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;

-- ── RPC галереи ──
create or replace function get_my_gallery()
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', g.id, 'url', g.url, 'caption', g.caption
  ) order by g.sort_order, g.created_at desc), '[]'::jsonb)
  from gallery g where g.master_id = auth.uid();
$$;

create or replace function add_gallery_item(p_url text, p_caption text)
returns uuid language plpgsql security definer
set search_path = public as $$
declare v_org uuid := _my_org(); v_id uuid;
begin
  if v_org is null then raise exception 'no master profile'; end if;
  if length(coalesce(trim(p_url),'')) = 0 then raise exception 'no url'; end if;
  insert into gallery(org_id, master_id, url, caption)
  values (v_org, auth.uid(), trim(p_url), nullif(trim(p_caption),''))
  returning id into v_id;
  return v_id;
end $$;

create or replace function delete_gallery_item(p_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
begin
  delete from gallery where id = p_id and master_id = auth.uid();
  if not found then raise exception 'gallery item not found'; end if;
end $$;

-- Портфолио в публичном профиле
create or replace function get_public_master(p_slug text)
returns jsonb language sql stable security definer
set search_path = public as $$
  select case when mp.id is null then null else jsonb_build_object(
    'slug', mp.slug,
    'name', u.full_name,
    'specialization', mp.specialization,
    'category', mp.category,
    'bio', mp.bio,
    'address', mp.address,
    'cover_color', mp.cover_color,
    'org_id', mp.org_id,
    'master_id', mp.user_id,
    'rating', (_master_rating(mp.user_id, mp.org_id)->>'rating')::numeric,
    'review_count', (_master_rating(mp.user_id, mp.org_id)->>'count')::int,
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name,
        'duration_min', s.duration_min, 'price', s.price
      ) order by s.sort_order, s.name)
      from service s
      where s.master_id = mp.user_id and s.org_id = mp.org_id and s.is_active
    ), '[]'::jsonb),
    'availability', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day_of_week', a.day_of_week,
        'start_min', a.start_min, 'end_min', a.end_min,
        'is_day_off', a.is_day_off
      ) order by a.day_of_week)
      from availability a
      where a.master_id = mp.user_id and a.org_id = mp.org_id
    ), '[]'::jsonb),
    'portfolio', coalesce((
      select jsonb_agg(jsonb_build_object('url', g.url, 'caption', g.caption)
        order by g.sort_order, g.created_at desc)
      from gallery g
      where g.master_id = mp.user_id and g.org_id = mp.org_id
    ), '[]'::jsonb)
  ) end
  from master_profile mp
  join app_user u on u.id = mp.user_id
  where mp.slug = p_slug;
$$;

grant execute on function get_my_gallery()                to authenticated;
grant execute on function add_gallery_item(text, text)    to authenticated;
grant execute on function delete_gallery_item(uuid)       to authenticated;
