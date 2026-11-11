#!/usr/bin/env bash
set -euo pipefail
# LOCAL ONLY: no cloud databases, Vercel projects, or production writes.
# Run from repo root with Docker Desktop/Engine installed and running.
cd "$(dirname "$0")/.."
command -v docker >/dev/null || { echo "Docker not installed; stopped safely." >&2; exit 2; }
docker info >/dev/null 2>&1 || { echo "Docker is not running; stopped safely." >&2; exit 2; }
IMAGE="${FEEDBACK_TEST_PG_IMAGE:-postgres:17-alpine}"
CONTAINER="frameleads-feedback-qa-$$"
cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
# No network, no persistent volume, no host port: data disappears when container stops.
docker run --rm -d --name "$CONTAINER" --network none -e POSTGRES_HOST_AUTH_METHOD=trust "$IMAGE" >/dev/null
ready=0
for _ in $(seq 1 50); do
  if docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 0.3
done
if [[ "$ready" -ne 1 ]]; then echo "Local PostgreSQL failed to start" >&2; exit 1; fi
db() { docker exec -i "$CONTAINER" psql -X -v ON_ERROR_STOP=1 -q -U postgres -d postgres "$@"; }
echo "1. Create Supabase-like database roles in disposable local PostgreSQL"
db <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
SQL
echo "2. Execute exactly the checked-in review-only schema in LOCAL PostgreSQL"
db < docs/feedback-phase2-schema-DRAFT.sql
echo "3. Verify grants, RLS, stored submissions, invalid input, and rate limiting"
db < tests/feedback-local-security.sql
echo "4. Test concurrent submissions against a single hourly limit"
fingerprint="$(printf "d%.0s" {1..64})"
for i in $(seq 1 10); do
  {
    docker exec "$CONTAINER" psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres \
      -c "set role service_role; select public.accept_website_feedback('price',null,'/','core','$fingerprint');" >/dev/null
  } &
done
wait
count="$(db -At -c "select count(*) from public.website_feedback where reason = 'price' and source_page = '/' and plan_context = 'core';" | tr -d "[:space:]")"
if [[ "$count" != "4" ]]; then echo "FAIL: concurrent writes=$count, expected exactly 4" >&2; exit 1; fi
echo "5. Read back private rows, then dispose the entire test database"
db -At -c "select count(*) from public.website_feedback;"
echo "PASS: local PostgreSQL schema, access rules, validation, throttle and concurrency"
