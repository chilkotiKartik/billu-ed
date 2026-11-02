import type { LineSolution } from './types';

const R = (v: number) => Math.round(v * 100) / 100;

export function mistakes(s: LineSolution): { title: string; body: string }[] {
  const a = s.n1.toLowerCase(), b = s.n2.toLowerCase();
  const kindNote =
    s.kind === 'hp'
      ? { title: 'True length is in the TOP view', body: `The line is parallel to HP, so ${a}${b} = ${R(s.L)} mm. ${a}′${b}′ is shorter (${R(s.Lf)} mm).` }
      : s.kind === 'vp'
      ? { title: 'True length is in the FRONT view', body: `The line is parallel to VP, so ${a}′${b}′ = ${R(s.L)} mm. ${a}${b} is shorter (${R(s.Lt)} mm).` }
      : { title: 'Neither view shows the true length', body: `The line is inclined to both planes, so both views are shorter than ${R(s.L)} mm: ${a}′${b}′ = ${R(s.Lf)} mm, ${a}${b} = ${R(s.Lt)} mm.` };
  return [
    { title: 'Top view above XY', body: 'In first angle the top view goes BELOW XY and the front view ABOVE it. Draw XY first and say which is which.' },
    { title: 'Same thickness everywhere', body: `XY, projectors, arcs and construction lines are thin (2H). Only ${a}′${b}′ and ${a}${b} are thick and dark (HB).` },
    { title: 'Wrong labels', body: `Front view: ${a}′ ${b}′. Top view: ${a} ${b}. Small letters only, never capitals.` },
    { title: 'Erasing construction lines', body: 'Keep them faint. Examiners want to see your method, so do not rub them out.' },
    kindNote,
    { title: 'Skipping the length check', body: `Measure after joining: ${a}′${b}′ must be ${R(s.Lf)} mm and ${a}${b} must be ${R(s.Lt)} mm. If not, recheck the angle or the projector.` },
  ];
}
