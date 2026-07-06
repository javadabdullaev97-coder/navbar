-- 0005_master_manage.sql — управление своими данными из кабинета мастера.
-- Все функции работают в контексте auth.uid(): мастер меняет только своё.
-- SECURITY DEFINER + явная привязка к org мастера; RLS дополнительно страхует.

-- org текущего мастера (по его профилю)
create or replace function _my_org() returns uuid language sql stable security definer
set search_path = public as $$
  select org_id from master_profile where user_id = auth.uid() limit 1;
$$;

-- Полные данные мастера для кабинета (включая неактивные услуги)
create or replace function get_my_master()
returns jsonb language sql stable security definer
set search_path = public as $$
  select case when mp.id is null then null else jsonb_build_object(
    'org_id', mp.org_id,
    'slug', mp.slug,
    'specialization', mp.specialization,
    'bio', mp.bio,
    'address', mp.address,
    'visible_in_search', mp.visible_in_search,
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'duration_min', s.duration_min,
        'price', s.price, 'is_active', s.is_active
      ) order by s.sort_order, s.name)
      from service s where s.master_id = mp.user_id and s.org_id = mp.org_id
    ), '[]'::jsonb),
    'availability', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day_of_week', a.day_of_week, 'start_min', a.start_min,
        'end_min', a.end_min, 'is_day_off', a.is_day_off
      ) order by a.day_of_week)
      from availability a where a.master_id = mp.user_id and a.org_id = mp.org_id
    ), '[]'::jsonb)
  ) end
  from master_profile mp where mp.user_id = auth.uid();
$$;

-- Создать/изменить услугу. p_id null → создать.
create or replace function upsert_service(
  p_id uuid, p_name text, p_duration int, p_price int
) returns uuid language plpgsql security definer
set search_path = public as $$
declare v_org uuid := _my_org(); v_id uuid;
begin
  if v_org is null then raise exception 'no master profile'; end if;
  if length(coalesce(trim(p_name),'')) = 0 or p_duration <= 0 or p_price < 0 then
    raise exception 'invalid service';
  end if;
  if p_id is null then
    insert into service(org_id, master_id, name, duration_min, price)
    values (v_org, auth.uid(), trim(p_name), p_duration, p_price)
    returning id into v_id;
  else
    update service set name = trim(p_name), duration_min = p_duration, price = p_price
    where id = p_id and master_id = auth.uid()
    returning id into v_id;
    if v_id is null then raise exception 'service not found'; end if;
  end if;
  return v_id;
end $$;

create or replace function delete_service(p_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
begin
  delete from service where id = p_id and master_id = auth.uid();
  if not found then raise exception 'service not found'; end if;
end $$;

-- Установить график на день недели (upsert одной строки на день).
create or replace function set_availability(
  p_dow int, p_start int, p_end int, p_dayoff boolean
) returns void language plpgsql security definer
set search_path = public as $$
declare v_org uuid := _my_org();
begin
  if v_org is null then raise exception 'no master profile'; end if;
  if p_dow < 0 or p_dow > 6 then raise exception 'bad day'; end if;
  update availability set start_min = p_start, end_min = p_end, is_day_off = p_dayoff
  where master_id = auth.uid() and org_id = v_org and day_of_week = p_dow;
  if not found then
    insert into availability(org_id, master_id, day_of_week, start_min, end_min, is_day_off)
    values (v_org, auth.uid(), p_dow, p_start, p_end, p_dayoff);
  end if;
end $$;

-- Обновить профиль/публичную страницу
create or replace function update_my_profile(
  p_spec text, p_bio text, p_address text, p_visible boolean, p_slug text
) returns void language plpgsql security definer
set search_path = public as $$
begin
  update master_profile set
    specialization = p_spec, bio = p_bio, address = p_address,
    visible_in_search = coalesce(p_visible, visible_in_search),
    slug = coalesce(nullif(trim(p_slug), ''), slug)
  where user_id = auth.uid();
  if not found then raise exception 'no master profile'; end if;
end $$;

grant execute on function get_my_master()                              to authenticated;
grant execute on function upsert_service(uuid, text, int, int)         to authenticated;
grant execute on function delete_service(uuid)                         to authenticated;
grant execute on function set_availability(int, int, int, boolean)     to authenticated;
grant execute on function update_my_profile(text, text, text, boolean, text) to authenticated;
