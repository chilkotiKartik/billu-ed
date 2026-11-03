import { NextResponse } from 'next/server';
import { rpc } from '@/lib/server/db';
import { guard, isCtx, ok } from '@/lib/server/http';

// Opt-in only: students choose a nickname and switch it on. Only nickname + XP are shown.
export async function GET() {
  const g = await guard('leaderboard', 20);
  if (!isCtx(g)) return g;
  const rows = await rpc('edcat_leaderboard', { lim: 50 });
  if (!rows) return NextResponse.json({ ok: false });
  return ok({ items: rows.map((r, i) => ({ rank: i + 1, nick: String(r.nick ?? ''), xp: Number(r.xp ?? 0), me: r.user_id === g.userId })) });
}
