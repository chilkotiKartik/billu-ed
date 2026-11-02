import type { Prim } from './types';

export type Grade = 'H' | '2H' | '3H' | '4H';

/** Which pencil draws what, and how it looks on paper. */
export const PENCILS: { g: Grade; col: string; line: string; use: string }[] = [
  { g: 'H', col: '#1B2340', line: 'Thick / dashed', use: 'Final outlines (visible edges) and HIDDEN LINES (dashed: dash 3 mm, gap 1 mm). Also lettering.' },
  { g: '2H', col: '#2F5D8A', line: 'Thin, firm', use: 'Dimension lines, extension lines, centre lines, hatching and arrow heads.' },
  { g: '3H', col: '#6B7390', line: 'Light', use: 'Projectors, XY line and reference lines. Keep them light so they can stay on the sheet.' },
  { g: '4H', col: '#9AA0B5', line: 'Very faint', use: 'Construction: layout lines, arcs and trial lines. Almost invisible, easy to rub out.' },
];

/** Arrow heads: width : length = 1 : 3 (for example 2 mm wide and 6 mm long). */
export const ARROW = { w: 2, l: 6 };

export function pencilOf(p: Prim): Grade {
  switch (p.t) {
    case 'line': if (p.f) return 'H'; return p.w === 'thick' || p.w === 'hidden' ? 'H' : p.w === 'proj' ? '3H' : p.w === 'dash' ? '4H' : '2H';
    case 'arc': return p.w === 'thick' ? 'H' : p.w ? '2H' : '4H';
    case 'circle': return p.w === 'thick' || p.w === undefined ? 'H' : '2H';
    case 'dim': case 'arrow': return '2H';
    default: return 'H';
  }
}

export const colOf = (g: Grade) => PENCILS.find((x) => x.g === g)!.col;

/** The pencils a step needs, in order of use, so the lesson can say "use H pencil" right in the instruction. */
export function pencilsOf(prims: Prim[]): Grade[] {
  const seen: Grade[] = [];
  for (const p of prims) { if ((p.t === 'text' || p.t === 'arrow') && p.n) continue; const g = pencilOf(p); if (!seen.includes(g)) seen.push(g); }
  return seen.sort((a, b) => ['4H', '3H', '2H', 'H'].indexOf(a) - ['4H', '3H', '2H', 'H'].indexOf(b));
}
