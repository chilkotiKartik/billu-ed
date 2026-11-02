import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { validate } from '@/lib/solver';
import type { LineInput } from '@/lib/types';

const url = process.env.SUPABASE_URL;
const fnToken = process.env.EDCAT_FN_TOKEN; // preferred: a Supabase edge function holds the database key
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // alternative: direct REST with the service-role key

async function fn(body: unknown) {
  const r = await fetch(`${url}/functions/v1/edcat-sheets`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-edcat-token': fnToken! }, body: JSON.stringify(body), cache: 'no-store' });
  return r.ok ? await r.json() : { ok: false };
}
const rest = () => ({ apikey: key!, Authorization: `Bearer ${key}`, 'content-type': 'application/json' });

// ok:false tells the app to keep the student's sheets on their own device instead
export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  if (!url || !(fnToken || key)) return NextResponse.json({ ok: false });
  if (fnToken) return NextResponse.json(await fn({ action: 'list', userId }));
  const r = await fetch(`${url}/rest/v1/sheets?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=50&select=id,title,input,created_at`, { headers: rest(), cache: 'no-store' });
  if (!r.ok) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, items: await r.json() });
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  if (!url || !(fnToken || key)) return NextResponse.json({ ok: false });
  const { title, input } = (await req.json()) as { title: string; input: LineInput };
  if (typeof title !== 'string' || validate(input)) return NextResponse.json({ ok: false, error: 'Invalid sheet' }, { status: 400 });
  if (fnToken) return NextResponse.json(await fn({ action: 'save', userId, title, input }));
  const r = await fetch(`${url}/rest/v1/sheets`, { method: 'POST', headers: { ...rest(), Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: userId, title: title.slice(0, 120), input }) });
  return NextResponse.json({ ok: r.ok });
}
