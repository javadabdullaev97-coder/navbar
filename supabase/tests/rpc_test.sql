-- rpc_test.sql — проверка публичных RPC тонкого среза на локальном Postgres.
\set ON_ERROR_STOP on

-- Профиль публичного мастера читается анонимно по slug
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$
declare j jsonb;
begin
  j := get_public_master('asror');
  if j is null then raise exception 'FAIL: get_public_master(asror) is null'; end if;
  if j->>'name' <> 'Асрор Каримов' then raise exception 'FAIL: wrong name %', j->>'name'; end if;
  if jsonb_array_length(j->'services') <> 4 then raise exception 'FAIL: expected 4 services'; end if;
  if jsonb_array_length(j->'availability') <> 7 then raise exception 'FAIL: expected 7 availability rows'; end if;
end $$;

-- Создание брони анонимом через RPC
do $$
declare res jsonb; svc uuid; busy jsonb;
begin
  select id into svc from service where org_id = '11111111-0000-0000-0000-0000000000aa' limit 1;

  -- будний день в 11:00 (берём ближайший понедельник в будущем)
  res := create_public_booking(
    'asror', array[svc],
    (date_trunc('week', now()) + interval '1 week' + interval '11 hours')::timestamptz,
    'Тест Клиент', '+998900000000');
  if res->>'status' <> 'pending' then raise exception 'FAIL: booking status %', res->>'status'; end if;

  -- get_day_busy отдаёт интервал без ПДн
  busy := get_day_busy('asror', (date_trunc('week', now()) + interval '1 week')::date);
  if jsonb_array_length(busy) < 1 then raise exception 'FAIL: busy should have >=1 interval'; end if;
  -- В интервале только времена, никаких имён/телефонов
  if (busy->0) ? 'name' or (busy->0) ? 'phone' then raise exception 'FAIL: busy leaks PII'; end if;
end $$;

-- Аноним НЕ может прочитать таблицу booking напрямую (ПДн-приватность)
do $$
declare n int;
begin
  select count(*) into n from booking;
  if n <> 0 then raise exception 'FAIL: anon can read % bookings directly!', n; end if;
end $$;

-- Невалидный телефон отклоняется
do $$
declare svc uuid; ok boolean := false;
begin
  select id into svc from service limit 1;
  begin
    perform create_public_booking('asror', array[svc], now(), 'X', '12345');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL: invalid phone/name accepted'; end if;
end $$;

reset role;

\echo ''
\echo '========================================'
\echo '  RPC TEST PASSED — публичный срез ✓'
\echo '========================================'

-- ── Каталог и отзывы (0006) ──
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$
declare j jsonb; r jsonb;
begin
  -- каталог содержит asror с рейтингом
  j := list_public_masters(null);
  if jsonb_array_length(j) < 1 then raise exception 'FAIL: catalog empty'; end if;
  if not exists (select 1 from jsonb_array_elements(j) e where e->>'slug' = 'asror') then
    raise exception 'FAIL: asror not in catalog';
  end if;

  -- фильтр по категории
  j := list_public_masters('Барберы');
  if jsonb_array_length(j) < 1 then raise exception 'FAIL: category filter empty'; end if;
  j := list_public_masters('Массаж');
  if jsonb_array_length(j) <> 0 then raise exception 'FAIL: category filter should be empty'; end if;

  -- рейтинг в публичном профиле
  j := get_public_master('asror');
  if (j->>'review_count')::int < 3 then raise exception 'FAIL: review_count < 3'; end if;
  if (j->>'rating')::numeric < 4 then raise exception 'FAIL: rating too low'; end if;

  -- список отзывов (сначала новые)
  r := get_master_reviews('asror');
  if jsonb_array_length(r) < 3 then raise exception 'FAIL: reviews < 3'; end if;

  -- оставить отзыв
  perform add_review('asror', 5, 'Отличный мастер', 'Аноним');
  r := get_master_reviews('asror');
  if jsonb_array_length(r) < 4 then raise exception 'FAIL: review not added'; end if;
end $$;
reset role;

\echo '  CATALOG/REVIEWS TEST PASSED ✓'
