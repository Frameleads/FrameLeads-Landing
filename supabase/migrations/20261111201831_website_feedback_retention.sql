-- Generated with Supabase CLI `supabase migration new website_feedback_retention`.
-- Separate, unapplied migration: requires owner/privacy/security review before activation.
-- Supabase Cron is already installed in pg_catalog. This schedules hourly deletion
-- once approved and applied. Reusing these names updates only these two jobs.

begin;

-- Supabase Cron upserts a job with the same name, without touching other jobs.
select cron.schedule(
  'feedback-delete-expired-submissions',
  '0 * * * *',
  $job$delete from public.website_feedback where created_at < now() - interval '90 days';$job$
);

select cron.schedule(
  'feedback-delete-expired-rate-limits',
  '5 * * * *',
  $job$delete from public.website_feedback_rate_limits where hour_bucket < now() - interval '48 hours';$job$
);

commit;
