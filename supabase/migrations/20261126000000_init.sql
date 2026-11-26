-- AI Resume Roaster schema.
-- The app talks to these tables only from the server with the service role key.
-- Row level security is enabled with no policies, so the public anon key cannot read or write them.

create table if not exists public.users (
  id            text primary key,              -- "<provider>:<provider account id>", e.g. "github:12345"
  name          text,
  email         text,
  image         text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create table if not exists public.roasts (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references public.users (id) on delete cascade,
  file_name    text not null check (char_length(file_name) between 1 and 200),
  resume_text  text not null,
  result       jsonb not null,
  score        integer not null check (score between 0 and 100),
  mode         text not null check (mode in ('ai', 'local')),
  created_at   timestamptz not null default now()
);

create index if not exists roasts_user_created_idx on public.roasts (user_id, created_at desc);

-- Every roast attempt that passes PDF validation is counted, including failed AI calls.
create table if not exists public.roast_attempts (
  id          bigint generated always as identity primary key,
  user_id     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists roast_attempts_user_created_idx on public.roast_attempts (user_id, created_at desc);

alter table public.users enable row level security;
alter table public.roasts enable row level security;
alter table public.roast_attempts enable row level security;

-- Atomically checks the per-user limit and records the attempt if allowed.
-- The advisory lock serialises concurrent requests from the same user.
create or replace function public.claim_roast_attempt(p_user_id text, p_limit integer, p_window_seconds integer)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window interval := make_interval(secs => p_window_seconds);
  v_count  integer;
  v_oldest timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('roast:' || p_user_id));

  delete from roast_attempts where user_id = p_user_id and created_at < now() - interval '1 day';

  select count(*), min(created_at) into v_count, v_oldest
  from roast_attempts
  where user_id = p_user_id and created_at > now() - v_window;

  if v_count >= p_limit then
    return query select false, greatest(1, ceil(extract(epoch from (v_oldest + v_window - now()))))::integer;
    return;
  end if;

  insert into roast_attempts (user_id) values (p_user_id);
  return query select true, 0;
end;
$$;

revoke all on function public.claim_roast_attempt(text, integer, integer) from public, anon, authenticated;
grant execute on function public.claim_roast_attempt(text, integer, integer) to service_role;
