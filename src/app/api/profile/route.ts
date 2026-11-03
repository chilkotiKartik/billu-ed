import { NextResponse } from 'next/server';
import { db, dbEnabled } from '@/lib/server/db';
import { body, guard, isBody, isCtx, ok } from '@/lib/server/http';
import { profileSchema } from '@/lib/schemas';

export async function GET() {
  const g = await guard('profile', 60);
  if (!isCtx(g)) return g;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const rows = await db('select', 'profiles', g.userId, { select: 'name,roll', limit: 1 });
  if (!rows) return NextResponse.json({ ok: false });
  const r = rows[0];
  return ok({ profile: { name: String(r?.name ?? ''), roll: String(r?.roll ?? '') } });
}

export async function PUT(req: Request) {
  const g = await guard('profile-save', 20);
  if (!isCtx(g)) return g;
  const b = await body(req, profileSchema, 2_000);
  if (!isBody(b)) return b;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const r = await db('upsert', 'profiles', g.userId, { values: { name: b.name, roll: b.roll, updated_at: new Date().toISOString() } });
  return r ? ok() : NextResponse.json({ ok: false });
}
