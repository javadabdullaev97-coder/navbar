-- 0012_master_crm.sql — CRM мастера (клиенты), описание услуги, заметки.

-- ── Описание услуги ──
alter table service add column if not exists description text;

drop function if exists upsert_service(uuid, text, int, int);
create or replace function upsert_service(
  p_id uuid, p_name text, p_duration int, p_price int, p_description text default null
) returns uuid language plpgsql security definer
set search_path = public as $$
declare v_org uuid := _my_org(); v_id uuid;
begin
  if v_org is null then raise exception 'no master profile'; end if;
  if length(coalesce(trim(p_name),'')) = 0 or p_duration <= 0 or p_price < 0 then
    raise exception 'invalid service';
  end if;
  if p_id is null then
    insert into service(org_id, master_id, name, duration_min, price, description)
    values (v_org, auth.uid(), trim(p_name), p_duration, p_price, nullif(trim(p_description), ''))
    returning id into v_id;
  else
    update service set name = trim(p_name), duration_min = p_duration, price = p_price,
      description = nullif(trim(p_description), '')
    where id = p_id and master_id = auth.uid()
    returning id into v_id;
    if v_id is null then raise exception 'service not found'; end if;
  end if;
  return v_id;
end $$;
grant execute on function upsert_service(uuid, text, int, int, text) to authenticated;

-- ── Клиенты мастера (агрегат из броней) ──
create or replace function get_my_clients()
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(row order by (row->>'last_visit') desc nulls last), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'phone', c.phone,
      'notes', c.notes,
      'visits', (select count(*) from booking b where b.client_id = c.id and b.master_id = auth.uid()),
      'last_visit', (select max(b.starts_at) from booking b where b.client_id = c.id and b.master_id = auth.uid())
    ) as row
    from client c where c.master_id = auth.uid()
  ) t;
$$;
grant execute on function get_my_clients() to authenticated;

-- ── Карточка клиента + история визитов ──
create or replace function get_client(p_id uuid)
returns jsonb language sql stable security definer
set search_path = public as $$
  select case when c.id is null then null else jsonb_build_object(
    'id', c.id, 'name', c.name, 'phone', c.phone, 'notes', c.notes,
    'since', c.created_at,
    'visits', (select count(*) from booking b where b.client_id = c.id and b.master_id = auth.uid()),
    'total_spent', coalesce((
      select sum(s.price) from booking b left join service s on s.id = b.service_id
      where b.client_id = c.id and b.master_id = auth.uid() and b.status = 'done'
    ), 0),
    'history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'service_name', s.name, 'price', s.price, 'starts_at', b.starts_at, 'status', b.status
      ) order by b.starts_at desc)
      from booking b left join service s on s.id = b.service_id
      where b.client_id = c.id and b.master_id = auth.uid()
    ), '[]'::jsonb)
  ) end
  from client c where c.id = p_id and c.master_id = auth.uid();
$$;
grant execute on function get_client(uuid) to authenticated;

-- ── Заметка о клиенте ──
create or replace function set_client_note(p_id uuid, p_note text)
returns void language plpgsql security definer
set search_path = public as $$
begin
  update client set notes = nullif(trim(p_note), '') where id = p_id and master_id = auth.uid();
  if not found then raise exception 'client not found'; end if;
end $$;
grant execute on function set_client_note(uuid, text) to authenticated;

-- ── Брони мастера: добавляем client_id и заметку клиента ──
create or replace function get_my_bookings()
returns jsonb language sql stable security definer
set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'client_id', b.client_id,
    'client_name', c.name,
    'client_phone', c.phone,
    'client_note', c.notes,
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

-- ── Кабинет: услуги с описанием ──
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
        'id', s.id, 'name', s.name, 'description', s.description,
        'duration_min', s.duration_min, 'price', s.price, 'is_active', s.is_active
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
