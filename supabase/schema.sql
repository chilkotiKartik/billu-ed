-- Run once in Supabase SQL editor.
create table if not exists public.sheets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  input jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists sheets_user_idx on public.sheets (user_id, created_at desc);
-- RLS on with no policies: only the server (service role key) can read/write.
alter table public.sheets enable row level security;
