import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, dbEnabled, type Table } from '@/lib/server/db';
import { fail, guard, isCtx } from '@/lib/server/http';

const TABLES: Table[] = ['sheets', 'profiles', 'progress', 'feedback'];

/** Download everything stored about me as JSON. */
export async function GET() {
  const g = await guard('account', 5);
  if (!isCtx(g)) return g;
  const out: Record<string, unknown> = { userId: g.userId, exportedAt: new Date().toISOString() };
  if (dbEnabled()) for (const t of TABLES) out[t] = (await db('select', t, g.userId, { limit: 200 })) ?? [];
  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: { 'content-type': 'application/json', 'content-disposition': 'attachment; filename="ed-cat-my-data.json"', 'cache-control': 'no-store' },
  });
}

/** Delete all my data and my sign-in account. Requires { confirm: "DELETE" }. */
export async function DELETE(req: Request) {
  const g = await guard('account', 5);
  if (!isCtx(g)) return g;
  const b = (await req.json().catch(() => null)) as { confirm?: string } | null;
  if (b?.confirm !== 'DELETE') return fail('Type DELETE to confirm.');
  if (dbEnabled()) {
    for (const t of TABLES) {
      if ((await db('delete', t, g.userId)) === null) return fail('Could not delete your data right now. Nothing was removed from your sign-in account; please try again.', 503);
    }
  }
  try {
    await (await clerkClient()).users.deleteUser(g.userId);
  } catch {
    return fail('Your data was deleted, but the sign-in account could not be removed. Please try again.', 502);
  }
  return NextResponse.json({ ok: true });
}
