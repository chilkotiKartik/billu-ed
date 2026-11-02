import type { Prim, Solution, Step } from './types';
import { R, ln, pt, arc, dim, S, text, callout, xyPrims } from './draw';

export interface PtSpec { name: string; ha: number; da: number; desc: string } // ha: + above HP, - below. da: + in front of VP, - behind.

export function quadrant(ha: number, da: number): string {
  if (ha === 0 && da === 0) return 'on XY (in both HP and VP)';
  if (ha === 0) return da > 0 ? 'in the HP, in front of VP (between quadrants I and IV)' : 'in the HP, behind VP (between quadrants II and III)';
  if (da === 0) return ha > 0 ? 'in the VP, above HP (between quadrants I and II)' : 'in the VP, below HP (between quadrants III and IV)';
  if (ha > 0 && da > 0) return 'first quadrant';
  if (ha > 0 && da < 0) return 'second quadrant';
  if (ha < 0 && da < 0) return 'third quadrant';
  return 'fourth quadrant';
}

const MIST = [
  { title: 'Mixing up “behind” and “in front”', body: 'Points IN FRONT of VP have the top view BELOW XY. Points BEHIND VP have the top view ABOVE XY.' },
  { title: 'Mixing up “above” and “below” HP', body: 'Points ABOVE HP have the front view ABOVE XY. Points BELOW HP have the front view BELOW XY.' },
  { title: 'Projectors not perpendicular', body: 'Use a set square so each projector is exactly at 90° to XY, and keep them the stated distance apart.' },
  { title: 'Wrong labels', body: 'Front view gets a dash (a′, b′). Top view has no dash (a, b). Small letters only.' },
  { title: 'Forgetting points that lie ON a plane', body: 'A point in HP has its front view ON XY. A point in VP has its top view ON XY. A point in both is on XY in both views.' },
];

export function pointsSolution(id: string, title: string, specs: PtSpec[], gap = 25): Solution {
  const n = specs.length;
  const left = -35, right = (n - 1) * gap + 35;
  const ys = specs.flatMap((p) => [p.ha, -p.da]);
  const top = Math.max(0, ...ys) + 12, bot = Math.min(0, ...ys) - 12;
  const xy = xyPrims(left, right);
  const projs = specs.map((_, i) => ln(i * gap, top, i * gap, bot, 'proj'));

  const pointPrims = (p: PtSpec, i: number): Prim[] => {
    const x = i * gap, n1 = p.name.toLowerCase(), fy = p.ha, ty = -p.da;
    if (fy === 0 && ty === 0) return [pt(x, 0, `${n1}′ ${n1}`, 3, 2)];
    const fdy = fy > 0 ? 2 : fy < 0 ? -6 : ty > 0 ? -6 : 2;
    const tdy = ty < 0 ? -6 : ty > 0 ? 2 : fy > 0 ? -6 : 2;
    return [
      ln(x, fy, x, ty, 'proj'),
      pt(x, fy, `${n1}′`, 3, fdy), pt(x, ty, n1, -3, tdy),
      ...(fy !== 0 ? [dim(x - 7, 0, x - 7, fy, String(R(Math.abs(fy))), 0)] : []),
      ...(ty !== 0 ? [dim(x + 7, 0, x + 7, ty, String(R(Math.abs(p.da))), 0)] : []),
    ];
  };

  const steps: Step[] = [];
  steps.push(S('Draw XY and the projectors', 'T-square + set square',
    `Draw XY ${R(right - left)} mm long. Draw ${n} vertical projectors ${gap} mm apart, one for each point. Height above or below HP is measured from XY on the front view. Distance in front of or behind VP is measured from XY on the top view.`,
    [...xy, ...projs, dim(0, bot + 2, gap, bot + 2, String(gap), 0)], `projectors ${gap} mm apart`));

  specs.forEach((p, i) => {
    const n1 = p.name.toLowerCase();
    const hTxt = p.ha > 0 ? `${R(p.ha)} mm above HP, so ${n1}′ is ${R(p.ha)} mm ABOVE XY` : p.ha < 0 ? `${R(-p.ha)} mm below HP, so ${n1}′ is ${R(-p.ha)} mm BELOW XY` : `in the HP, so ${n1}′ lies ON XY`;
    const dTxt = p.da > 0 ? `${R(p.da)} mm in front of VP, so ${n1} is ${R(p.da)} mm BELOW XY` : p.da < 0 ? `${R(-p.da)} mm behind VP, so ${n1} is ${R(-p.da)} mm ABOVE XY` : `in the VP, so ${n1} lies ON XY`;
    steps.push(S(`Plot ${p.name}: ${p.desc}`, 'Scale + set square',
      `${p.name} is ${hTxt}. It is also ${dTxt}. So ${p.name} is ${quadrant(p.ha, p.da)}.`,
      [...pointPrims(p, i), ...(i === 0 ? callout('projector', 12, top - 2, 1, top - 8) : [])], quadrant(p.ha, p.da)));
  });

  const final: Prim[] = [...xy, ...projs, ...specs.flatMap(pointPrims)];
  steps.push(S('Finish the sheet', 'HB pencil + eraser',
    'Mark each point with a small dot, label the front views with a dash (a′) and the top views without (a), and write the dimensions. Keep XY and the projectors thin.', final));

  return {
    id, title, steps, final,
    results: specs.map((p) => ({ label: `${p.name}`, value: quadrant(p.ha, p.da) })),
    header: ['PROJECTION OF POINTS', `Projectors ${gap} mm apart`, 'First angle projection'],
    mistakes: MIST,
  };
}

