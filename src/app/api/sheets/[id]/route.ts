import { NextResponse } from 'next/server';
import { db, dbEnabled } from '@/lib/server/db';
import { body, fail, guard, isBody, isCtx, ok } from '@/lib/server/http';
import { renameSheetSchema } from '@/lib/schemas';

const UUID = /^[0-9a-f-]{36}$/i;
type P = { params: Promise<{ id: string }> };

export async function DELETE(_: Request, { params }: P) {
  const g = await guard('sheets-write', 30);
  if (!isCtx(g)) return g;
  const { id } = await params;
  if (!UUID.test(id)) return fail('Bad id.');
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const r = await db('delete', 'sheets', g.userId, { match: { id } });
  return r ? ok() : NextResponse.json({ ok: false });
}

export async function PATCH(req: Request, { params }: P) {
  const g = await guard('sheets-write', 30);
  if (!isCtx(g)) return g;
  const { id } = await params;
  if (!UUID.test(id)) return fail('Bad id.');
  const b = await body(req, renameSheetSchema, 2_000);
  if (!isBody(b)) return b;
  if (!dbEnabled()) return NextResponse.json({ ok: false });
  const r = await db('update', 'sheets', g.userId, { match: { id }, values: { title: b.title } });
  return r ? ok() : NextResponse.json({ ok: false });
}
