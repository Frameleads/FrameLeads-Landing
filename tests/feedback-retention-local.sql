-- LOCAL POSTGRES ONLY: synthetic retention boundary checks.
-- Run after the feedback schema and security tests in a disposable database.
begin;

insert into public.website_feedback
  (created_at, reason, optional_message, source_page, plan_context)
values
  (now() - interval '91 days', 'customer_results', 'retention-expired-feedback', '/', 'general'),
  (now() - interval '89 days', 'customer_results', 'retention-recent-feedback', '/', 'general');

insert into public.website_feedback_rate_limits (fingerprint, hour_bucket, attempts)
values
  (repeat('e', 64), now() - interval '49 hours', 1),
  (repeat('f', 64), now() - interval '47 hours', 1);

-- Match the cleanup predicates from the prepared Supabase Cron migration.
delete from public.website_feedback
where created_at < now() - interval '90 days';

delete from public.website_feedback_rate_limits
where hour_bucket < now() - interval '48 hours';

do $retention_checks$
begin
  if exists (select 1 from public.website_feedback where optional_message = 'retention-expired-feedback') then
    raise exception 'Expired feedback was not deleted';
  end if;
  if not exists (select 1 from public.website_feedback where optional_message = 'retention-recent-feedback') then
    raise exception 'Recent feedback was incorrectly deleted';
  end if;
  if exists (select 1 from public.website_feedback_rate_limits where fingerprint = repeat('e', 64)) then
    raise exception 'Expired rate-limit record was not deleted';
  end if;
  if not exists (select 1 from public.website_feedback_rate_limits where fingerprint = repeat('f', 64)) then
    raise exception 'Recent rate-limit record was incorrectly deleted';
  end if;
end;
$retention_checks$;

rollback;
select 'PASS: expired rows deleted and recent rows retained for both tables' as result;
