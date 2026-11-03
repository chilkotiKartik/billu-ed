// Fixed-window rate limiter shared across serverless instances.
// With UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN it uses Redis; otherwise it falls back to
// per-instance memory (fine for local development, weaker on Vercel).
const mem = new Map<string, { n: number; reset: number }>();

async function redis(cmds: (string | number)[][]): Promise<unknown[] | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const r = await fetch(`${url}/pipeline`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(cmds), cache: 'no-store' });
    if (!r.ok) return null;
    return ((await r.json()) as { result: unknown }[]).map((x) => x.result);
  } catch {
    return null;
  }
}

/** Returns true when the call is allowed. */
export async function allow(key: string, limit: number, windowSec = 60): Promise<boolean> {
  const bucket = `rl:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`;
  const res = await redis([['INCR', bucket], ['EXPIRE', bucket, windowSec + 5]]);
  if (res) return Number(res[0]) <= limit;
  const now = Date.now();
  const e = mem.get(key);
  if (!e || e.reset < now) {
    if (mem.size > 5000) for (const [k, v] of mem) if (v.reset < now) mem.delete(k);
    mem.set(key, { n: 1, reset: now + windowSec * 1000 });
    return true;
  }
  e.n += 1;
  return e.n <= limit;
}
