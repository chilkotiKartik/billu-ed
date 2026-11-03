-- Opt-in leaderboard. Safe to re-run.
alter table public.profiles add column if not exists nick text not null default '' check (char_length(nick) <= 24);
alter table public.profiles add column if not exists on_board boolean not null default false;

-- Only students who opted in are listed, only nickname + XP leave the database.
create or replace function public.edcat_leaderboard(lim int default 20)
returns table (nick text, xp int, user_id text)
language sql stable security definer set search_path = public as $$
  select p.nick, coalesce((g.game->>'xp')::int, 0) as xp, p.user_id
  from public.profiles p join public.progress g on g.user_id = p.user_id
  where p.on_board and p.nick <> ''
  order by xp desc, g.updated_at asc
  limit least(greatest(lim, 1), 100);
$$;
revoke all on function public.edcat_leaderboard(int) from public, anon, authenticated;
