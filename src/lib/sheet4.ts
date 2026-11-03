import type { Solution } from './types';
import { solve } from './solver';
import { lineToSolution } from './adapt';
import { R, deg } from './draw';

/** Sheet 4: lines inclined to both HP and VP. Each question is turned into (L, θ, φ, A) first, then the line solver draws it. */
interface Cfg { L: number; theta: number; phi: number; ha: number; da: number; title: string; work?: string; answers?: { label: string; value: string }[] }

function build(id: string, c: Cfg): Solution {
  const sol = lineToSolution(solve({ L: c.L, theta: c.theta, phi: c.phi, ha: c.ha, da: c.da, n1: 'A', n2: 'B' }), id, c.title);
  if (c.work) {
    const s0 = sol.steps[0];
    s0.why = `First work out the true angles. ${c.work} ${s0.why}`;
    s0.calc = s0.calc ? `${c.work} · ${s0.calc}` : c.work;
  }
  if (c.answers) sol.results = [...c.answers, ...sol.results];
  sol.header = ['PROJECTION OF LINES · SHEET 4', sol.header[1], sol.header[2]];
  return sol;
}

const acosD = (v: number) => deg(Math.acos(v)), asinD = (v: number) => deg(Math.asin(v));

export const s4q1 = (id: string) => build(id, { L: 75, theta: 30, phi: 45, ha: 0, da: 0, title: 'Q1 · A in both HP and VP, 30° to HP, 45° to VP' });

export function s4q2(id: string): Solution {
  const L = 75, tv = 65, fv = 50, theta = acosD(tv / L), phi = acosD(fv / L);
  return build(id, {
    L, theta, phi, ha: 0, da: 12, title: 'Q2 · Top view 65, front view 50: find θ and φ',
    work: `Top view = L cos θ, so cos θ = 65/75 and θ = ${R(theta)}°. Front view = L cos φ, so cos φ = 50/75 and φ = ${R(phi)}°.`,
    answers: [{ label: 'Inclination with HP (θ)', value: `${R(theta)}°` }, { label: 'Inclination with VP (φ)', value: `${R(phi)}°` }],
  });
}

export function s4q3(id: string): Solution {
  const L = 90, theta = 45, beta = 60, tv = L * Math.cos((theta * Math.PI) / 180), phi = asinD((tv * Math.sin((beta * Math.PI) / 180)) / L);
  return build(id, {
    L, theta, phi, ha: 0, da: 15, title: 'Q3 · 45° to HP, top view at 60° to VP: find φ',
    work: `Top view = 90 cos 45° = ${R(tv)} mm. It makes β = 60° with XY, so b is ${R(tv)} × sin 60° = ${R(tv * Math.sin(Math.PI / 3))} mm further from XY than a. True angle: sin φ = ${R(tv * Math.sin(Math.PI / 3))}/90, so φ = ${R(phi)}° (not 60°: the 60° is only the apparent angle β).`,
    answers: [{ label: 'True inclination with VP (φ)', value: `${R(phi)}°` }, { label: 'Apparent angle of top view (β)', value: '60°' }],
  });
}

export function s4q4(id: string): Solution {
  const L = 65, theta = asinD((40 - 20) / L), phi = asinD((65 - 25) / L);
  return build(id, {
    L, theta, phi, ha: 20, da: 25, title: 'Q4 · Both ends given: find θ and φ',
    work: `B is 40 − 20 = 20 mm higher than A, so sin θ = 20/65 and θ = ${R(theta)}°. B is 65 − 25 = 40 mm further in front, so sin φ = 40/65 and φ = ${R(phi)}°.`,
    answers: [{ label: 'Inclination with HP (θ)', value: `${R(theta)}°` }, { label: 'Inclination with VP (φ)', value: `${R(phi)}°` }],
  });
}
