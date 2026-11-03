import { NextResponse } from 'next/server';
import { db, dbEnabled } from '@/lib/server/db';
import { body, fail, guard, isBody, isCtx, ok } from '@/lib/server/http';
import { saveSheetSchema } from '@/lib/schemas';

const MAX_SHEETS = 100;

// ok:false with no error tells the app to keep the student's sheets on their own device instead
export async function GET() {
  const g = await guard('sheets', 60);
  if (!isCtx(g)) return g;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const rows = await db('select', 'sheets', g.userId, { select: 'id,title,input,created_at', order: 'created_at.desc', limit: 50 });
  return rows ? ok({ items: rows }) : NextResponse.json({ ok: false });
}

export async function POST(req: Request) {
  const g = await guard('sheets-save', 20);
  if (!isCtx(g)) return g;
  const b = await body(req, saveSheetSchema, 20_000);
  if (!isBody(b)) return b;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const have = await db('select', 'sheets', g.userId, { select: 'id', limit: MAX_SHEETS });
  if (have && have.length >= MAX_SHEETS) return fail(`You can keep ${MAX_SHEETS} sheets. Delete an old one first.`, 409);
  const r = await db('insert', 'sheets', g.userId, { values: { title: b.title, input: b.input } });
  return r ? ok() : NextResponse.json({ ok: false });
}
