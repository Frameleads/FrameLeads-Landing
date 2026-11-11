-- LOCAL POSTGRES QA ONLY. Never run this against a hosted project.
-- Requires a disposable local database with the reviewed feedback schema applied.
do $security$
declare
  function_oid oid;
begin
  if (select not relrowsecurity from pg_class where oid='public.website_feedback'::regclass) then
    raise exception 'RLS disabled on website_feedback';
  end if;
  if (select not relrowsecurity from pg_class where oid='public.website_feedback_rate_limits'::regclass) then
    raise exception 'RLS disabled on rate-limit table';
  end if;
  if has_table_privilege('anon','public.website_feedback','select')
    or has_table_privilege('anon','public.website_feedback','insert')
    or has_table_privilege('authenticated','public.website_feedback','select')
    or has_table_privilege('authenticated','public.website_feedback','insert')
    or has_table_privilege('service_role','public.website_feedback','select') then
    raise exception 'Unexpected table privilege';
  end if;
  if not has_table_privilege('service_role','public.website_feedback','insert') then
    raise exception 'Service role cannot store feedback';
  end if;
  if has_table_privilege('anon','public.website_feedback_rate_limits','select')
    or has_table_privilege('authenticated','public.website_feedback_rate_limits','select') then
    raise exception 'Rate keys visible to visitors';
  end if;
  if has_function_privilege('anon','public.accept_website_feedback(text,text,text,text,text)','execute')
    or has_function_privilege('authenticated','public.accept_website_feedback(text,text,text,text,text)','execute') then
    raise exception 'Feedback function publicly executable';
  end if;
  if not has_function_privilege('service_role','public.accept_website_feedback(text,text,text,text,text)','execute') then
    raise exception 'Service role denied function';
  end if;
  select oid into function_oid from pg_proc
   where oid = 'public.accept_website_feedback(text,text,text,text,text)'::regprocedure;
  if (select prosecdef from pg_proc where oid=function_oid) then
    raise exception 'Feedback function must be SECURITY INVOKER';
  end if;
end;
$security$;

set role service_role;

do $checks$
declare
  n int;
  result text;
begin
  for n in 1..4 loop
    select public.accept_website_feedback(
      'price', 'LOCAL TEST ONLY', '/checkout/core', 'core', repeat('a',64)
    ) into result;
    if result <> 'stored' then raise exception 'Expected stored on iteration %, got %',n,result; end if;
  end loop;
  select public.accept_website_feedback(
    'price','LOCAL TEST ONLY','/checkout/core','core',repeat('a',64)
  ) into result;
  if result <> 'rate_limited' then raise exception 'Expected rate_limited, got %',result; end if;
  select public.accept_website_feedback(
    'other', null, '/checkout/core','core', repeat('b',64)
  ) into result;
  if result <> 'invalid' then raise exception 'Unknown reason accepted: %',result; end if;
  select public.accept_website_feedback(
    null, 'A separate free-text concern', '/checkout/enterprise','enterprise',repeat('c',64)
  ) into result;
  if result <> 'stored' then raise exception 'Free-text-only entry failed: %',result; end if;
end;
$checks$;

reset role;
do $readback$
declare
  expected integer;
  freeform integer;
begin
  select count(*) into expected from public.website_feedback
   where source_page='/checkout/core' and plan_context='core' and reason='price'
     and optional_message='LOCAL TEST ONLY';
  if expected <> 4 then raise exception 'Readback expected 4 core rows, got %',expected; end if;
  select count(*) into freeform from public.website_feedback
   where source_page='/checkout/enterprise' and plan_context='enterprise' and reason is null
     and optional_message='A separate free-text concern';
  if freeform <> 1 then raise exception 'Readback expected 1 freeform entry, got %',freeform; end if;
  if (select max(created_at) from public.website_feedback) < now() - interval '5 minutes' then
    raise exception 'Server timestamp failed';
  end if;
end;
$readback$;
select 'PASS: local feedback RLS, grants, rate-limiting, validation, and private readback' as result;
