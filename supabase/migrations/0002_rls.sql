-- 0002_rls.sql — Row Level Security по «организация + роль» (CLAUDE.md §4, §5)
--
-- Правило (§5):
--   роль master        → только свои строки (master_id = auth.uid());
--   роль owner/admin    → все строки своей организации.
-- Публичная запись (§5, «правило видимости»): мастер, услуги, доступность и
-- галерея видимы анонимно, если master_profile.visible_in_search = true
-- ЛИБО известен точный slug (публичная ссылка работает ВСЕГДА). На уровне БД
-- это выражается как: anon может SELECT публичные витринные строки.
--
-- Все политики — permissive и адресно на роли anon/authenticated.
-- FORCE RLS включаем, чтобы владелец таблицы тоже подчинялся политикам
-- (важно для честного теста изоляции).

-- ─────────────────────────────────────────────────────────────
-- Вспомогательные функции (SECURITY DEFINER, чтобы читать membership
-- в обход RLS самой membership и не ловить рекурсию политик)
-- ─────────────────────────────────────────────────────────────
create or replace function app_is_member(p_org uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from membership m
    where m.org_id = p_org
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function app_is_admin(p_org uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from membership m
    where m.org_id = p_org
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  );
$$;

-- Видит ли текущий пользователь строку мастера в организации:
-- свои строки — если он этот мастер; чужие — только админ/owner.
create or replace function app_can_touch(p_org uuid, p_master uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select p_master = auth.uid() or app_is_admin(p_org);
$$;

-- ─────────────────────────────────────────────────────────────
-- Включаем RLS на всех таблицах
-- ─────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'app_user','telegram_link','organization','subscription','membership',
    'master_profile','service','availability','client','booking','payment','gallery'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- app_user: каждый видит/меняет только себя
-- ─────────────────────────────────────────────────────────────
create policy app_user_self on app_user
  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- telegram_link: только владелец
create policy tg_self on telegram_link
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- organization: члены видят свою; изменять — только админ/owner
-- ─────────────────────────────────────────────────────────────
create policy org_read on organization
  for select to authenticated using (app_is_member(id));
create policy org_write on organization
  for update to authenticated using (app_is_admin(id)) with check (app_is_admin(id));

-- subscription: члены читают, админ пишет
create policy sub_read on subscription
  for select to authenticated using (app_is_member(org_id));
create policy sub_write on subscription
  for all to authenticated using (app_is_admin(org_id)) with check (app_is_admin(org_id));

-- ─────────────────────────────────────────────────────────────
-- membership: пользователь видит свои членства + админ видит все в своей орг
-- ─────────────────────────────────────────────────────────────
create policy mem_read on membership
  for select to authenticated
  using (user_id = auth.uid() or app_is_admin(org_id));
create policy mem_admin_write on membership
  for all to authenticated
  using (app_is_admin(org_id)) with check (app_is_admin(org_id));

-- ─────────────────────────────────────────────────────────────
-- master_profile
--   read:  члены орг (master — свой; админ — все) ИЛИ публично (anon+auth),
--          если visible_in_search
--   write: сам мастер или админ
-- ─────────────────────────────────────────────────────────────
create policy mp_read_member on master_profile
  for select to authenticated using (app_can_touch(org_id, user_id));
create policy mp_read_public on master_profile
  for select to anon, authenticated using (visible_in_search = true);
create policy mp_write on master_profile
  for all to authenticated
  using (app_can_touch(org_id, user_id)) with check (app_can_touch(org_id, user_id));

-- ─────────────────────────────────────────────────────────────
-- service / availability / gallery — витринные:
--   read member (org+роль) + публичный read, если профиль мастера виден в поиске
--   write — сам мастер или админ
-- ─────────────────────────────────────────────────────────────
-- SERVICE
create policy svc_read_member on service
  for select to authenticated using (app_can_touch(org_id, master_id));
create policy svc_read_public on service
  for select to anon, authenticated
  using (exists (select 1 from master_profile mp
                 where mp.user_id = service.master_id
                   and mp.org_id = service.org_id
                   and mp.visible_in_search = true));
create policy svc_write on service
  for all to authenticated
  using (app_can_touch(org_id, master_id)) with check (app_can_touch(org_id, master_id));

-- AVAILABILITY
create policy av_read_member on availability
  for select to authenticated using (app_can_touch(org_id, master_id));
create policy av_read_public on availability
  for select to anon, authenticated
  using (exists (select 1 from master_profile mp
                 where mp.user_id = availability.master_id
                   and mp.org_id = availability.org_id
                   and mp.visible_in_search = true));
create policy av_write on availability
  for all to authenticated
  using (app_can_touch(org_id, master_id)) with check (app_can_touch(org_id, master_id));

-- GALLERY
create policy gal_read_member on gallery
  for select to authenticated using (app_can_touch(org_id, master_id));
create policy gal_read_public on gallery
  for select to anon, authenticated
  using (exists (select 1 from master_profile mp
                 where mp.user_id = gallery.master_id
                   and mp.org_id = gallery.org_id
                   and mp.visible_in_search = true));
create policy gal_write on gallery
  for all to authenticated
  using (app_can_touch(org_id, master_id)) with check (app_can_touch(org_id, master_id));

-- ─────────────────────────────────────────────────────────────
-- client (ПДн!) — НЕ публичны никогда. Только org+роль.
-- ─────────────────────────────────────────────────────────────
create policy client_rw on client
  for all to authenticated
  using (app_can_touch(org_id, master_id)) with check (app_can_touch(org_id, master_id));

-- ─────────────────────────────────────────────────────────────
-- booking — org+роль. (Публичное создание брони с сайта пойдёт через
-- SECURITY DEFINER RPC/edge function, не через прямой anon-insert.)
-- ─────────────────────────────────────────────────────────────
create policy booking_rw on booking
  for all to authenticated
  using (app_can_touch(org_id, master_id)) with check (app_can_touch(org_id, master_id));

-- ─────────────────────────────────────────────────────────────
-- payment — org+роль (пишет обычно сервер/webhook под service_role,
-- который RLS обходит; здесь — чтение мастером/админом)
-- ─────────────────────────────────────────────────────────────
create policy payment_rw on payment
  for all to authenticated
  using (app_can_touch(org_id, master_id)) with check (app_can_touch(org_id, master_id));

-- ─────────────────────────────────────────────────────────────
-- GRANT'ы. В Supabase выдаются автоматически default-привилегиями;
-- здесь явно, чтобы локальный тест работал под ролями anon/authenticated.
-- Доступ к СТРОКАМ всё равно режет RLS выше — grant лишь на уровне таблицы.
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant execute on function app_is_member(uuid) to anon, authenticated;
grant execute on function app_is_admin(uuid)  to anon, authenticated;
grant execute on function app_can_touch(uuid, uuid) to anon, authenticated;
