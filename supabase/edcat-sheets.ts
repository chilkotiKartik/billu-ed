// Supabase edge function (verify_jwt = false). Replace TOKEN with a long random string and set the same value as EDCAT_FN_TOKEN.
import { createClient } from 'jsr:@supabase/supabase-js@2';
const TOKEN = 'CHANGE_ME';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ ok: false }, 405);
  if (req.headers.get('x-edcat-token') !== TOKEN) return json({ ok: false }, 401);
  const { action, userId, title, input } = await req.json();
  if (typeof userId !== 'string' || !userId) return json({ ok: false }, 400);
  if (action === 'list') {
    const { data, error } = await db.from('sheets').select('id,title,input,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    return error ? json({ ok: false }, 500) : json({ ok: true, items: data });
  }
  if (action === 'save') {
    if (typeof title !== 'string' || typeof input !== 'object') return json({ ok: false }, 400);
    const { error } = await db.from('sheets').insert({ user_id: userId, title: title.slice(0, 120), input });
    return error ? json({ ok: false }, 500) : json({ ok: true });
  }
  return json({ ok: false }, 400);
});
