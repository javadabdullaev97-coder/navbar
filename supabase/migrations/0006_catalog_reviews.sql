-- 0006_catalog_reviews.sql — каталог мастеров + отзывы и рейтинг.
-- Рейтинг взвешенный: свежие отзывы (до года) весят 1.0, старше — 0.4.
-- Отзывы не удаляются (капитал мастера), сортировка «сначала новые».

-- Категория мастера для каталога
alter table master_profile add column if not exists category text;

-- Отзывы
create table if not exists review (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organization(id) on delete cascade,
  master_id   uuid not null references app_user(id) on delete cascade,
  booking_id  uuid references booking(id) on delete set null,
  author_name text not null,
  stars       int not null check (stars between 1 and 5),
  text        text,
  created_at  timestamptz not null default now()
);
create index if not exists review_master_idx on review(master_id);

alter table review enable row level security;
alter table review force row level security;

-- Отзывы публичны на чтение (витрина мастера); запись — только через RPC.
drop policy if exists review_read_public on review;
create policy review_read_public on review
  for select to anon, authenticated using (true);
-- Мастер видит свои (и так покрыто read_public, но оставим явно для будущего)

grant select on review to anon, authenticated;

-- Взвешенный рейтинг мастера
create or replace function _master_rating(p_master uuid, p_org uuid)
returns jsonb language sql stable security definer
set search_path = public as $$
  select jsonb_build_object(
    'rating', coalesce(round(
      sum(stars * (case when now() - created_at > interval '365 days' then 0.4 else 1.0 end))
      / nullif(sum(case when now() - created_at > interval '365 days' then 0.4 else 1.0 end), 0)
    , 2), 0),
    'count', count(*)
  )
  from review where master_id = p_master and org_id = p_org;
$$;

-- Каталог публичных мастеров (visible_in_search), с рейтингом и мин. ценой
create or replace function list_public_masters(p_category text default null)
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(m order by (m->>'rating')::numeric desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'slug', mp.slug,
      'name', u.full_name,
      'specialization', mp.specialization,
      'category', mp.category,
      'address', mp.address,
      'rating', (_master_rating(mp.user_id, mp.org_id)->>'rating')::numeric,
      'review_count', (_master_rating(mp.user_id, mp.org_id)->>'count')::int,
      'min_price', (select min(s.price) from service s
                    where s.master_id = mp.user_id and s.org_id = mp.org_id and s.is_active)
    ) as m
    from master_profile mp
    join app_user u on u.id = mp.user_id
    where mp.visible_in_search = true
      and (p_category is null or mp.category = p_category)
  ) t;
$$;

-- Отзывы мастера (сначала новые)
create or replace function get_master_reviews(p_slug text)
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'author_name', r.author_name, 'stars', r.stars,
    'text', r.text, 'created_at', r.created_at
  ) order by r.created_at desc), '[]'::jsonb)
  from review r
  join master_profile mp on mp.user_id = r.master_id and mp.org_id = r.org_id
  where mp.slug = p_slug;
$$;

-- Оставить отзыв (публично, по slug)
create or replace function add_review(
  p_slug text, p_stars int, p_text text, p_author text
) returns void language plpgsql security definer
set search_path = public as $$
declare v_master uuid; v_org uuid;
begin
  select user_id, org_id into v_master, v_org from master_profile where slug = p_slug;
  if v_master is null then raise exception 'master not found'; end if;
  if p_stars < 1 or p_stars > 5 then raise exception 'bad stars'; end if;
  if length(coalesce(trim(p_author),'')) < 1 then raise exception 'no author'; end if;
  insert into review(org_id, master_id, author_name, stars, text)
  values (v_org, v_master, trim(p_author), p_stars, nullif(trim(p_text),''));
end $$;

-- Расширяем публичный профиль: рейтинг + категория
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
    ), '[]'::jsonb)
  ) end
  from master_profile mp
  join app_user u on u.id = mp.user_id
  where mp.slug = p_slug;
$$;

-- Категория в кабинете: расширяем update_my_profile
drop function if exists update_my_profile(text, text, text, boolean, text);
create or replace function update_my_profile(
  p_spec text, p_bio text, p_address text, p_visible boolean, p_slug text, p_category text
) returns void language plpgsql security definer
set search_path = public as $$
begin
  update master_profile set
    specialization = p_spec, bio = p_bio, address = p_address,
    visible_in_search = coalesce(p_visible, visible_in_search),
    slug = coalesce(nullif(trim(p_slug), ''), slug),
    category = coalesce(nullif(trim(p_category), ''), category)
  where user_id = auth.uid();
  if not found then raise exception 'no master profile'; end if;
end $$;

grant execute on function list_public_masters(text)        to anon, authenticated;
grant execute on function get_master_reviews(text)         to anon, authenticated;
grant execute on function add_review(text, int, text, text) to anon, authenticated;
grant execute on function update_my_profile(text, text, text, boolean, text, text) to authenticated;
