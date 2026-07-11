-- 0010_email_master.sql — реальный мультимастер без демо-костыля.
-- Вошедший по email пользователь становится соло-мастером: создаётся
-- organization(solo) + membership(owner+master) + master_profile + дефолтный
-- график. Идемпотентно: повторный вызов обновляет имя/специализацию.

create or replace function become_solo_master(
  p_name text, p_spec text, p_city text default null
) returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_org  uuid;
  v_slug text;
  v_base text;
  d int;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  -- app_user (на случай, если триггер не отработал); обновляем имя
  insert into app_user(id, full_name)
  values (v_uid, nullif(trim(p_name), ''))
  on conflict (id) do update
    set full_name = coalesce(nullif(trim(excluded.full_name), ''), app_user.full_name);

  -- уже мастер? — обновим специализацию/адрес и вернём
  select org_id into v_org from master_profile where user_id = v_uid limit 1;
  if v_org is not null then
    update master_profile
      set specialization = coalesce(nullif(trim(p_spec), ''), specialization),
          address        = coalesce(nullif(trim(p_city), ''), address)
      where user_id = v_uid;
    select slug into v_slug from master_profile where user_id = v_uid limit 1;
    return jsonb_build_object('status', 'exists', 'org_id', v_org, 'slug', v_slug);
  end if;

  -- организация + подписка + членства
  insert into organization(type, name) values ('solo', nullif(trim(p_name), ''))
  returning id into v_org;
  insert into subscription(org_id, plan, seats, status) values (v_org, 'solo', 1, 'active');
  insert into membership(org_id, user_id, role, status) values (v_org, v_uid, 'owner', 'active');
  insert into membership(org_id, user_id, role, status) values (v_org, v_uid, 'master', 'active');

  -- уникальный slug из имени (кириллица → фолбэк 'master') + короткий суффикс
  v_base := nullif(trim(both '-' from regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '-', 'g')), '');
  if v_base is null then v_base := 'master'; end if;
  loop
    v_slug := v_base || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
    exit when not exists (select 1 from master_profile where slug = v_slug);
  end loop;

  insert into master_profile(org_id, user_id, slug, specialization, address, cover_type, cover_color, visible_in_search)
  values (v_org, v_uid, v_slug, nullif(trim(p_spec), ''), nullif(trim(p_city), ''), 'color', '#5E1226', true);

  -- дефолтный график: Пн–Пт 09:00–18:00, Сб/Вс выходной
  for d in 0..6 loop
    insert into availability(org_id, master_id, day_of_week, start_min, end_min, is_day_off)
    values (v_org, v_uid, d, 540, 1080, d >= 5);
  end loop;

  return jsonb_build_object('status', 'created', 'org_id', v_org, 'slug', v_slug);
end $$;

grant execute on function become_solo_master(text, text, text) to authenticated;
