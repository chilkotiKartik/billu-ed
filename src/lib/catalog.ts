import type { Solution } from './types';
import { solve } from './solver';
import { lineToSolution } from './adapt';
import { letteringSolution } from './lettering';
import { sheet1Solution } from './sheet1';
import { pointsSolution, Q1_POINTS, q7Solution } from './points';
import { q2, q3, q4, q5, q6 } from './derived';

export interface Q { id: string; code: string; title: string; statement: string; topic: 'lines' | 'lettering' | 'points' | 'special' | 'inclined' | 'derived'; build: () => Solution; setup?: string; p?: { theta: number; phi: number; ha: number; da: number } }
export interface Part { title: string; qs: Q[] }
export interface Sheet { id: string; title: string; parts: Part[] }

const L = 75;
const line = (id: string, code: string, title: string, statement: string, theta: number, phi: number, ha: number, da: number, topic: Q['topic']): Q => ({
  id, code, title, statement, topic,
  p: { theta, phi, ha, da },
  setup: `Line solver with L = ${L} mm, θ = ${theta}°, φ = ${phi}°, end A ${ha} mm above HP, ${da} mm in front of VP.`,
  build: () => lineToSolution(solve({ L, theta, phi, ha, da, n1: 'A', n2: 'B' }), id, `${code} · ${title}`),
});

export const SHEETS: Sheet[] = [
  { id: 's1', title: 'Sheet 1 · Types of lines', parts: [{ title: 'Types of lines', qs: [
    { id: 's1', code: 'Fig.', title: 'Draw all types of lines', topic: 'lines', statement: 'Draw Fig. 3-2 showing the different types of lines: outline (A), dimension, extension and leader lines (B), section lines (D), hidden line (E), centre line (G) and cutting-plane line (H). Draw the border and title block, and write the names of the lines in capital letters.', build: () => sheet1Solution('s1') },
    { id: 's1-lettering', code: 'Lettering', title: 'Alphabets and numerals', topic: 'lettering', statement: 'Write the capital letters A to Z and the numerals 0 to 9 in single-stroke upright lettering, 10 mm high, and write a sentence in the same style. Use guide lines.', build: () => letteringSolution('s1-lettering') },
  ] }] },
  { id: 's2', title: 'Sheet 2 · Points and lines', parts: [
    { title: 'Part 1 · Points', qs: [
      { id: 's2-1-q1', code: 'Q1', title: 'Points A to G', topic: 'points', statement: 'Draw the projections of points A to G on the same ground line, keeping the projectors 25 mm apart. A is in the HP and 20 mm behind the VP. B is 40 mm above the HP and 25 mm in front of the VP. C is in the VP and 40 mm above the HP. D is 25 mm below the HP and 25 mm behind the VP. E is 15 mm above the HP and 50 mm behind the VP. F is 40 mm below the HP and 25 mm in front of the VP. G is in both the HP and the VP.', build: () => pointsSolution('s2-1-q1', 'Q1 · Points A to G', Q1_POINTS) },
      { id: 's2-1-q7', code: 'Q7', title: 'Point P in third quadrant', topic: 'points', statement: 'A point P is 20 mm below the HP and lies in the third quadrant. Its shortest distance from the line XY is 40 mm. Draw its projections.', build: () => q7Solution('s2-1-q7') },
    ] },
    { title: 'Part 2 · Lines, Exercise X(a) Q1 (75 mm)', qs: [
      line('s2-2-A1', 'A1', 'Parallel to both, 25 from each', 'A 75 mm long line is parallel to both the HP and the VP and 25 mm from each. Draw its projections.', 0, 0, 25, 25, 'special'),
      line('s2-2-A2', 'A2', 'Parallel to HP, 30 above, in VP', 'A 75 mm long line is parallel to and 30 mm above the HP and lies in the VP. Draw its projections.', 0, 0, 30, 0, 'special'),
      line('s2-2-A3', 'A3', 'Parallel to VP, 40 in front, in HP', 'A 75 mm long line is parallel to and 40 mm in front of the VP and lies in the HP. Draw its projections.', 0, 0, 0, 40, 'special'),
      line('s2-2-B1', 'B1', 'Perpendicular to HP', 'A 75 mm long line is perpendicular to the HP and 20 mm in front of the VP. One end is 15 mm above the HP. Draw its projections.', 90, 0, 15, 20, 'special'),
      line('s2-2-B2', 'B2', 'Perpendicular to VP', 'A 75 mm long line is perpendicular to the VP and 25 mm above the HP. One end is in the VP. Draw its projections.', 0, 90, 25, 0, 'special'),
      line('s2-2-B3', 'B3', 'Perpendicular to HP, in VP', 'A 75 mm long line is perpendicular to the HP and lies in the VP. One end is in the HP. Draw its projections.', 90, 0, 0, 0, 'special'),
    ] },
  ] },
  { id: 's3', title: 'Sheet 3 · Inclined lines', parts: [
    { title: 'Q1 · Lines of 75 mm', qs: [
      line('s3-C1', 'C1', '45° to VP, in HP', 'A 75 mm long line is inclined at 45° to the VP and lies in the HP. One end is in the VP. Draw its projections.', 0, 45, 0, 0, 'inclined'),
      line('s3-C2', 'C2', '30° to HP, 30 in front of VP', 'A 75 mm long line is inclined at 30° to the HP. One end is 20 mm above the HP. The line is parallel to and 30 mm in front of the VP. Draw its projections.', 30, 0, 20, 30, 'inclined'),
      line('s3-C3', 'C3', '60° to VP, 25 above HP', 'A 75 mm long line is inclined at 60° to the VP. One end is 15 mm in front of the VP. The line is parallel to and 25 mm above the HP. Draw its projections.', 0, 60, 25, 15, 'inclined'),
    ] },
    { title: 'Q2 to Q6 · Find the angle or length', qs: [
      { id: 's3-q2', code: 'Q2', title: 'Inclination with VP', topic: 'derived', statement: 'A 100 mm long line is parallel to and 40 mm above the HP. Its ends are 25 mm and 50 mm in front of the VP. Draw its projections and find its inclination with the VP.', build: () => q2('s3-q2') },
      { id: 's3-q3', code: 'Q3', title: 'Inclination with HP', topic: 'derived', statement: 'A 90 mm long line is parallel to and 25 mm in front of the VP. One end is in the HP and the other end is 50 mm above the HP. Draw its projections and find its inclination with the HP.', build: () => q3('s3-q3') },
      { id: 's3-q4', code: 'Q4', title: 'Top view 55 mm', topic: 'derived', statement: 'The top view of a 75 mm long line measures 55 mm. The line is in the VP and one end is 25 mm above the HP. Draw its projections.', build: () => q4('s3-q4') },
      { id: 's3-q5', code: 'Q5', title: 'Front view 65 mm', topic: 'derived', statement: 'The front view of a line inclined at 30° to the VP is 65 mm long. The line is parallel to and 40 mm above the HP, and one end is 30 mm in front of the VP. Draw its projections.', build: () => q5('s3-q5') },
      { id: 's3-q6', code: 'Q6', title: 'Vertical AB and AC', topic: 'derived', statement: 'A vertical line AB, 75 mm long, has its end A in the HP and 25 mm in front of the VP. A line AC, 100 mm long, is in the HP and parallel to the VP. Draw the projections of the line BC and determine its inclination with the HP.', build: () => q6('s3-q6') },
    ] },
  ] },
];

