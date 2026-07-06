-- 0001_schema.sql — базовая схема Navbar (CLAUDE.md §5)
-- Мультитенантность: organization = solo | salon. Всё завязано на org_id.
-- Аккаунт = телефон (OTP). Идентичность пользователя — Supabase auth.users.
--
-- Совместимо с локальным Postgres для тестов изоляции:
-- если схемы auth нет (мы не в Supabase) — создаём заглушку auth.uid().

-- ─────────────────────────────────────────────────────────────
-- Совместимость: auth.uid() и роли Supabase (anon / authenticated)
-- В самом Supabase этот блок no-op (объекты уже существуют).
-- ─────────────────────────────────────────────────────────────
create schema if not exists auth;

do $$
begin
  if not exists (select 1 from pg_proc p
                 join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'auth' and p.proname = 'uid') then
    -- Локальная заглушка: читает id текущего пользователя из GUC.
    execute $fn$
      create function auth.uid() returns uuid
      language sql stable as $body$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Типы-перечисления
-- ─────────────────────────────────────────────────────────────
create type org_type          as enum ('solo', 'salon');
create type member_role       as enum ('owner', 'admin', 'master');
create type member_status     as enum ('invited', 'pending', 'active', 'left');
create type subscription_plan as enum ('free', 'solo', 'salon');
create type subscription_status as enum ('active', 'past_due', 'canceled');
create type cover_type        as enum ('color', 'photo');
create type booking_status    as enum ('pending', 'confirmed', 'done', 'cancelled');
create type booking_source    as enum ('manual', 'web', 'app', 'telegram');
create type payment_provider  as enum ('payme', 'click', 'uzum', 'stripe');
create type payment_status    as enum ('pending', 'paid', 'failed', 'refunded');

-- ─────────────────────────────────────────────────────────────
-- app_user — публичный профиль аккаунта (1:1 с auth.users)
-- ПДн-минимум: телефон (E.164). Реальные ПДн клиентов — в client (§7).
-- ─────────────────────────────────────────────────────────────
create table app_user (
  id          uuid primary key,               -- = auth.users.id
  phone       text unique not null,           -- E.164
  full_name   text,
  lang        text not null default 'en',     -- 'en' | 'ru' | 'uz'
  created_at  timestamptz not null default now()
);

create table telegram_link (
  user_id     uuid primary key references app_user(id) on delete cascade,
  tg_user_id  bigint unique not null,
  linked_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Организация (tenant) и подписка
-- ─────────────────────────────────────────────────────────────
create table organization (
  id           uuid primary key default gen_random_uuid(),
  type         org_type not null,
  name         text,
  created_at   timestamptz not null default now()
);

create table subscription (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organization(id) on delete cascade,
  plan         subscription_plan not null default 'free',
  seats        int not null default 1,
  status       subscription_status not null default 'active',
  current_period_end timestamptz,
  created_at   timestamptz not null default now()
);
create index on subscription(org_id);

-- ─────────────────────────────────────────────────────────────
-- Членство: кто и с какой ролью работает в организации
-- ─────────────────────────────────────────────────────────────
create table membership (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organization(id) on delete cascade,
  user_id     uuid not null references app_user(id) on delete cascade,
  role        member_role not null,
  status      member_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (org_id, user_id, role)
);
create index on membership(user_id);
create index on membership(org_id);

-- ─────────────────────────────────────────────────────────────
-- Профиль мастера (в контуре организации)
-- ─────────────────────────────────────────────────────────────
create table master_profile (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organization(id) on delete cascade,
  user_id          uuid not null references app_user(id) on delete cascade,
  slug             text unique,                       -- navbar.uz/[slug]
  specialization   text,
  bio              text,
  address          text,
  lat              double precision,
  lng              double precision,
  cover_type       cover_type not null default 'color',
  cover_color      text,                              -- бренд-акцент
  visible_in_search boolean not null default false,   -- §5: публичная ссылка ВСЕГДА, поиск — по флагу
  created_at       timestamptz not null default now(),
  unique (org_id, user_id)
);
create index on master_profile(org_id);

-- ─────────────────────────────────────────────────────────────
-- Услуги, доступность (график), клиенты, брони, платежи, галерея
-- Все несут org_id + master_id (§5: RLS по «организация + роль»)
-- ─────────────────────────────────────────────────────────────
create table service (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organization(id) on delete cascade,
  master_id    uuid not null references app_user(id) on delete cascade,
  name         text not null,
  duration_min int not null check (duration_min > 0),
  price        int not null check (price >= 0),        -- мин. единицы валюты
  category     text,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index on service(org_id);
create index on service(master_id);

create table availability (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organization(id) on delete cascade,
  master_id    uuid not null references app_user(id) on delete cascade,
  day_of_week  int not null check (day_of_week between 0 and 6), -- 0=пн
  start_min    int not null check (start_min between 0 and 1440),
  end_min      int not null check (end_min between 0 and 1440),
  is_day_off   boolean not null default false
);
create index on availability(master_id);

create table client (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organization(id) on delete cascade,
  master_id    uuid not null references app_user(id) on delete cascade,
  user_id      uuid references app_user(id) on delete set null, -- если клиент в системе
  name         text not null,
  phone        text not null,                          -- E.164 (ПДн!)
  notes        text,
  rating_sum   int not null default 0,                 -- анонимный агрегат от мастеров
  rating_count int not null default 0,
  visit_count  int not null default 0,
  last_visit_at timestamptz,
  created_at   timestamptz not null default now()
);
create index on client(org_id);
create index on client(master_id);

create table booking (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organization(id) on delete cascade,
  master_id    uuid not null references app_user(id) on delete cascade,
  client_id    uuid references client(id) on delete set null,
  service_id   uuid references service(id) on delete set null,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  status       booking_status not null default 'pending',
  source       booking_source not null default 'app',
  notes        text,
  created_at   timestamptz not null default now()
);
create index on booking(org_id);
create index on booking(master_id);
create index on booking(starts_at);

create table payment (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organization(id) on delete cascade,
  master_id    uuid not null references app_user(id) on delete cascade,
  booking_id   uuid references booking(id) on delete set null,
  provider     payment_provider not null,
  amount       int not null,
  currency     text not null default 'UZS',
  status       payment_status not null default 'pending',
  external_ref text,                                    -- токен/референс, КАРТЫ НЕ ХРАНИМ (§6)
  created_at   timestamptz not null default now()
);
create index on payment(org_id);

create table gallery (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organization(id) on delete cascade,
  master_id    uuid not null references app_user(id) on delete cascade,
  url          text not null,
  caption      text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index on gallery(master_id);
