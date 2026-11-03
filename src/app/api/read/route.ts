import { NextResponse } from 'next/server';
import { askGemini, geminiEnabled } from '@/lib/gemini';
import { readSchema } from '@/lib/schemas';
import { body, fail, guard, isBody, isCtx } from '@/lib/server/http';

// Fallback reader: only called when the rule-based parser could not find every value.
export async function POST(req: Request) {
  const g = await guard('read', 15);
  if (!isCtx(g)) return g;
  if (!geminiEnabled()) return NextResponse.json({ ok: false });
  const b = await body(req, readSchema, 3_500_000);
  if (!isBody(b)) return b;
  if (!b.text && !b.image) return fail('Nothing to read.');
  try {
    return NextResponse.json({ ok: true, input: await askGemini(b.text ?? '', b.image) });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
