-- 0013_delete_account.sql — удаление аккаунта пользователем (App Store / Google Play требуют).
-- Необратимо удаляет все данные текущего auth.uid() и сам вход.
--
-- Каскады (0001): почти всё ссылается на app_user(id) / organization(id) on delete cascade.
-- Стратегия:
--   1) удалить организации, где пользователь единственный owner/admin (solo-мастер
--      или салон без других активных участников) → каскад чистит услуги, график,
--      клиентов, брони, платежи, галерею, отзывы, подписку, членства этой орг.;
--   2) удалить app_user → каскад чистит telegram-связь, избранное, членства в чужих
--      орг., и обнуляет client.user_id там, где пользователь был клиентом;
--   3) удалить строку auth.users → вход исчезает (email/анонимную сессию нельзя восстановить).

create or replace function delete_my_account() returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- 1. Организации, которыми пользователь управляет и где нет других активных участников.
  delete from organization o
   where exists (
           select 1 from membership m
            where m.org_id = o.id and m.user_id = uid and m.role in ('owner', 'admin')
         )
     and not exists (
           select 1 from membership m2
            where m2.org_id = o.id and m2.user_id <> uid and m2.status = 'active'
         );

  -- 2. Профиль аккаунта → каскад на всё, что ссылается на app_user.
  delete from app_user where id = uid;

  -- 3. Сам вход. security definer выполняется от владельца функции (postgres),
  --    поэтому имеет право удалить строку из auth.users.
  delete from auth.users where id = uid;
end;
$$;

grant execute on function delete_my_account() to authenticated;
