#!/usr/bin/env bash
# Поднимает временный локальный Postgres, применяет миграции и гоняет
# тест изоляции «чужой не видит чужого». Всё локально и эфемерно, без облака.
#
# Использование:  bash supabase/tests/run_isolation_test.sh
# Требует локальный postgres (initdb/pg_ctl); в CI ставится пакетом postgresql.
# Postgres нельзя запускать под root — если вы root, скрипт сам делегирует
# запуск непривилегированному пользователю $PG_TEST_USER (по умолчанию pgtest).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
PG_TEST_USER="${PG_TEST_USER:-pgtest}"

# Под root Postgres не стартует: пересобираем supabase/ во временную папку,
# отдаём непривилегированному пользователю и перезапускаем скрипт от его имени.
if [ "$(id -u)" = "0" ]; then
  id "$PG_TEST_USER" >/dev/null 2>&1 || useradd -m "$PG_TEST_USER"
  TMP="$(mktemp -d)"
  cp -r "$ROOT/supabase" "$TMP/supabase"
  cp "$0" "$TMP/run.sh"
  chown -R "$PG_TEST_USER":"$PG_TEST_USER" "$TMP"
  exec su -s /bin/bash "$PG_TEST_USER" -c "NAVBAR_ROOT='$TMP' bash '$TMP/run.sh'"
fi

# Корень с миграциями: либо переданный из root-ветки, либо репозиторий.
SUPA="${NAVBAR_ROOT:+$NAVBAR_ROOT/supabase}"
SUPA="${SUPA:-$ROOT/supabase}"

PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -1 || true)"
export PATH="${PGBIN:+$PGBIN:}$PATH"

WORK="$(mktemp -d)"
PGDATA="$WORK/data"; SOCK="$WORK/sock"; mkdir -p "$SOCK"
cleanup() { pg_ctl -D "$PGDATA" -mimmediate stop >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

echo "→ initdb";        initdb -D "$PGDATA" -U postgres --auth=trust >/dev/null
echo "→ start postgres"; pg_ctl -D "$PGDATA" -o "-c listen_addresses='' -k $SOCK" -w start >/dev/null
createdb -h "$SOCK" -U postgres navbar_test

run()  { psql -v ON_ERROR_STOP=1 -h "$SOCK" -U postgres -d navbar_test -q -f "$1"; }
show() { psql -v ON_ERROR_STOP=1 -h "$SOCK" -U postgres -d navbar_test    -f "$1"; }

echo "→ apply 0001_schema.sql";     run  "$SUPA/migrations/0001_schema.sql"
echo "→ apply 0002_rls.sql";        run  "$SUPA/migrations/0002_rls.sql"
echo "→ apply 0003_public_rpc.sql"; run  "$SUPA/migrations/0003_public_rpc.sql"
echo "→ run isolation_test.sql";    show "$SUPA/tests/isolation_test.sql"
echo "→ apply seed.sql";            run  "$SUPA/seed.sql"
echo "→ run rpc_test.sql";          show "$SUPA/tests/rpc_test.sql"

echo "✓ OK"
