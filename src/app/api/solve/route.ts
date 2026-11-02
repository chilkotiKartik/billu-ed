import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { solve } from '@/lib/solver';
import { lineToSolution } from '@/lib/adapt';

// tiny per-user rate limit (60 solves / minute); fine for ~100 users on one instance
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 60) return NextResponse.json({ error: 'Too many requests, try again in a minute.' }, { status: 429 });
  hits.set(userId, [...recent, now]);
  try {
    const { input } = await req.json();
    return NextResponse.json({ solution: lineToSolution(solve(input)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'Could not solve.' }, { status: 400 });
  }
}
