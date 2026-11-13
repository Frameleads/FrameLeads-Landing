import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/20261111201831_website_feedback_retention.sql', import.meta.url),
  'utf8',
);

test('retention migration reuses installed Cron and only schedules feedback cleanup', () => {
  assert.doesNotMatch(migration, /create\s+extension|\bgrant\b|cron\.unschedule/i);
  assert.match(migration, /cron\.schedule\(\s*'feedback-delete-expired-submissions',\s*'0 \* \* \* \*'/);
  assert.match(migration, /delete from public\.website_feedback where created_at < now\(\) - interval '90 days'/);
  assert.match(migration, /cron\.schedule\(\s*'feedback-delete-expired-rate-limits',\s*'5 \* \* \* \*'/);
  assert.match(migration, /delete from public\.website_feedback_rate_limits where hour_bucket < now\(\) - interval '48 hours'/);
  assert.equal((migration.match(/cron\.schedule\(/g) ?? []).length, 2);
  assert.doesNotMatch(migration, /cron\.job|cron\.unschedule/);
});
