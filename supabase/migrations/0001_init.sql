-- ED Cat schema. Apply with `supabase db push` or paste into the SQL editor (safe to re-run).
-- The app talks to the database only from the server (service role / edge function) and always
-- filters by the Clerk user id, so RLS is ON with NO policies: browsers and anon keys get nothing.

create table if not exists public.sheets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null check (char_length(title) between 1 and 120),
  input jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists sheets_user_idx on public.sheets (user_id, created_at desc);

create table if not exists public.profiles (
  user_id text primary key,
  name text not null default '' check (char_length(name) <= 60),
  roll text not null default '' check (char_length(roll) <= 30),
  updated_at timestamptz not null default now()
);

-- One row per student: finished questions plus the game state (xp, streak, badges counters).
create table if not exists public.progress (
  user_id text primary key,
  done jsonb not null default '[]'::jsonb,
  game jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  question_id text,
  step int,
  kind text not null check (kind in ('wrong-step','unclear','idea','bug')),
  message text not null check (char_length(message) between 3 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists feedback_created_idx on public.feedback (created_at desc);

alter table public.sheets   enable row level security;
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.feedback enable row level security;
