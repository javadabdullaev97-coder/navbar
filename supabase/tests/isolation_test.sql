-- isolation_test.sql — тест изоляции «чужой не видит чужого» (CLAUDE.md §10, п.2)
--
-- Проверяем ключевое обещание §4: даже при баге в приложении БД не отдаёт
-- чужие данные. Сид — под суперюзером (он обходит RLS), проверки — под
-- ролями authenticated / anon с подменой auth.uid() через GUC.
--
-- Участники:
--   Орг A (solo):  мастер MA, профиль публичный (visible_in_search=true).
--   Орг B (solo):  мастер MB, профиль скрыт из поиска.
--   Салон S:       admin SADMIN + мастер MS (active).
-- Утверждения:
--   1. MA видит только своих клиентов/брони, не видит чужих.
--   2. MA не может вставить строку в чужую орг (WITH CHECK отклоняет).
--   3. Админ салона видит клиентов/брони своего мастера MS, но не чужих орг.
--   4. Мастер MS видит только своё.
--   5. Аноним не видит ПДн-клиентов вообще.
--   6. Аноним видит услугу публичного мастера A, но не скрытого B.

\set ON_ERROR_STOP on

-- Фиксированные UUID
\set MA     '11111111-1111-1111-1111-111111111111'
\set MB     '22222222-2222-2222-2222-222222222222'
\set SADMIN '33333333-3333-3333-3333-333333333333'
\set MS     '44444444-4444-4444-4444-444444444444'
\set ORGA   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set ORGB   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
\set ORGS   'cccccccc-cccc-cccc-cccc-cccccccccccc'

-- ── Сид (как суперюзер: RLS обходится) ────────────────────────
insert into app_user(id, phone, full_name) values
  (:'MA',     '+998900000001', 'Master A'),
  (:'MB',     '+998900000002', 'Master B'),
  (:'SADMIN', '+998900000003', 'Salon Admin'),
  (:'MS',     '+998900000004', 'Master S');

insert into organization(id, type, name) values
  (:'ORGA', 'solo', 'A solo'),
  (:'ORGB', 'solo', 'B solo'),
  (:'ORGS', 'salon','S salon');

insert into membership(org_id, user_id, role, status) values
  (:'ORGA', :'MA',     'owner',  'active'),
  (:'ORGA', :'MA',     'master', 'active'),
  (:'ORGB', :'MB',     'owner',  'active'),
  (:'ORGB', :'MB',     'master', 'active'),
  (:'ORGS', :'SADMIN', 'owner',  'active'),
  (:'ORGS', :'MS',     'master', 'active');

insert into master_profile(org_id, user_id, slug, visible_in_search) values
  (:'ORGA', :'MA', 'master-a', true),
  (:'ORGB', :'MB', 'master-b', false),
  (:'ORGS', :'MS', 'master-s', true);

insert into service(org_id, master_id, name, duration_min, price) values
  (:'ORGA', :'MA', 'Haircut A', 60, 80000),
  (:'ORGB', :'MB', 'Haircut B', 60, 90000),
  (:'ORGS', :'MS', 'Haircut S', 60, 70000);

insert into client(org_id, master_id, name, phone) values
  (:'ORGA', :'MA', 'Client of A', '+998911111111'),
  (:'ORGB', :'MB', 'Client of B', '+998922222222'),
  (:'ORGS', :'MS', 'Client of S', '+998944444444');

insert into booking(org_id, master_id, starts_at, ends_at, status) values
  (:'ORGA', :'MA', now(), now() + interval '1h', 'confirmed'),
  (:'ORGB', :'MB', now(), now() + interval '1h', 'confirmed'),
  (:'ORGS', :'MS', now(), now() + interval '1h', 'confirmed');

-- ── Проверки под ролью authenticated ──────────────────────────
set role authenticated;

-- (1) MA видит только своих
select set_config('request.jwt.claim.sub', :'MA', false);
do $$
declare n int;
begin
  select count(*) into n from client;
  if n <> 1 then raise exception 'FAIL 1a: MA sees % clients, expected 1', n; end if;
  select count(*) into n from client where name = 'Client of B';
  if n <> 0 then raise exception 'FAIL 1b: MA sees B''s client!'; end if;
  select count(*) into n from booking;
  if n <> 1 then raise exception 'FAIL 1c: MA sees % bookings, expected 1', n; end if;
end $$;

-- (2) MA не может писать в чужую орг
do $$
begin
  insert into client(org_id, master_id, name, phone)
  values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          '22222222-2222-2222-2222-222222222222', 'hacked', '+998900000000');
  raise exception 'FAIL 2: MA inserted into B''s org (RLS bypassed)!';
exception when insufficient_privilege then
  null; -- ожидаемо: new row violates row-level security policy (42501)
end $$;

-- (3) Админ салона видит своего мастера, но не чужие орг
select set_config('request.jwt.claim.sub', :'SADMIN', false);
do $$
declare n int;
begin
  select count(*) into n from client where name = 'Client of S';
  if n <> 1 then raise exception 'FAIL 3a: admin cannot see own master client'; end if;
  select count(*) into n from booking;
  if n <> 1 then raise exception 'FAIL 3b: admin sees % bookings, expected 1', n; end if;
  select count(*) into n from client where name in ('Client of A','Client of B');
  if n <> 0 then raise exception 'FAIL 3c: admin sees foreign clients!'; end if;
end $$;

-- (4) Мастер MS видит только своё
select set_config('request.jwt.claim.sub', :'MS', false);
do $$
declare n int;
begin
  select count(*) into n from client;
  if n <> 1 then raise exception 'FAIL 4: MS sees % clients, expected 1', n; end if;
end $$;

reset role;

-- ── Проверки под ролью anon ───────────────────────────────────
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$
declare n int;
begin
  -- (5) ПДн-клиенты недоступны анониму
  select count(*) into n from client;
  if n <> 0 then raise exception 'FAIL 5: anon sees % private clients!', n; end if;
  -- (6) публичная витрина: услуга A видна, B — скрыта
  select count(*) into n from service where name = 'Haircut A';
  if n <> 1 then raise exception 'FAIL 6a: anon cannot see public master A service'; end if;
  select count(*) into n from service where name = 'Haircut B';
  if n <> 0 then raise exception 'FAIL 6b: anon sees hidden master B service!'; end if;
end $$;

reset role;

\echo ''
\echo '========================================='
\echo '  ISOLATION TEST PASSED — 6/6 проверок ✓'
\echo '========================================='
