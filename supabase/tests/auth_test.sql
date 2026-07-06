-- auth_test.sql — проверка кабинета мастера (claim + видимость броней + confirm).
\set ON_ERROR_STOP on
\set MASTER '55555555-5555-5555-5555-555555555555'

-- Гость создаёт бронь у asror (наполняем данными для кабинета)
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$
declare svc uuid;
begin
  select id into svc from service where org_id = _demo_org() limit 1;
  perform create_public_booking(
    'asror', array[svc],
    (date_trunc('week', now()) + interval '1 week' + interval '14 hours')::timestamptz,
    'Кабинет Тест', '+998900001122');
end $$;
reset role;

-- Новый вошедший пользователь (email-логин) забирает демо-мастера
set role authenticated;
select set_config('request.jwt.claim.sub', :'MASTER', false);
do $$
declare r jsonb; n int;
begin
  -- до claim он не видит чужих броней
  select count(*) into n from booking;
  if n <> 0 then raise exception 'FAIL: fresh user sees % bookings before claim', n; end if;

  r := claim_demo_master();
  if r->>'status' <> 'claimed' then raise exception 'FAIL: claim status %', r->>'status'; end if;

  -- теперь он мастер и видит брони
  select count(*) into n from booking;
  if n < 1 then raise exception 'FAIL: master sees % bookings after claim', n; end if;

  -- get_my_bookings отдаёт денормализованные брони с именем клиента
  r := get_my_bookings();
  if jsonb_array_length(r) < 1 then raise exception 'FAIL: get_my_bookings empty'; end if;
  if not (r->0 ? 'client_name') then raise exception 'FAIL: no client_name'; end if;
end $$;

-- Подтверждение брони
do $$
declare bid uuid; st text;
begin
  select id into bid from booking where master_id = '55555555-5555-5555-5555-555555555555' and status = 'pending' limit 1;
  perform set_booking_status(bid, 'confirmed');
  select status into st from booking where id = bid;
  if st <> 'confirmed' then raise exception 'FAIL: status not confirmed (%)', st; end if;
end $$;

-- Повторный claim тем же пользователем — no-op
do $$
declare r jsonb;
begin
  r := claim_demo_master();
  if r->>'status' <> 'already_owner' then raise exception 'FAIL: re-claim status %', r->>'status'; end if;
end $$;

-- Чужой пользователь НЕ может увести уже занятого мастера
select set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', false);
do $$
declare ok boolean := false;
begin
  begin perform claim_demo_master();
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL: second user claimed an owned master'; end if;
end $$;

reset role;

\echo ''
\echo '========================================'
\echo '  AUTH/CABINET TEST PASSED ✓'
\echo '========================================'

-- ── Управление данными мастера (0005) ──
set role authenticated;
select set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', false);
do $$
declare j jsonb; sid uuid; n int;
begin
  -- get_my_master отдаёт профиль + услуги + график
  j := get_my_master();
  if j is null then raise exception 'FAIL: get_my_master null'; end if;
  if jsonb_array_length(j->'services') < 1 then raise exception 'FAIL: no services'; end if;

  -- создать услугу
  sid := upsert_service(null, 'Тест-услуга', 40, 55000);
  j := get_my_master();
  select count(*) into n from jsonb_array_elements(j->'services') e
    where e->>'name' = 'Тест-услуга';
  if n <> 1 then raise exception 'FAIL: service not created'; end if;

  -- изменить её
  perform upsert_service(sid, 'Тест-услуга-2', 50, 65000);
  -- удалить
  perform delete_service(sid);
  j := get_my_master();
  select count(*) into n from jsonb_array_elements(j->'services') e
    where e->>'id' = sid::text;
  if n <> 0 then raise exception 'FAIL: service not deleted'; end if;

  -- график: выходной на вс (6)
  perform set_availability(6, 0, 0, true);
  -- профиль
  perform update_my_profile('Мастер-барбер', 'обо мне', 'адрес', true, null, 'Барберы');
  j := get_my_master();
  if j->>'specialization' <> 'Мастер-барбер' then raise exception 'FAIL: profile not updated'; end if;
end $$;

-- Чужой пользователь не может править услуги демо-мастера
select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', false);
do $$
declare ok boolean := false; sid uuid;
begin
  -- у чужого нет профиля → upsert должен упасть
  begin perform upsert_service(null, 'hack', 30, 1000);
  exception when others then ok := true; end;
  if not ok then raise exception 'FAIL: stranger created a service'; end if;
end $$;
reset role;

\echo '  MASTER-MANAGE TEST PASSED ✓'

-- ── Портфолио (0007) ──
set role authenticated;
select set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', false);
do $$
declare gid uuid; j jsonb;
begin
  gid := add_gallery_item('https://example.com/1.jpg', 'Фейд');
  j := get_my_gallery();
  if jsonb_array_length(j) < 1 then raise exception 'FAIL: gallery empty after add'; end if;
  perform delete_gallery_item(gid);
  j := get_my_gallery();
  if jsonb_array_length(j) <> 0 then raise exception 'FAIL: gallery not empty after delete'; end if;
end $$;
reset role;
\echo '  PORTFOLIO TEST PASSED ✓'
