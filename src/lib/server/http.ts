import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';
import { allow } from './ratelimit';

export const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
export const ok = <T extends object>(body: T = {} as T) => NextResponse.json({ ok: true, ...body });

type Ctx = { userId: string };

/**
 * Auth + rate limit in one place. `name` and `limit` (per minute) keep each route's budget separate.
 * With `publicIp: true` signed-out visitors are allowed too and are limited by IP instead.
 */
export async function guard(name: string, limit: number, opts: { publicIp?: boolean; req?: Request } = {}): Promise<Ctx | NextResponse> {
  const { userId } = await auth();
  let who = userId;
  if (!who) {
    if (!opts.publicIp) return fail('Please sign in.', 401);
    who = `ip:${(opts.req?.headers.get('x-forwarded-for') || 'anon').split(',')[0].trim()}`;
  }
  if (!(await allow(`${name}:${who}`, limit))) return fail('Too many requests, try again in a minute.', 429);
  return { userId: who };
}
export const isCtx = (x: Ctx | NextResponse): x is Ctx => !(x instanceof NextResponse);

/** Parse and validate a JSON body. Returns the data or a ready 400/413 response. */
export async function body<T>(req: Request, schema: ZodType<T>, maxBytes = 3_000_000): Promise<T | NextResponse> {
  const len = Number(req.headers.get('content-length') || 0);
  if (len > maxBytes) return fail('Request too large.', 413);
  let raw: unknown;
  try { raw = await req.json(); } catch { return fail('Invalid JSON.'); }
  const p = schema.safeParse(raw);
  if (!p.success) return fail(p.error.issues[0]?.message ? `Invalid input: ${p.error.issues[0].path.join('.') || 'body'}` : 'Invalid input.');
  return p.data;
}
export const isBody = <T,>(x: T | NextResponse): x is T => !(x instanceof NextResponse);
