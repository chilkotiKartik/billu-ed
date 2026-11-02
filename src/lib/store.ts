import type { LineInput } from './types';

export interface Saved {
  id: string;
  title: string;
  input: LineInput;
  created_at: string;
}

const KEY = 'edbuddy.sheets';
const local = (): Saved[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export async function listSheets(): Promise<Saved[]> {
  try {
    const r = await fetch('/api/sheets');
    const j = await r.json();
    if (j.ok) return j.items as Saved[];
  } catch { /* fall through to device storage */ }
  return local();
}

export async function saveSheet(title: string, input: LineInput): Promise<'cloud' | 'device'> {
  try {
    const r = await fetch('/api/sheets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, input }) });
    const j = await r.json();
    if (j.ok) return 'cloud';
  } catch { /* fall through */ }
  const items = local();
  items.unshift({ id: String(Date.now()), title, input, created_at: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
  return 'device';
}