const PLANS: Record<string, string[]> = {
  s1: ['Every line type has a job. Learn the key: A thick, B thin, E dashed, G chain, H and K chain with thick ends.', 'Draw the thick outline first, then add the other types one at a time, darkest to lightest.', 'Check each line weight against the key before you ink.'],
  's2-1-q7': ['40 mm is the slant distance from XY, not the distance behind VP.', 'p′ is 20 below XY. Swing 40 mm from XY down to the line through p′ to get a right-angled triangle: 20 and 40 give the other side.', 'Distance behind VP = √(40² − 20²) = 34.64 mm, so p is 34.64 mm ABOVE XY.'],
  's3-q2': ['Parallel to HP means the top view is the TRUE length (100 mm).', 'a is 25 below XY. b is on the line 50 below XY. So the vertical gap is 25.', 'sin φ = 25/100, so φ = 14.48°. Front view = √(100² − 25²) = 96.82 mm.'],
  's3-q3': ['Parallel to VP means the front view is the TRUE length (90 mm).', 'a′ is on XY (end in HP). b′ is 50 above XY.', 'sin θ = 50/90, so θ = 33.75°. Top view = √(90² − 50²) = 74.83 mm.'],
  's3-q4': ['In the VP means the front view is the TRUE length (75 mm) and the top view lies on XY.', 'Top view 55 mm is the horizontal gap. cos θ = 55/75, so θ = 42.83°.', 'The rise of b′ above a′ is √(75² − 55²) = 50.99 mm.'],
  's3-q5': ['Parallel to HP means the top view is the TRUE length at φ = 30°.', 'Front view = L cos 30° = 65, so L = 65/cos 30° = 75.06 mm.', 'b is below a by L sin 30° = 37.53 mm.'],
  's3-q6': ['AB is vertical, so its top view is a point: b falls on a.', 'AC is in the HP and parallel to VP: its front view is on XY and true length (100).', 'BC: tan θ = 75/100, so θ = 36.87° and BC = √(75² + 100²) = 125 mm. BC is parallel to VP, so b′c′ is the true length.'],
};
const TOPIC_PLAN: Record<string, string[]> = {
  lines: ['Draw the outline first with a thick, dark H line, then add everything else lighter.', 'Add hidden (dashed), centre (chain) and thin lines (dimension, extension, leader, hatching).', 'Finish with the cutting-plane line, the title block and the names in capital letters.'],
  lettering: ['Draw two faint guide lines 10 mm apart for each row.', 'Every capital is 10 mm high and about 6.7 mm wide, with a 2 mm gap.', 'Write A–Z, then 0–9, then a sentence, using a sharp H pencil.'],
  points: ['Height above or below HP: measure from XY in the FRONT view (up = above, down = below).', 'Distance in front of or behind VP: measure from XY in the TOP view (down = in front, up = behind).', 'A point on a plane has that view ON XY.'],
  special: ['A line parallel to a plane shows its true length in the view on that plane.', 'A line perpendicular to HP: top view is a point, front view is the true length, vertical.', 'A line perpendicular to VP: front view is a point, top view is the true length, vertical.'],
  inclined: ['The line is parallel to one plane, so one view shows the true length AND the angle.', 'Fix a (or a′) from the distances given, draw that view first, then project the other view.', 'The other view is parallel to XY and shorter: length × cos(angle).'],
};

