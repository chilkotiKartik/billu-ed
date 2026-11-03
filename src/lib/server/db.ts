// One small database client with two transports:
//  1. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  -> PostgREST directly
//  2. SUPABASE_URL + EDCAT_FN_TOKEN             -> the `edcat-sheets` edge function (key never leaves Supabase)
// Every call is scoped to one user_id, and only whitelisted tables are reachable.
export type Table = 'sheets' | 'profiles' | 'progress' | 'feedback';
type Row = Record<string, unknown>;
interface Opts { match?: Row; values?: Row; select?: string; order?: string; limit?: number }
type Op = 'select' | 'insert' | 'upsert' | 'update' | 'delete';

const url = () => process.env.SUPABASE_URL?.replace(/\/$/, '');
const fnToken = () => process.env.EDCAT_FN_TOKEN;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY;
export const dbEnabled = () => !!url() && !!(fnToken() || key());

const ID = /^[A-Za-z0-9_.:-]{1,80}$/;
const COL = /^[a-z_]{1,30}$/;

async function viaFunction(op: Op, table: Table, userId: string, o: Opts): Promise<Row[] | null> {
  const r = await fetch(`${url()}/functions/v1/edcat-sheets`, {
    method: 'POST', cache: 'no-store',
    headers: { 'content-type': 'application/json', 'x-edcat-token': fnToken()! },
    body: JSON.stringify({ op, table, userId, ...o }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.ok ? ((j.data as Row[]) ?? []) : null;
}

async function viaRest(op: Op, table: Table, userId: string, o: Opts): Promise<Row[] | null> {
  const p = new URLSearchParams();
  if (op !== 'insert' && op !== 'upsert') p.set('user_id', `eq.${userId}`);
  for (const [k, v] of Object.entries(o.match ?? {})) { if (COL.test(k)) p.set(k, `eq.${String(v)}`); }
  if (op === 'select') {
    p.set('select', o.select && /^[a-z_,]+$/.test(o.select) ? o.select : '*');
    if (o.order && /^[a-z_]+\.(asc|desc)$/.test(o.order)) p.set('order', o.order);
    if (o.limit) p.set('limit', String(Math.min(o.limit, 200)));
  }
  if (op === 'upsert') p.set('on_conflict', 'user_id');
  const headers: Record<string, string> = { apikey: key()!, Authorization: `Bearer ${key()}`, 'content-type': 'application/json' };
  const method = { select: 'GET', insert: 'POST', upsert: 'POST', update: 'PATCH', delete: 'DELETE' }[op];
  headers.Prefer = op === 'upsert' ? 'resolution=merge-duplicates,return=minimal' : op === 'select' ? 'count=none' : 'return=minimal';
  const payload = op === 'insert' || op === 'upsert' ? { ...o.values, user_id: userId } : op === 'update' ? o.values : undefined;
  const r = await fetch(`${url()}/rest/v1/${table}?${p}`, { method, headers, body: payload ? JSON.stringify(payload) : undefined, cache: 'no-store' });
  if (!r.ok) return null;
  return op === 'select' ? ((await r.json()) as Row[]) : [];
}

/** Whitelisted read-only database functions that look across users (e.g. the opt-in leaderboard). */
export async function rpc(name: 'edcat_leaderboard', args: Record<string, number>): Promise<Row[] | null> {
  if (!dbEnabled()) return null;
  try {
    if (fnToken()) {
      const r = await fetch(`${url()}/functions/v1/edcat-sheets`, { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json', 'x-edcat-token': fnToken()! }, body: JSON.stringify({ op: 'rpc', name, args, userId: 'system' }) });
      const j = r.ok ? await r.json() : null;
      return j?.ok ? (j.data as Row[]) : null;
    }
    const r = await fetch(`${url()}/rest/v1/rpc/${name}`, { method: 'POST', cache: 'no-store', headers: { apikey: key()!, Authorization: `Bearer ${key()}`, 'content-type': 'application/json' }, body: JSON.stringify(args) });
    return r.ok ? ((await r.json()) as Row[]) : null;
  } catch {
    return null;
  }
}

/** Returns rows, or null when the database is off or the call failed (callers then fall back to the device). */
export async function db(op: Op, table: Table, userId: string, o: Opts = {}): Promise<Row[] | null> {
  if (!dbEnabled() || !ID.test(userId)) return null;
  for (const v of Object.values(o.match ?? {})) if (!ID.test(String(v))) return null;
  try {
    return fnToken() ? await viaFunction(op, table, userId, o) : await viaRest(op, table, userId, o);
  } catch {
    return null;
  }
}
