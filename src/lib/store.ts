import type { LineInput } from './types';

export interface Saved {
  id: string;
  title: string;
  input: LineInput;
  created_at: string;
}

const KEY = 'edbuddy.sheets';
const UUID = /^[0-9a-f-]{36}$/i;
const local = (): Saved[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};
const writeLocal = (items: Saved[]) => { try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50))); } catch { /* storage full or blocked */ } };

/** Cloud sheets first, then anything still only on this device (so nothing a student saved offline disappears). */
export async function listSheets(): Promise<Saved[]> {
  try {
    const r = await fetch('/api/sheets');
    const j = await r.json();
    if (j.ok) return [...(j.items as Saved[]), ...local()];
  } catch { /* fall through to device storage */ }
  return local();
}

export async function saveSheet(title: string, input: LineInput): Promise<'cloud' | 'device' | 'full'> {
  try {
    const r = await fetch('/api/sheets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, input }) });
    const j = await r.json();
    if (j.ok) return 'cloud';
    if (r.status === 409) return 'full';
  } catch { /* fall through */ }
  const items = local();
  items.unshift({ id: String(Date.now()), title, input, created_at: new Date().toISOString() });
  writeLocal(items);
  return 'device';
}

export async function deleteSheet(id: string): Promise<boolean> {
  if (!UUID.test(id)) { writeLocal(local().filter((s) => s.id !== id)); return true; }
  try {
    const r = await fetch(`/api/sheets/${id}`, { method: 'DELETE' });
    return (await r.json()).ok === true;
  } catch { return false; }
}

export async function renameSheet(id: string, title: string): Promise<boolean> {
  if (!UUID.test(id)) { writeLocal(local().map((s) => (s.id === id ? { ...s, title } : s))); return true; }
  try {
    const r = await fetch(`/api/sheets/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title }) });
    return (await r.json()).ok === true;
  } catch { return false; }
}
