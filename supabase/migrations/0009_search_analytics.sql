-- 0009_search_analytics.sql — поиск мастеров + аналитика мастера.

-- Поиск публичных мастеров по имени/специализации/slug
create or replace function search_public_masters(p_q text)
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(m order by (m->>'rating')::numeric desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'slug', mp.slug, 'name', u.full_name,
      'specialization', mp.specialization, 'category', mp.category,
      'address', mp.address,
      'rating', (_master_rating(mp.user_id, mp.org_id)->>'rating')::numeric,
      'review_count', (_master_rating(mp.user_id, mp.org_id)->>'count')::int,
      'min_price', (select min(s.price) from service s
                    where s.master_id = mp.user_id and s.org_id = mp.org_id and s.is_active)
    ) as m
    from master_profile mp
    join app_user u on u.id = mp.user_id
    where mp.visible_in_search = true
      and (
        u.full_name ilike '%'||p_q||'%'
        or mp.specialization ilike '%'||p_q||'%'
        or mp.slug ilike '%'||p_q||'%'
      )
  ) t;
$$;
grant execute on function search_public_masters(text) to anon, authenticated;

-- Аналитика мастера за период (по завершённым броням).
-- Возвращает total, выручку по дням и разбивку по услугам.
create or replace function get_my_analytics(p_days int)
returns jsonb language sql stable security definer
set search_path = public as $$
  with done as (
    select b.starts_at, coalesce(s.price, 0) as price, coalesce(s.name, '—') as sname
    from booking b
    left join service s on s.id = b.service_id
    where b.master_id = auth.uid()
      and b.status = 'done'
      and b.starts_at >= now() - make_interval(days => p_days)
  )
  select jsonb_build_object(
    'total', coalesce((select sum(price) from done), 0),
    'count', (select count(*) from done),
    'by_day', coalesce((
      select jsonb_agg(jsonb_build_object('date', d, 'amount', amt) order by d)
      from (
        select (starts_at at time zone 'UTC')::date as d, sum(price) as amt
        from done group by 1
      ) x
    ), '[]'::jsonb),
    'by_service', coalesce((
      select jsonb_agg(jsonb_build_object('name', sname, 'count', c, 'total', t) order by t desc)
      from (
        select sname, count(*) c, sum(price) t from done group by sname
      ) y
    ), '[]'::jsonb)
  );
$$;
grant execute on function get_my_analytics(int) to authenticated;
