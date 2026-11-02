import type { Kind } from './types';

export const PRESETS: { id: string; title: string; text: string }[] = [
  { id: 'p1', title: 'Line ∥ HP, 30° to VP', text: 'A line AB, 70 mm long, is parallel to the HP and inclined at 30° to the VP. End A is 20 mm above the HP and 15 mm in front of the VP. Draw its projections.' },
  { id: 'p2', title: 'Line ∥ VP, 45° to HP', text: 'A line PQ, 80 mm long, is parallel to the VP and inclined at 45° to the HP. End P is 15 mm above the HP and 25 mm in front of the VP. Draw its projections.' },
  { id: 'p3', title: 'Inclined to both: 30° HP, 40° VP', text: 'A line AB, 75 mm long, is inclined at 30° to the HP and 40° to the VP. End A is 15 mm above the HP and 20 mm in front of the VP. Draw its projections.' },
  { id: 'p4', title: 'End C in the HP', text: 'A line CD, 60 mm long, is parallel to the HP and inclined at 45° to the VP. End C is in the HP and 20 mm in front of the VP. Draw its projections.' },
  { id: 'p5', title: 'End E in the VP', text: 'A line EF, 90 mm long, is parallel to the VP and inclined at 30° to the HP. End E is 10 mm above the HP and in the VP. Draw its projections.' },
  { id: 'p6', title: 'Inclined to both: 45° HP, 30° VP', text: 'A line AB, 100 mm long, is inclined at 45° to the HP and 30° to the VP. End A is 10 mm above the HP and 15 mm in front of the VP. Draw its projections.' },
];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const NAMES = [['A', 'B'], ['P', 'Q'], ['C', 'D'], ['E', 'F'], ['M', 'N']];

/** "Practice new numbers": a fresh question with valid random values. */
export function randomQuestion(kind?: Kind): string {
  const k: Kind = kind ?? pick<Kind>(['hp', 'vp', 'both']);
  const [n1, n2] = pick(NAMES);
  const L = pick([50, 55, 60, 65, 70, 75, 80, 90, 100]);
  const ha = pick([0, 10, 15, 20, 25]);
  const da = pick([0, 10, 15, 20, 25, 30]);
  const ang = () => pick([15, 30, 45, 60]);
  const pos = `End ${n1} is ${ha ? `${ha} mm above the HP` : 'in the HP'} and ${da ? `${da} mm in front of the VP` : 'in the VP'}.`;
  if (k === 'hp') return `A line ${n1}${n2}, ${L} mm long, is parallel to the HP and inclined at ${ang()}° to the VP. ${pos} Draw its projections.`;
  if (k === 'vp') return `A line ${n1}${n2}, ${L} mm long, is parallel to the VP and inclined at ${ang()}° to the HP. ${pos} Draw its projections.`;
  let t = ang(), p = ang();
  while (t + p > 90) { t = ang(); p = ang(); }
  return `A line ${n1}${n2}, ${L} mm long, is inclined at ${t}° to the HP and ${p}° to the VP. ${pos} Draw its projections.`;
}
