import { EMPTY, load as loadGame, save as saveGame } from './game';
import { mergeProgress, type Progress } from './progress';

const DONE_KEY = 'edbuddy.done';
const PROFILE_KEY = 'edcat.profile';

export const loadDone = (): string[] => {
  try { const v = JSON.parse(localStorage.getItem(DONE_KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; }
};
export const saveDone = (d: string[]) => { try { localStorage.setItem(DONE_KEY, JSON.stringify(d)); } catch { /* ignore */ } };
export const loadLocal = (): Progress => ({ done: loadDone(), game: loadGame() });
export const saveLocal = (p: Progress) => { saveDone(p.done); saveGame(p.game); };

async function call<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(url, init);
    const j = await r.json();
    return j.ok ? (j as T) : null;
  } catch { return null; }
}

/** Pull the account copy, merge it with this device, and return the merged result (null = account storage is off/offline). */
export async function pullProgress(local: Progress): Promise<Progress | null> {
  const r = await call<{ progress: Progress }>('/api/progress');
  if (!r) return null;
  return mergeProgress(local, { done: r.progress.done, game: { ...EMPTY, ...r.progress.game } });
}

export async function pushProgress(p: Progress): Promise<boolean> {
  const r = await call<{ progress: Progress }>('/api/progress', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) });
  return !!r;
}

export interface Profile { name: string; roll: string }
export const loadProfileLocal = (): Profile => {
  try { const v = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); return { name: String(v.name ?? ''), roll: String(v.roll ?? '') }; } catch { return { name: '', roll: '' }; }
};
export const saveProfileLocal = (p: Profile) => { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* ignore */ } };
export async function pullProfile(): Promise<Profile | null> {
  const r = await call<{ profile: Profile }>('/api/profile');
  return r ? r.profile : null;
}
export async function pushProfile(p: Profile): Promise<boolean> {
  return !!(await call('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) }));
}

export async function sendFeedback(f: { kind: 'wrong-step' | 'unclear' | 'idea' | 'bug'; message: string; questionId?: string; step?: number }): Promise<'sent' | 'off' | 'error'> {
  try {
    const r = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json();
    if (j.ok) return 'sent';
    return r.ok ? 'off' : 'error';
  } catch { return 'error'; }
}
