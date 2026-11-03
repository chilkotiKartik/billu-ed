import { NextResponse } from 'next/server';
import { db, dbEnabled } from '@/lib/server/db';
import { body, guard, isBody, isCtx, ok } from '@/lib/server/http';
import { feedbackSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  const g = await guard('feedback', 5);
  if (!isCtx(g)) return g;
  const b = await body(req, feedbackSchema, 4_000);
  if (!isBody(b)) return b;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const r = await db('insert', 'feedback', g.userId, { values: { question_id: b.questionId ?? null, step: b.step ?? null, kind: b.kind, message: b.message } });
  return r ? ok() : NextResponse.json({ ok: false });
}
