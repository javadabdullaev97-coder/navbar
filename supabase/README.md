# Supabase — схема, RLS, тесты (Wave 0)

Бэкенд Navbar по [CLAUDE.md §5](../CLAUDE.md) и [app-spec.md](../app-spec.md).

```
migrations/
  0001_schema.sql   — таблицы: app_user, organization, subscription, membership,
                      master_profile, service, availability, client, booking, payment, gallery
  0002_rls.sql      — Row Level Security по «организация + роль» + GRANT'ы
tests/
  isolation_test.sql        — «чужой не видит чужого» (6 проверок)
  run_isolation_test.sh     — поднимает локальный Postgres и гоняет тест
```

## Модель безопасности (RLS)

Первая линия обороны — RLS на **каждой** таблице (§4). Правило (§5):

| Роль          | Что видит                                            |
|---------------|------------------------------------------------------|
| `master`      | только свои строки (`master_id = auth.uid()`)        |
| `owner`/`admin` | все строки своей организации (`org_id`)            |
| `anon`        | только публичную витрину мастера с `visible_in_search=true` |

- **ПДн клиентов (`client`) не публичны никогда** — только org+роль (§7).
- **Публичная запись работает всегда**: витрина (`master_profile`, `service`, `availability`, `gallery`) читается анонимно, если мастер виден в поиске. Само создание брони с сайта пойдёт через `SECURITY DEFINER` RPC / edge function, не прямым anon-insert.
- Хелперы `app_is_member` / `app_is_admin` / `app_can_touch` — `SECURITY DEFINER`, чтобы читать `membership` без рекурсии политик.

## Запуск теста изоляции локально

```bash
bash supabase/tests/run_isolation_test.sh
```

Скрипт создаёт эфемерный Postgres, применяет обе миграции и прогоняет
`isolation_test.sql`. Ожидаемый финал:

```
  ISOLATION TEST PASSED — 6/6 проверок ✓
```

Проверяется: мастер A не видит данные мастера B; нельзя писать в чужую
организацию; админ салона видит своих мастеров, но не чужие орг; аноним не
видит ПДн, но видит публичную витрину и не видит скрытую.

## Применение к реальному проекту Supabase

`supabase/migrations/*.sql` совместимы с Supabase (блок совместимости в 0001
на реальном проекте — no-op: `auth.uid()` и роли уже есть). Применить:

```bash
supabase db push          # через Supabase CLI, или
psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_schema.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/0002_rls.sql
```

Ключи — из `.env` (см. `.env.example`). Service-role-ключ только на сервере (§9).
