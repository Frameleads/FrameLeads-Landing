-- Generated with Supabase CLI `supabase migration new website_feedback_retention`.
-- Separate, unapplied migration: requires owner/privacy/security review before activation.
-- Supabase Cron uses the pg_cron extension. This schedules hourly deletion once applied.
-- Jobs run as the role that schedules them; apply using the approved postgres role.

begin;

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Remove any same-named jobs first so reapplication is deterministic.
select cron.unschedule(jobid)
from cron.job
where jobname in ('feedback-delete-expired-submissions', 'feedback-delete-expired-rate-limits');

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
