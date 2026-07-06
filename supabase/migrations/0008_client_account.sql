-- 0008_client_account.sql — клиентский аккаунт без OTP (анонимная авторизация).
-- Клиент заходит как анонимный auth-пользователь; его записи и избранное
-- привязываются к auth.uid(). Позже (волна интеграций) сессию повышаем до
-- телефонного аккаунта — данные сохраняются.

-- Избранные мастера клиента
create table if not exists client_favorite (
  user_id     uuid not null references app_user(id) on delete cascade,
  master_slug text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, master_slug)
);
alter table client_favorite enable row level security;
alter table client_favorite force row level security;
drop policy if exists fav_self on client_favorite;
create policy fav_self on client_favorite
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, delete on client_favorite to authenticated;

-- Публичная бронь: если клиент авторизован (в т.ч. анонимно) — привязываем
-- запись к его user_id, чтобы показать «Мои записи». Пересоздаём функцию.
create or replace function create_public_booking(
  p_slug text,
  p_service_ids uuid[],
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text
) returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_master uuid; v_org uuid; v_total int; v_client uuid; v_booking uuid;
  v_service uuid := p_service_ids[1];
  v_uid uuid := auth.uid();
begin
  select mp.user_id, mp.org_id into v_master, v_org
  from master_profile mp where mp.slug = p_slug;
  if v_master is null then raise exception 'master not found' using errcode='no_data_found'; end if;
  if p_service_ids is null or array_length(p_service_ids,1) is null then raise exception 'no services'; end if;
  if length(coalesce(trim(p_client_name),'')) < 2 then raise exception 'invalid name'; end if;
  if p_client_phone !~ '^\+[1-9]\d{7,14}$' then raise exception 'invalid phone'; end if;

  select coalesce(sum(s.duration_min),0) into v_total from service s
  where s.id = any(p_service_ids) and s.master_id = v_master and s.org_id = v_org;
  if v_total <= 0 then raise exception 'services not found for this master'; end if;

  -- гарантируем app_user для авторизованного клиента (анонимного)
  if v_uid is not null then
    insert into app_user(id, phone) values (v_uid, null) on conflict (id) do nothing;
  end if;

  -- клиент по телефону в рамках мастера
  select id into v_client from client
  where master_id = v_master and org_id = v_org and phone = p_client_phone limit 1;
  if v_client is null then
    insert into client(org_id, master_id, user_id, name, phone)
    values (v_org, v_master, v_uid, trim(p_client_name), p_client_phone)
    returning id into v_client;
  elsif v_uid is not null then
    update client set user_id = v_uid where id = v_client and user_id is null;
  end if;

  insert into booking(org_id, master_id, client_id, service_id, starts_at, ends_at, status, source)
  values (v_org, v_master, v_client, v_service, p_starts_at,
          p_starts_at + make_interval(mins => v_total), 'pending', 'web')
  returning id into v_booking;

  return jsonb_build_object('booking_id', v_booking, 'starts_at', p_starts_at,
    'ends_at', p_starts_at + make_interval(mins => v_total), 'status', 'pending');
end $$;
grant execute on function create_public_booking(text, uuid[], timestamptz, text, text) to anon, authenticated;

-- Мои записи (клиент): денормализовано, только свои
create or replace function get_my_client_bookings()
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'master_slug', mp.slug,
    'master_name', mu.full_name,
    'master_address', mp.address,
    'service_name', s.name,
    'starts_at', b.starts_at,
    'status', b.status
  ) order by b.starts_at desc), '[]'::jsonb)
  from booking b
  join client c on c.id = b.client_id
  join master_profile mp on mp.user_id = b.master_id and mp.org_id = b.org_id
  join app_user mu on mu.id = b.master_id
  left join service s on s.id = b.service_id
  where c.user_id = auth.uid();
$$;
grant execute on function get_my_client_bookings() to authenticated;

-- Клиент отменяет свою бронь
create or replace function cancel_my_booking(p_booking uuid)
returns void language plpgsql security definer
set search_path = public as $$
begin
  update booking set status = 'cancelled'
  where id = p_booking
    and client_id in (select id from client where user_id = auth.uid());
  if not found then raise exception 'booking not found or not yours'
    using errcode = 'insufficient_privilege'; end if;
end $$;
grant execute on function cancel_my_booking(uuid) to authenticated;

-- Избранное: список/переключение
create or replace function toggle_favorite(p_slug text)
returns boolean language plpgsql security definer
set search_path = public as $$
declare v_exists boolean;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select true into v_exists from client_favorite
  where user_id = auth.uid() and master_slug = p_slug;
  if v_exists then
    delete from client_favorite where user_id = auth.uid() and master_slug = p_slug;
    return false;
  else
    insert into client_favorite(user_id, master_slug) values (auth.uid(), p_slug)
    on conflict do nothing;
    return true;
  end if;
end $$;
grant execute on function toggle_favorite(text) to authenticated;

create or replace function get_my_favorites()
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', mp.slug, 'name', u.full_name, 'specialization', mp.specialization
  )), '[]'::jsonb)
  from client_favorite f
  join master_profile mp on mp.slug = f.master_slug
  join app_user u on u.id = mp.user_id
  where f.user_id = auth.uid();
$$;
grant execute on function get_my_favorites() to authenticated;
