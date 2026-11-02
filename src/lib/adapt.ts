import type { LineSolution, Solution } from './types';
import { mistakes } from './mistakes';
import { R } from './draw';

/** Turns the raw line solution into the shape the UI uses. */
export function lineToSolution(ls: LineSolution, id = 'custom', title?: string): Solution {
  const a = ls.n1.toLowerCase(), b = ls.n2.toLowerCase();
  const { input } = ls;
  const front = ls.Lf < 0.01 ? 'a point' : `${R(ls.L)} cos ${R(input.phi)}° = ${R(ls.Lf)} mm`;
  const top = ls.Lt < 0.01 ? 'a point' : `${R(ls.L)} cos ${R(input.theta)}° = ${R(ls.Lt)} mm`;
  return {
    id,
    title: title ?? `Line ${ls.n1}${ls.n2} · ${R(ls.L)} mm · ${R(input.theta)}°/${R(input.phi)}°`,
    steps: ls.steps,
    final: ls.final,
    results: [
      { label: `${a}′${b}′ (front view)`, value: front },
      { label: `${a}${b} (top view)`, value: top },
      { label: `Where ${b}′ and ${b} land`, value: `${b}′ is ${R(ls.bF[1])} mm above XY · ${b} is ${R(-ls.bT[1])} mm below XY` },
    ],
    header: ['PROJECTION OF LINES', `Line ${ls.n1}${ls.n2}, ${R(ls.L)} mm · θ=${R(input.theta)}° φ=${R(input.phi)}°`, `${a} is ${R(input.ha)} above HP, ${R(input.da)} in front of VP`],
    mistakes: mistakes(ls),
    plan: [
      'Read the question: write down the true length, the two angles and where end A is.',
      ls.kind === 'hp' ? 'The line is parallel to HP, so the TOP view is the true length and shows the angle with VP. The front view is parallel to XY.'
        : ls.kind === 'vp' ? 'The line is parallel to VP, so the FRONT view is the true length and shows the angle with HP. The top view is parallel to XY.'
        : 'The line is inclined to both planes, so neither view is the true length. Draw it first parallel to one plane, then rotate it to the second angle (two-position method).',
      `Heights: h = L sin θ = ${R(ls.h)} mm (the vertical gap between the ends in the front view). Depths: d = L sin φ = ${R(ls.d)} mm (the gap in the top view).`,
      `Views: front = L cos φ = ${R(ls.Lf)} mm, top = L cos θ = ${R(ls.Lt)} mm. Check these after you draw.`,
    ],
    lineInput: input,
  };
}
