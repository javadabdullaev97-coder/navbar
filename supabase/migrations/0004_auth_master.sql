-- 0004_auth_master.sql — привязка вошедшего пользователя к профилю мастера.
-- Вход в кабинет пока по email-ссылке (Supabase Auth magic link). Телефонный
-- OTP — на этапе интеграций. auth.uid() вошедшего ≠ seed-мастеру, поэтому даём
-- RPC claim_demo_master(), который «передаёт» демо-мастера текущему пользователю,
-- чтобы RLS начал отдавать ему его брони.

-- Аккаунт может входить по email (телефон становится необязательным)
alter table app_user alter column phone drop not null;
alter table app_user add column if not exists email text unique;

-- Автопровижининг app_user при регистрации в Supabase Auth (только если auth.users
-- реально существует — в локальном тесте этой таблицы нет, поэтому под guard).
do $$
begin
  if to_regclass('auth.users') is not null then
    execute $fn$
      create or replace function handle_new_auth_user()
      returns trigger language plpgsql security definer
      set search_path = public as $body$
      begin
        insert into public.app_user(id, email, phone, full_name)
        values (new.id, new.email, new.phone,
                coalesce(new.raw_user_meta_data->>'full_name', new.email))
        on conflict (id) do nothing;
        return new;
      end $body$;
    $fn$;
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function handle_new_auth_user();
  end if;
end $$;

-- Демо-константы (совпадают с seed.sql)
create or replace function _demo_org() returns uuid language sql immutable as
$$ select '11111111-0000-0000-0000-0000000000aa'::uuid $$;
create or replace function _demo_master() returns uuid language sql immutable as
$$ select '11111111-0000-0000-0000-000000000001'::uuid $$;

-- Передать демо-мастера текущему вошедшему пользователю.
-- Идемпотентно; повторный вызов тем же пользователем — no-op. Чужой пользователь
-- не может «увести» уже занятого мастера.
create or replace function claim_demo_master()
returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid := _demo_org();
  v_seed uuid := _demo_master();
  v_current uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  select user_id into v_current from master_profile where org_id = v_org limit 1;

  -- уже владелец
  if v_current = v_uid then
    return jsonb_build_object('status', 'already_owner');
  end if;
  -- занят кем-то другим (не seed) — не отдаём
  if v_current is not null and v_current <> v_seed then
    raise exception 'demo already claimed';
  end if;

  -- гарантируем app_user для нового владельца
  insert into app_user(id, full_name) values (v_uid, 'Мастер')
  on conflict (id) do nothing;

  -- переносим все ссылки seed → текущий пользователь
  update membership     set user_id   = v_uid where org_id = v_org and user_id   = v_seed;
  update master_profile set user_id   = v_uid where org_id = v_org and user_id   = v_seed;
  update service        set master_id = v_uid where org_id = v_org and master_id = v_seed;
  update availability   set master_id = v_uid where org_id = v_org and master_id = v_seed;
  update client         set master_id = v_uid where org_id = v_org and master_id = v_seed;
  update booking        set master_id = v_uid where org_id = v_org and master_id = v_seed;
  update payment        set master_id = v_uid where org_id = v_org and master_id = v_seed;
  update gallery        set master_id = v_uid where org_id = v_org and master_id = v_seed;

  return jsonb_build_object('status', 'claimed', 'org_id', v_org);
end $$;

grant execute on function claim_demo_master() to authenticated;

-- Список моих броней для кабинета: денормализовано (имя клиента, услуга).
-- Доступ режет RLS booking (master видит только свои) — плюс явная проверка.
create or replace function get_my_bookings()
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'client_name', c.name,
    'client_phone', c.phone,
    'service_name', s.name,
    'starts_at', b.starts_at,
    'ends_at', b.ends_at,
    'status', b.status
  ) order by b.starts_at), '[]'::jsonb)
  from booking b
  left join client c on c.id = b.client_id
  left join service s on s.id = b.service_id
  where b.master_id = auth.uid();
$$;
grant execute on function get_my_bookings() to authenticated;

-- Сменить статус своей брони (подтвердить/выполнить/отменить).
create or replace function set_booking_status(p_booking uuid, p_status booking_status)
returns void language plpgsql security definer
set search_path = public as $$
begin
  update booking set status = p_status
  where id = p_booking and master_id = auth.uid();
  if not found then
    raise exception 'booking not found or not yours' using errcode = 'insufficient_privilege';
  end if;
end $$;
grant execute on function set_booking_status(uuid, booking_status) to authenticated;
