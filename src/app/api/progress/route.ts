import { NextResponse } from 'next/server';
import { db, dbEnabled } from '@/lib/server/db';
import { body, guard, isBody, isCtx, ok } from '@/lib/server/http';
import { gameSchema, progressSchema } from '@/lib/schemas';
import { EMPTY } from '@/lib/game';
import { mergeProgress, type Progress } from '@/lib/progress';

/** Read what is stored for this student; unknown/old rows are coerced to a safe shape. */
async function stored(userId: string): Promise<Progress | null> {
  const rows = await db('select', 'progress', userId, { select: 'done,game', limit: 1 });
  if (!rows) return null;
  const r = rows[0];
  const done = Array.isArray(r?.done) ? (r.done as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  const g = gameSchema.safeParse({ ...EMPTY, ...(r?.game as object) });
  return { done, game: g.success ? g.data : EMPTY };
}

export async function GET() {
  const g = await guard('progress', 60);
  if (!isCtx(g)) return g;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const p = await stored(g.userId);
  return p ? ok({ progress: p }) : NextResponse.json({ ok: false });
}

/** PUT merges instead of overwriting, so two phones can never erase each other's work. */
export async function PUT(req: Request) {
  const g = await guard('progress-save', 40);
  if (!isCtx(g)) return g;
  const b = await body(req, progressSchema, 50_000);
  if (!isBody(b)) return b;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const cur = await stored(g.userId);
  const merged = cur ? mergeProgress(cur, b) : b;
  const r = await db('upsert', 'progress', g.userId, { values: { done: merged.done, game: merged.game, updated_at: new Date().toISOString() } });
  return r ? ok({ progress: merged }) : NextResponse.json({ ok: false });
}
