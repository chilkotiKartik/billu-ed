import { NextResponse } from 'next/server';
import { db, dbEnabled } from '@/lib/server/db';
import { body, guard, isBody, isCtx, ok } from '@/lib/server/http';
import { profileSchema } from '@/lib/schemas';

export async function GET() {
  const g = await guard('profile', 60);
  if (!isCtx(g)) return g;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const rows = (await db('select', 'profiles', g.userId, { select: 'name,roll,nick,on_board', limit: 1 }))
    ?? (await db('select', 'profiles', g.userId, { select: 'name,roll', limit: 1 })); // before migration 0002
  if (!rows) return NextResponse.json({ ok: false });
  const r = rows[0] ?? {};
  return ok({ profile: { name: String(r.name ?? ''), roll: String(r.roll ?? ''), nick: String(r.nick ?? ''), onBoard: r.on_board === true } });
}

export async function PUT(req: Request) {
  const g = await guard('profile-save', 20);
  if (!isCtx(g)) return g;
  const b = await body(req, profileSchema, 2_000);
  if (!isBody(b)) return b;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const base = { name: b.name, roll: b.roll, updated_at: new Date().toISOString() };
  const r = (await db('upsert', 'profiles', g.userId, { values: { ...base, nick: b.nick, on_board: b.onBoard && b.nick.length > 0 } }))
    ?? (await db('upsert', 'profiles', g.userId, { values: base })); // before migration 0002
  return r ? ok() : NextResponse.json({ ok: false });
}