export const ALL: Q[] = SHEETS.flatMap((s) => s.parts.flatMap((p) => p.qs));
const SETUPS: Record<string, string> = {
  s1: 'Hand-built figure (sheet1.ts): a rectangle 90×50 with a Ø20 hole, drawn once and revealed one line type per step.',
  's2-1-q1': 'Points module: seven points on projectors 25 mm apart. Each point = (height above HP, distance in front of VP), e.g. B = (40, 25), D = (−25, −25).',
  's2-1-q7': 'Points module, construction: p′ at −20 from XY, slant distance 40 gives the depth √(40² − 20²) = 34.64 mm.',
  's3-q2': 'Derived module: top view is the true length (100), vertical gap between the ends = 50 − 25, so φ = asin(25/100).',
  's3-q3': 'Derived module: front view is the true length (90), height of the free end = 50, so θ = asin(50/90).',
  's3-q4': 'Derived module: line in VP, top view 55, true length 75, so θ = acos(55/75) and the rise = √(75² − 55²).',
  's3-q5': 'Derived module: top view is the true length at φ = 30°, front view 65, so L = 65 / cos 30°.',
  's3-q6': 'Derived module: AB vertical (75), AC in HP ∥ VP (100); BC = √(75² + 100²) and θ = atan(75/100).',
};
// every question gets a plan, whichever way it is built
for (const q of ALL) {
  const b = q.build;
  if (SETUPS[q.id]) q.setup = SETUPS[q.id];
  q.build = () => { const so = b(); so.plan = PLANS[q.id] ?? so.plan ?? TOPIC_PLAN[q.topic]; return so; };
}

const tok = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9°.]+/g, ' ').split(' ').filter((w) => w.length > 0));

/** Finds the catalogue question that best matches scanned text (Jaccard on words). */
export function matchCatalog(raw: string): { q: Q; score: number } | null {
  const t = tok(raw);
  if (t.size < 6) return null;
  let best: { q: Q; score: number } | null = null;
  for (const q of ALL) {
    const s = tok(q.statement);
    let inter = 0;
    s.forEach((w) => { if (t.has(w)) inter++; });
    // the numbers must agree too, otherwise it is a different question with similar words
    const nums = (x: Set<string>) => [...x].filter((w) => /\d/.test(w)).sort().join(',');
    const score = nums(s) === nums(t) ? inter / (s.size + t.size - inter) : 0;
    if (!best || score > best.score) best = { q, score };
  }
  return best && best.score >= 0.5 ? best : null;
}

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/** A fresh version of a line question: same kind, new numbers. The same solver draws it. */
export function variantOf(q: Q): { statement: string; sol: Solution } | null {
  if (!q.p) return null;
  for (let tries = 0; tries < 30; tries++) {
    const Lx = pick([60, 65, 70, 75, 80, 90, 100]);
    const ang = (a: number) => (a === 0 || a === 90 ? a : pick([30, 40, 45, 60]));
    const theta = ang(q.p.theta), phi = ang(q.p.phi);
    const ha = q.p.ha ? pick([10, 15, 20, 25, 30, 35]) : 0, da = q.p.da ? pick([10, 15, 20, 25, 30, 35]) : 0;
    if (theta + phi > 90) continue;
    try {
      const sol = lineToSolution(solve({ L: Lx, theta, phi, ha, da, n1: 'A', n2: 'B' }), `${q.id}-v`, `${q.code} · new numbers`);
      sol.plan = sol.plan;
      const t = theta === 0 ? 'parallel to the HP' : theta === 90 ? 'perpendicular to the HP' : `inclined at ${theta}° to the HP`;
      const f = phi === 0 ? 'parallel to the VP' : phi === 90 ? 'perpendicular to the VP' : `inclined at ${phi}° to the VP`;
      return { statement: `A line AB, ${Lx} mm long, is ${t} and ${f}. End A is ${ha ? `${ha} mm above the HP` : 'in the HP'} and ${da ? `${da} mm in front of the VP` : 'in the VP'}. Draw its projections.`, sol };
    } catch { /* try other numbers */ }
  }
  return null;
}
