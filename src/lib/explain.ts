import type { Prim, Solution } from './types';
import { R } from './draw';

const STYLE: Record<string, string> = { thick: 'Thick final line', fine: 'Thin line', thin: 'Reference line', proj: 'Projector (light)', dash: 'Construction line / locus', hidden: 'Hidden dashed line', centre: 'Centre line', locus: 'Locus line' };

/** "What I added" for one step, with real lengths. Notes (callouts) are skipped. */
export function added(prims: Prim[]): { what: string; len?: string }[] {
  const out: { what: string; len?: string }[] = [];
  const seen = new Map<string, number>();
  for (const p of prims) {
    if ((p.t === 'text' || p.t === 'arrow') && p.n) continue;
    let what = '', len: string | undefined;
    if (p.t === 'line') {
      what = STYLE[p.w] ?? 'Line';
      len = `${R(Math.hypot(p.x2 - p.x1, p.y2 - p.y1))} mm`;
      const dx = p.x2 - p.x1, dy = p.y2 - p.y1;
      what += Math.abs(dy) < 0.01 ? ', horizontal' : Math.abs(dx) < 0.01 ? ', vertical' : `, ${R((Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI)}° to XY`;
    } else if (p.t === 'pt') { what = `Point ${p.label}`; }
    else if (p.t === 'arc') { what = `Arc, radius ${R(p.r)} mm`; len = `${R(Math.abs(p.a1 - p.a0))}° sweep`; }
    else if (p.t === 'circle') { what = `Circle Ø${R(2 * p.r)} mm`; }
    else if (p.t === 'dim') { what = `Dimension ${p.label}`; len = `${R(Math.hypot(p.x2 - p.x1, p.y2 - p.y1))} mm measured`; }
    else if (p.t === 'text') { what = `Lettering: ${p.text.length > 30 ? p.text.slice(0, 29) + '…' : p.text}`; len = p.mm ? `${p.mm} mm high` : undefined; }
    else if (p.t === 'arrow') { what = 'Leader / direction arrow'; len = `${R(Math.hypot(p.x2 - p.x1, p.y2 - p.y1))} mm`; }
    else continue;
    const key = what + (len ?? '');
    if (seen.has(key) && p.t !== 'pt') { const i = seen.get(key)!; out[i].what = out[i].what.replace(/^(\d+× )?/, (_, n) => `${(n ? parseInt(n) : 1) + 1}× `); continue; }
    seen.set(key, out.length);
    out.push({ what, len });
  }
  return out.slice(0, 10);
}

/** The cat's one-line cheer for each step. */
export function catLine(i: number, n: number): string {
  if (i === 0) return 'Meow! Let us start. ';
  if (i === n - 1) return 'Purr-fect! Last step. ';
  return ['Look closely. ', 'Paws on the pencil. ', 'Easy now. ', 'Nice, keep going. '][i % 4];
}

export function planOf(sol: Solution): string[] {
  return sol.plan ?? [];
}
