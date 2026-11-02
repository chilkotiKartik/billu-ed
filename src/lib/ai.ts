import type { LineInput } from './types';

/** Asks the server (which asks Gemini) to read the question. Returns null if AI is off or fails. */
export async function askAI(text: string, image?: string): Promise<Partial<LineInput> | null> {
  try {
    const r = await fetch('/api/read', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, image }) });
    const j = await r.json();
    return j.ok ? (j.input as Partial<LineInput>) : null;
  } catch {
    return null;
  }
}

export function missingOf(i: Partial<LineInput>): string[] {
  const m: string[] = [];
  if (i.L === undefined) m.push('length');
  if (i.theta === undefined) m.push('angle with HP');
  if (i.phi === undefined) m.push('angle with VP');
  if (i.ha === undefined) m.push('height above HP');
  if (i.da === undefined) m.push('distance in front of VP');
  return m;
}
