-- 0003_public_rpc.sql — публичный тонкий срез (CLAUDE.md §10.3)
-- Публичная запись работает ВСЕГДА по slug (§5), даже если мастер скрыт из поиска.
-- Поэтому чтение витрины и создание брони идут через SECURITY DEFINER RPC,
-- а не через прямой доступ anon к таблицам. ПДн клиентов наружу не отдаём.

-- ── Публичный профиль мастера по slug: профиль + активные услуги + график ──
create or replace function get_public_master(p_slug text)
returns jsonb language sql stable security definer
set search_path = public as $$
  select case when mp.id is null then null else jsonb_build_object(
    'slug', mp.slug,
    'name', u.full_name,
    'specialization', mp.specialization,
    'bio', mp.bio,
    'address', mp.address,
    'cover_color', mp.cover_color,
    'org_id', mp.org_id,
    'master_id', mp.user_id,
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

-- ── Занятые интервалы мастера на дату: ТОЛЬКО времена, без ПДн ──
-- Возвращает [{start_min, end_min}] по броням (кроме отменённых). Клиент
-- сам вычтет их из графика (core.freeSlots). Имена/телефоны наружу не идут.
create or replace function get_day_busy(p_slug text, p_day date)
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'start_min', extract(hour from b.starts_at)*60 + extract(minute from b.starts_at),
    'end_min',   extract(hour from b.ends_at)*60   + extract(minute from b.ends_at)
  )), '[]'::jsonb)
  from booking b
  join master_profile mp on mp.user_id = b.master_id and mp.org_id = b.org_id
  where mp.slug = p_slug
    and b.status <> 'cancelled'
    and (b.starts_at at time zone 'UTC')::date = p_day;
$$;

-- ── Создание публичной брони ──
-- Находит мастера по slug (публичная ссылка работает всегда), считает суммарную
-- длительность выбранных услуг, создаёт/находит клиента по телефону, вставляет
-- бронь со статусом pending (мастер подтверждает). Идемпотентность и защита от
-- гонок по слоту — предмет отдельной доработки (advisory lock/констрейнт).
create or replace function create_public_booking(
  p_slug text,
  p_service_ids uuid[],
  p_starts_at timestamptz,
  p_client_name text,
  p_client_phone text
) returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_master uuid;
  v_org uuid;
  v_total int;
  v_client uuid;
  v_booking uuid;
  v_service uuid := p_service_ids[1];
begin
  select mp.user_id, mp.org_id into v_master, v_org
  from master_profile mp where mp.slug = p_slug;
  if v_master is null then
    raise exception 'master not found' using errcode = 'no_data_found';
  end if;

  if p_service_ids is null or array_length(p_service_ids, 1) is null then
    raise exception 'no services';
  end if;
  if length(coalesce(trim(p_client_name), '')) < 2 then
    raise exception 'invalid name';
  end if;
  if p_client_phone !~ '^\+[1-9]\d{7,14}$' then
    raise exception 'invalid phone';
  end if;

  select coalesce(sum(s.duration_min), 0) into v_total
  from service s
  where s.id = any(p_service_ids) and s.master_id = v_master and s.org_id = v_org;
  if v_total <= 0 then
    raise exception 'services not found for this master';
  end if;

  -- клиент по телефону в рамках мастера
  select id into v_client from client
  where master_id = v_master and org_id = v_org and phone = p_client_phone
  limit 1;
  if v_client is null then
    insert into client(org_id, master_id, name, phone)
    values (v_org, v_master, trim(p_client_name), p_client_phone)
    returning id into v_client;
  end if;

  insert into booking(org_id, master_id, client_id, service_id, starts_at, ends_at, status, source)
  values (v_org, v_master, v_client, v_service, p_starts_at,
          p_starts_at + make_interval(mins => v_total), 'pending', 'web')
  returning id into v_booking;

  return jsonb_build_object(
    'booking_id', v_booking,
    'starts_at', p_starts_at,
    'ends_at', p_starts_at + make_interval(mins => v_total),
    'status', 'pending'
  );
end $$;

-- Доступ к RPC для публичных ролей. Функции SECURITY DEFINER выполняются с
-- правами владельца, но RLS для запросов внутри них не обходится автоматически —
-- поэтому владелец функций (postgres) должен иметь доступ, что верно.
grant execute on function get_public_master(text) to anon, authenticated;
grant execute on function get_day_busy(text, date) to anon, authenticated;
grant execute on function create_public_booking(text, uuid[], timestamptz, text, text)
  to anon, authenticated;
