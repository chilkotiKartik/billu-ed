import { NextResponse } from 'next/server';
import { dbEnabled } from '@/lib/server/db';
import { geminiEnabled } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

// Public, no secrets: lets an uptime monitor (and you) see which optional features are switched on.
export function GET() {
  return NextResponse.json({ ok: true, db: dbEnabled(), ai: geminiEnabled(), youtube: !!process.env.YOUTUBE_API_KEY, redis: !!process.env.UPSTASH_REDIS_REST_URL });
}
