// Supabase edge function (deploy with verify_jwt = false).
// Set the secret once:  supabase secrets set EDCAT_FN_TOKEN=<long random string>
// and put the same value in Vercel as EDCAT_FN_TOKEN. The function refuses to run without it.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const TOKEN = Deno.env.get('EDCAT_FN_TOKEN');
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const TABLES = new Set(['sheets', 'profiles', 'progress', 'feedback']);
const COL = /^[a-z_]{1,30}$/;
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req) => {
  if (!TOKEN || TOKEN.length < 24 || TOKEN === 'CHANGE_ME') return json({ ok: false, error: 'EDCAT_FN_TOKEN is not configured' }, 500);
  if (req.method !== 'POST') return json({ ok: false }, 405);
  if (!safeEqual(req.headers.get('x-edcat-token') ?? '', TOKEN)) return json({ ok: false }, 401);

  const body = await req.json();
  if (body.op === 'rpc') {
    if (body.name !== 'edcat_leaderboard') return json({ ok: false }, 400);
    const { data, error } = await db.rpc('edcat_leaderboard', { lim: Math.min(Number(body.args?.lim) || 20, 100) });
    return error ? json({ ok: false }, 500) : json({ ok: true, data });
  }
  const { op, table, userId, match = {}, values = {}, select = '*', order, limit = 50 } = body;
  if (typeof userId !== 'string' || !userId || !TABLES.has(table)) return json({ ok: false }, 400);
  for (const k of Object.keys(match)) if (!COL.test(k)) return json({ ok: false }, 400);

  const scope = <T extends { eq: (c: string, v: unknown) => T }>(q: T) => Object.entries(match).reduce((a, [k, v]) => a.eq(k, v), q.eq('user_id', userId));

  if (op === 'select') {
    let q = scope(db.from(table).select(/^[a-z_,*]+$/.test(select) ? select : '*'));
    if (typeof order === 'string' && /^[a-z_]+\.(asc|desc)$/.test(order)) { const [c, d] = order.split('.'); q = q.order(c, { ascending: d === 'asc' }); }
    const { data, error } = await q.limit(Math.min(Number(limit) || 50, 200));
    return error ? json({ ok: false }, 500) : json({ ok: true, data });
  }
  if (op === 'insert') {
    const { error } = await db.from(table).insert({ ...values, user_id: userId });
    return error ? json({ ok: false }, 500) : json({ ok: true, data: [] });
  }
  if (op === 'upsert') {
    const { error } = await db.from(table).upsert({ ...values, user_id: userId }, { onConflict: 'user_id' });
    return error ? json({ ok: false }, 500) : json({ ok: true, data: [] });
  }
  if (op === 'update') {
    const { error } = await scope(db.from(table).update(values));
    return error ? json({ ok: false }, 500) : json({ ok: true, data: [] });
  }
  if (op === 'delete') {
    const { error } = await scope(db.from(table).delete());
    return error ? json({ ok: false }, 500) : json({ ok: true, data: [] });
  }
  return json({ ok: false }, 400);
});
