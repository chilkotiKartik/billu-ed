import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { askGemini, geminiEnabled } from '@/lib/gemini';

const hits = new Map<string, number[]>();

// Fallback reader: only called when the rule-based parser could not find every value.
export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  if (!geminiEnabled()) return NextResponse.json({ ok: false });
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 15) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  hits.set(userId, [...recent, now]);
  try {
    const { text, image } = (await req.json()) as { text?: string; image?: string };
    if (!text && !image) return NextResponse.json({ ok: false }, { status: 400 });
    if ((text?.length ?? 0) > 2000 || (image?.length ?? 0) > 2_500_000) return NextResponse.json({ ok: false, error: 'Too large' }, { status: 413 });
    return NextResponse.json({ ok: true, input: await askGemini(text ?? '', image) });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