export const Q1_POINTS: PtSpec[] = [
  { name: 'A', ha: 0, da: -20, desc: 'in HP, 20 mm behind VP' },
  { name: 'B', ha: 40, da: 25, desc: '40 mm above HP, 25 mm in front of VP' },
  { name: 'C', ha: 40, da: 0, desc: 'in VP, 40 mm above HP' },
  { name: 'D', ha: -25, da: -25, desc: '25 mm below HP, 25 mm behind VP' },
  { name: 'E', ha: 15, da: -50, desc: '15 mm above HP, 50 mm behind VP' },
  { name: 'F', ha: -40, da: 25, desc: '40 mm below HP, 25 mm in front of VP' },
  { name: 'G', ha: 0, da: 0, desc: 'in both HP and VP' },
];

/** Point P: 20 mm below HP, third quadrant, 40 mm from XY (shortest distance). */
export function q7Solution(id: string): Solution {
  const ha = -20, D = 40;
  const behind = Math.sqrt(D * D - ha * ha); // distance behind VP
  const xy = xyPrims(-35, 70);
  const proj = ln(0, behind + 12, 0, ha - 12, 'proj');
  const steps: Step[] = [
    S('Draw XY and a projector', 'T-square + set square',
      'Draw XY and a vertical projector through a point O on it. P is below HP and behind VP, so it is in the third quadrant: its front view is BELOW XY and its top view is ABOVE XY.', [...xy, proj, text(2, 2, 'O', 1.1)]),
    S('Mark p′ 20 mm below XY', 'Scale', 'P is 20 mm below HP, so the front view p′ is 20 mm below XY on the projector.',
      [pt(0, ha, 'p′', 3, -6), dim(-10, 0, -10, ha, '20', 0)], 'p′ = 20 below XY'),
    S('Use the 40 mm: arc from O to a line through p′', 'Compass + T-square',
      '40 mm is the shortest distance of P from XY. Draw a line through p′ parallel to XY. With centre O and radius 40 mm swing an arc down to meet that line at R. Distance OR = 40 mm.',
      [ln(0, ha, 60, ha, 'dash'), arc(0, 0, D, 0, -30), pt(behind, ha, 'r', 3, -6), ...callout('OR = 40', 70, -14, 41, -12)], 'OR = 40 mm'),
    S('Drop R to XY at S', 'Set square', 'From R draw a vertical line up to XY. It meets XY at S. The distance OS is the distance of P behind VP.',
      [ln(behind, ha, behind, 0, 'proj'), pt(behind, 0, 's', 3, 2)], `OS = √(40² − 20²) = ${R(behind)} mm`),
    S('Swing S up to the projector to get p', 'Compass', `With centre O and radius OS (${R(behind)} mm) draw an arc from S up to the projector above XY. P is BEHIND VP, so p is ABOVE XY.`,
      [arc(0, 0, behind, 0, 90), pt(0, behind, 'p', 3, 2), dim(-10, 0, -10, behind, String(R(behind)), 0)], `p is ${R(behind)} mm above XY`),
  ];
  const final: Prim[] = [...xy, proj, pt(0, ha, 'p′', 3, -6), pt(0, behind, 'p', 3, 2), dim(-10, 0, -10, ha, '20', 0), dim(-10, 0, -10, behind, String(R(behind)), 0)];
  steps.push(S('Finish the sheet', 'HB pencil + eraser', 'Mark the points, label p′ (front view) and p (top view), and add the two distances. Keep the construction (arcs and lines) thin.', final));
  return {
    id, title: 'Q7 · Point P in the third quadrant', steps, final,
    results: [{ label: 'p′ (front view)', value: '20 mm below XY' }, { label: 'p (top view)', value: `${R(behind)} mm above XY` }, { label: 'Quadrant', value: 'third quadrant' }],
    header: ['PROJECTION OF POINTS', 'Point P: 20 below HP, third quadrant', 'Distance from XY = 40 mm'],
    mistakes: [
      { title: 'Using 40 mm as the distance behind VP', body: '40 mm is the distance from XY (the slant distance), not from VP. The distance behind VP is √(40² − 20²) = 34.64 mm.' },
      MIST[0], MIST[1], MIST[3],
    ],
  };
}
