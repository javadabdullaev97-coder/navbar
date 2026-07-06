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
