-- REVIEW-ONLY SQL DRAFT: DO NOT RUN ON PRODUCTION BEFORE PRIVACY, SECURITY,
-- RETENTION AND PREVIEW VALIDATION APPROVAL. Target project: Brand Brain ONLY
-- (campgoqhyvniokwvjvtb), never the separate Affiliate Sandbox.
--
-- After review, create an official migration with Supabase CLI:
--   supabase migration new website_private_feedback
-- and copy the reviewed SQL into the generated migration.

create table public.website_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reason text,
  optional_message text,
  source_page text not null,
  plan_context text not null,
  constraint feedback_reason_known check (
    reason is null or reason in ('price','customer_results','offer_clarity','workflow_fit','ai_control')
  ),
  constraint feedback_comment_valid check (
    optional_message is null or (length(optional_message) between 1 and 1200)
  ),
  constraint feedback_has_content check (
    reason is not null or optional_message is not null
  ),
  constraint feedback_source_path check (
    length(source_page) between 1 and 160
    and source_page ~ '^/[a-zA-Z0-9/_-]*$'
  ),
  constraint feedback_plan_known check (
    plan_context in ('core','enterprise','micro_pilot','general')
  )
);
create index website_feedback_created_at_idx on public.website_feedback (created_at desc);

-- Store only a short-lived pseudonymous, server-HMACed rate key.
-- Never store raw IPs, full referrers, or visitor identifiers.
create table public.website_feedback_rate_limits (
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  hour_bucket timestamptz not null,
  attempts integer not null check (attempts between 1 and 4),
  primary key (fingerprint, hour_bucket)
);

alter table public.website_feedback enable row level security;
alter table public.website_feedback_rate_limits enable row level security;

-- No anonymous/authenticated policies; server-only service role can insert.
revoke all on public.website_feedback from public, anon, authenticated, service_role;
revoke all on public.website_feedback_rate_limits from public, anon, authenticated, service_role;
grant insert on public.website_feedback to service_role;
grant select, insert, update on public.website_feedback_rate_limits to service_role;

-- Atomic throttling and insert in one transaction. SECURITY INVOKER; no bypass
-- for public users. Function cannot be executed by anon or authenticated.
create or replace function public.accept_website_feedback(
  p_reason text,
  p_message text,
  p_source_page text,
  p_plan_context text,
  p_fingerprint text
) returns text
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare v_attempts integer;
begin
  if p_fingerprint is null or p_fingerprint !~ '^[0-9a-f]{64}$'
    or (p_reason is null and p_message is null)
    or (p_reason is not null and p_reason not in ('price','customer_results','offer_clarity','workflow_fit','ai_control'))
    or (p_message is not null and (length(p_message) < 1 or length(p_message) > 1200))
    or p_source_page is null or length(p_source_page) not between 1 and 160
    or p_source_page !~ '^/[a-zA-Z0-9/_-]*$'
    or p_plan_context is null or p_plan_context not in ('core','enterprise','micro_pilot','general')
  then
    return 'invalid';
  end if;

  insert into public.website_feedback_rate_limits (fingerprint, hour_bucket, attempts)
  values (p_fingerprint, date_trunc('hour', now()), 1)
  on conflict (fingerprint, hour_bucket) do update
    set attempts = public.website_feedback_rate_limits.attempts + 1
    where public.website_feedback_rate_limits.attempts < 4
  returning attempts into v_attempts;

  if v_attempts is null then return 'rate_limited'; end if;

  insert into public.website_feedback (reason, optional_message, source_page, plan_context)
  values (p_reason, p_message, p_source_page, p_plan_context);
  return 'stored';
end;
$$;

revoke execute on function public.accept_website_feedback(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.accept_website_feedback(text,text,text,text,text) to service_role;

-- The following cleanup statements MUST be scheduled before public activation.
-- Do not claim a retention period is enforced until the job is operational:
-- delete from public.website_feedback where created_at < now() - interval '90 days';
-- delete from public.website_feedback_rate_limits where hour_bucket < now() - interval '48 hours';
-- Use approved pg_cron or another authenticated scheduled job, and verify execution.
