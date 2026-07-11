-- 0011_storage_verification.sql — аватар мастера, бакеты Storage (avatars, docs),
-- верификация (диплом → бейдж «Диплом проверен»).

-- ── Новые поля профиля мастера ──
alter table master_profile add column if not exists avatar_url text;
alter table master_profile add column if not exists verified boolean not null default false;

-- ── Storage: бакеты avatars (публичный) и docs (приватный). Под guard,
-- т.к. в локальном plain-postgres схемы storage нет. ──
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
    insert into storage.buckets (id, name, public) values ('docs', 'docs', false) on conflict (id) do nothing;

    -- avatars: публичное чтение, запись/удаление — в свою папку (uid)
    drop policy if exists avatars_read on storage.objects;
    create policy avatars_read on storage.objects for select to anon, authenticated using (bucket_id = 'avatars');
    drop policy if exists avatars_write on storage.objects;
    create policy avatars_write on storage.objects for insert to authenticated
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
    drop policy if exists avatars_update on storage.objects;
    create policy avatars_update on storage.objects for update to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
    drop policy if exists avatars_delete on storage.objects;
    create policy avatars_delete on storage.objects for delete to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

    -- docs: приватные — читать/писать может только владелец
    drop policy if exists docs_rw on storage.objects;
    create policy docs_rw on storage.objects for all to authenticated
      using (bucket_id = 'docs' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'docs' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;

-- ── Установить аватар мастера ──
create or replace function set_avatar(p_url text)
returns void language plpgsql security definer
set search_path = public as $$
begin
  update master_profile set avatar_url = nullif(trim(p_url), '') where user_id = auth.uid();
  if not found then raise exception 'no master profile'; end if;
end $$;
grant execute on function set_avatar(text) to authenticated;

-- ── Заявки на верификацию ──
create table if not exists verification_request (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_user(id) on delete cascade,
  org_id     uuid references organization(id) on delete set null,
  doc_path   text not null,                       -- путь в бакете docs
  status     text not null default 'pending',     -- pending | approved | rejected
  created_at timestamptz not null default now()
);
create index if not exists verification_request_user on verification_request(user_id);

alter table verification_request enable row level security;
drop policy if exists vr_own on verification_request;
create policy vr_own on verification_request for select to authenticated using (user_id = auth.uid());

-- Отправить документ на проверку (после аппрува админом ставится verified=true).
create or replace function submit_verification(p_doc_path text)
returns void language plpgsql security definer
set search_path = public as $$
declare v_org uuid := _my_org();
begin
  if length(coalesce(trim(p_doc_path), '')) = 0 then raise exception 'no document'; end if;
  insert into verification_request(user_id, org_id, doc_path, status)
  values (auth.uid(), v_org, trim(p_doc_path), 'pending');
end $$;
grant execute on function submit_verification(text) to authenticated;

-- ── Расширяем публичный профиль и кабинет: avatar_url + verified ──
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
    'avatar_url', mp.avatar_url,
    'verified', mp.verified,
    'org_id', mp.org_id,
    'master_id', mp.user_id,
    'rating', (_master_rating(mp.user_id, mp.org_id)->>'rating')::numeric,
    'review_count', (_master_rating(mp.user_id, mp.org_id)->>'count')::int,
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'duration_min', s.duration_min, 'price', s.price
      ) order by s.sort_order, s.name)
      from service s where s.master_id = mp.user_id and s.org_id = mp.org_id and s.is_active
    ), '[]'::jsonb),
    'availability', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day_of_week', a.day_of_week, 'start_min', a.start_min, 'end_min', a.end_min, 'is_day_off', a.is_day_off
      ) order by a.day_of_week)
      from availability a where a.master_id = mp.user_id and a.org_id = mp.org_id
    ), '[]'::jsonb),
    'portfolio', coalesce((
      select jsonb_agg(jsonb_build_object('url', g.url, 'caption', g.caption)
        order by g.sort_order, g.created_at desc)
      from gallery g where g.master_id = mp.user_id and g.org_id = mp.org_id
    ), '[]'::jsonb)
  ) end
  from master_profile mp
  join app_user u on u.id = mp.user_id
  where mp.slug = p_slug;
$$;

create or replace function get_my_master()
returns jsonb language sql stable security definer
set search_path = public as $$
  select case when mp.id is null then null else jsonb_build_object(
    'org_id', mp.org_id,
    'slug', mp.slug,
    'specialization', mp.specialization,
    'bio', mp.bio,
    'address', mp.address,
    'avatar_url', mp.avatar_url,
    'verified', mp.verified,
    'visible_in_search', mp.visible_in_search,
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'duration_min', s.duration_min, 'price', s.price, 'is_active', s.is_active
      ) order by s.sort_order, s.name)
      from service s where s.master_id = mp.user_id and s.org_id = mp.org_id
    ), '[]'::jsonb),
    'availability', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day_of_week', a.day_of_week, 'start_min', a.start_min, 'end_min', a.end_min, 'is_day_off', a.is_day_off
      ) order by a.day_of_week)
      from availability a where a.master_id = mp.user_id and a.org_id = mp.org_id
    ), '[]'::jsonb)
  ) end
  from master_profile mp where mp.user_id = auth.uid();
$$;
