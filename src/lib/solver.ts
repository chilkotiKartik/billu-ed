import type { Kind, LineInput, LineSolution, Prim, Step } from './types';
import { R, rad, deg, ln, pt, arc, dim, S, angMark, xyPrims, lineViews, callout } from './draw';

export function kindOf(i: { theta: number; phi: number }): Kind {
  if (i.theta === 0) return 'hp';
  if (i.phi === 0) return 'vp';
  return 'both';
}

export function validate(i: LineInput): string | null {
  const n = [i.L, i.theta, i.phi, i.ha, i.da];
  if (n.some((v) => typeof v !== 'number' || !isFinite(v))) return 'Please fill in all the numbers.';
  if (i.L <= 0 || i.L > 400) return 'Length must be between 1 and 400 mm.';
  if (i.theta < 0 || i.theta > 90 || i.phi < 0 || i.phi > 90) return 'Angles must be between 0° and 90°.';
  if (i.ha < 0 || i.da < 0 || i.ha > 200 || i.da > 200) return 'Distances must be between 0 and 200 mm.';
  if (i.theta + i.phi > 90.0001) return 'θ + φ cannot be more than 90° for a real line.';
  return null;
}

const isPt = (v: number) => v < 0.01;

/** Line AB given by true length, inclinations (θ with HP, φ with VP) and the position of end A. First angle. */
export function solve(inp0: LineInput): LineSolution {
  const err = validate(inp0);
  if (err) throw new Error(err);
  const n1 = (inp0.n1 || 'A').toUpperCase();
  const n2 = (inp0.n2 || 'B').toUpperCase();
  const inp: LineInput = { ...inp0, n1, n2 };
  const { L, theta, phi, ha, da } = inp;
  const kind = kindOf(inp);
  const a = n1.toLowerCase(), b = n2.toLowerCase(), a1 = a + '′', b1 = b + '′';

  const h = L * Math.sin(rad(theta)); // height gained
  const d = L * Math.sin(rad(phi)); // depth gained
  const dx = Math.sqrt(Math.max(0, L * L - h * h - d * d)); // run along XY
  const Lf = L * Math.cos(rad(phi)); // front view length
  const Lt = L * Math.cos(rad(theta)); // top view length
  const xyLen = Math.max(220, Math.ceil((dx + 90) / 10) * 10);

  const aF: [number, number] = [0, ha];
  const bF: [number, number] = [dx, ha + h];
  const aT: [number, number] = [0, -da];
  const bT: [number, number] = [dx, -(da + d)];

  const xy = xyPrims(-40, xyLen - 40);
  const projA = ln(0, ha + 8, 0, -da - 8, 'proj');
  const locusEnd = xyLen - 50;
  const steps: Step[] = [];

  steps.push(S('Draw the reference line XY', 'T-square + 2H pencil',
    `XY is where HP and VP meet. Draw it ${xyLen} mm long near the middle of the sheet. Front view goes above it, top view below it (first angle). Mark the projector of ${a} about 40 mm from the left end.`, xy));
  steps.push(S(`Mark ${a1} and ${a}`, 'Scale + set square',
    `${n1} is ${R(ha)} mm above HP, so ${a1} is ${R(ha)} mm above XY. ${n1} is ${R(da)} mm in front of VP, so ${a} is ${R(da)} mm below XY, on the same vertical projector.`,
    [projA, pt(0, ha, a1, -7, 2), pt(0, -da, a, -7, -6), ...(ha > 0 ? [dim(-14, 0, -14, ha, String(R(ha)), 0)] : []), ...(da > 0 ? [dim(-14, 0, -14, -da, String(R(da)), 0)] : [])],
    `${a1} = ${R(ha)} above XY · ${a} = ${R(da)} below XY`));

  if (kind === 'hp') {
    const t3 = phi === 0 ? `From ${a}, draw ${a}${b} = ${R(L)} mm parallel to XY`
      : phi === 90 ? `From ${a}, draw ${a}${b} = ${R(L)} mm perpendicular to XY`
      : `From ${a}, draw ${a}${b} = ${R(L)} mm at ${R(phi)}° to XY`;
    const w3 = phi === 0 ? 'The line is parallel to both HP and VP, so both views show the true length and both are parallel to XY.'
      : phi === 90 ? 'The line is perpendicular to VP, so its top view shows the true length and is perpendicular to XY. Its front view will be a single point.'
      : `The line is parallel to HP, so the top view shows its true length and its true angle (${R(phi)}°) with VP. Draw it going downwards from ${a}.`;
    steps.push(S(t3, 'Protractor + scale', w3,
      [ln(aT[0], aT[1], bT[0], bT[1]), ...angMark(0, aT[1], phi, -1, String(R(phi))), pt(bT[0], bT[1], b, 3, -6)], `${a}${b} = ${R(L)} mm (true length)`));
    if (isPt(Lf)) {
      steps.push(S(`Project ${b} up: ${b1} falls on ${a1}`, 'Set square + T-square',
        `The vertical projector from ${b} meets the horizontal line through ${a1} at ${a1} itself, so the front view is one point.`,
        [ln(bT[0], bT[1], bF[0], bF[1], 'proj'), ln(aF[0], aF[1], aF[0] + 14, aF[1], 'dash')]));
      steps.push(S(`Mark the point ${a1}(${b1})`, 'HB pencil', 'Write both letters at the point: the near end first, the other in brackets.', [pt(aF[0], aF[1], `${a1}(${b1})`, 3, 2)], `${a1}${b1} = 0 mm (a point)`));
    } else {
      steps.push(S(`Project ${b} up to the line through ${a1}`, 'Set square + T-square',
        `Because the line is parallel to HP, ${a1}${b1} stays parallel to XY at ${R(ha)} mm height. Draw a vertical projector from ${b} and a horizontal line from ${a1}; they meet at ${b1}.`,
        [ln(bT[0], bT[1], bF[0], bF[1], 'proj'), ln(aF[0], aF[1], bF[0] + 12, bF[1], 'dash'), pt(bF[0], bF[1], b1, 3, 2), ...callout(`locus of ${b1}`, bF[0] + 26, bF[1] + 9, bF[0] + 10, bF[1])], `${a1}${b1} = ${R(L)} cos ${R(phi)}° = ${R(Lf)} mm`));
      steps.push(S(`Join ${a1}${b1} and check`, 'Scale',
        `Join ${a1} to ${b1}. Measure it: if it is not ${R(Lf)} mm, the angle or the projector is wrong.`, [ln(aF[0], aF[1], bF[0], bF[1])], `${a1}${b1} should measure ${R(Lf)} mm`));
    }
  } else if (kind === 'vp') {
    steps.push(S(`From ${a1}, draw ${a1}${b1} = ${R(L)} mm at ${R(theta)}° to XY`, 'Protractor + scale',
      `The line is parallel to VP, so the front view shows its true length and its true angle (${R(theta)}°) with HP. Draw it going upwards from ${a1}.`,
      [ln(aF[0], aF[1], bF[0], bF[1]), ...angMark(0, ha, theta, 1, String(R(theta))), pt(bF[0], bF[1], b1, 3, 2)], `${a1}${b1} = ${R(L)} mm (true length)`));
    if (isPt(Lt)) {
      steps.push(S(`Project ${b1} down: ${b} falls on ${a}`, 'Set square + T-square',
        `The line is perpendicular to HP, so the vertical projector from ${b1} meets the horizontal line through ${a} at ${a} itself. The top view is one point.`,
        [ln(bF[0], bF[1], bT[0], bT[1], 'proj'), ln(aT[0], aT[1], aT[0] + 14, aT[1], 'dash')]));
      steps.push(S(`Mark the point ${a}(${b})`, 'HB pencil', 'Write both letters at the point: the near end first, the other in brackets.', [pt(aT[0], aT[1], `${a}(${b})`, 3, -6)], `${a}${b} = 0 mm (a point)`));
    } else {
      steps.push(S(`Project ${b1} down to the line through ${a}`, 'Set square + T-square',
        `Because the line is parallel to VP, ${a}${b} stays parallel to XY at ${R(da)} mm depth. Draw a vertical projector from ${b1} and a horizontal line from ${a}; they meet at ${b}.`,
        [ln(bF[0], bF[1], bT[0], bT[1], 'proj'), ln(aT[0], aT[1], bT[0] + 12, bT[1], 'dash'), pt(bT[0], bT[1], b, 3, -6), ...callout(`locus of ${b}`, bT[0] + 26, bT[1] - 9, bT[0] + 10, bT[1])], `${a}${b} = ${R(L)} cos ${R(theta)}° = ${R(Lt)} mm`));
      steps.push(S(`Join ${a}${b} and check`, 'Scale', `Join ${a} to ${b}. Measure it: it should be ${R(Lt)} mm.`, [ln(aT[0], aT[1], bT[0], bT[1])], `${a}${b} should measure ${R(Lt)} mm`));
    }
  } else {
    // inclined to both planes: classical two-position method with arcs
    const b1F: [number, number] = [Lt, ha + h];
    const b1T: [number, number] = [Lt, -da];
    const b2T: [number, number] = [Lf, -(da + d)];
    const b2F: [number, number] = [Lf, ha];
    steps.push(S(`Front view, line ∥ VP: draw ${a1}${b}₁′ = ${R(L)} mm at ${R(theta)}°`, 'Protractor + scale',
      `First pretend the line is parallel to VP. Then the front view is the true length ${R(L)} mm at the true angle θ = ${R(theta)}°. This fixes the height gained and gives the locus (path) of ${b1}: a horizontal line.`,
      [ln(aF[0], aF[1], b1F[0], b1F[1]), ...angMark(0, ha, theta, 1, String(R(theta))), pt(b1F[0], b1F[1], `${b}₁′`, 3, 2), ln(b1F[0], b1F[1], locusEnd, b1F[1], 'dash'), ...callout(`locus of ${b1}`, locusEnd - 14, b1F[1] + 9, locusEnd - 30, b1F[1])],
      `height gained = ${R(L)} sin ${R(theta)}° = ${R(h)} mm`));
    steps.push(S(`Project down: ${a}${b}₁ = ${R(L)} cos ${R(theta)}° = ${R(Lt)} mm`, 'Set square + T-square',
      `Drop a vertical projector from ${b}₁′ to the horizontal line through ${a}. The top view of this position is parallel to XY and ${R(Lt)} mm long. This length is the radius for a later arc.`,
      [ln(b1F[0], b1F[1], b1T[0], b1T[1], 'proj'), ln(aT[0], aT[1], b1T[0], b1T[1], 'thin'), pt(b1T[0], b1T[1], `${b}₁`, 2, -6)], `${a}${b}₁ = ${R(Lt)} mm`));
    steps.push(S(`Top view, line ∥ HP: draw ${a}${b}₂ = ${R(L)} mm at ${R(phi)}°`, 'Protractor + scale',
      `Now pretend the line is parallel to HP. The top view is the true length ${R(L)} mm at the true angle φ = ${R(phi)}°. This fixes the depth gained and gives the locus of ${b}: a horizontal line.`,
      [ln(aT[0], aT[1], b2T[0], b2T[1]), ...angMark(0, aT[1], phi, -1, String(R(phi))), pt(b2T[0], b2T[1], `${b}₂`, 3, -6), ln(b2T[0], b2T[1], locusEnd, b2T[1], 'dash'), ...callout(`locus of ${b}`, locusEnd - 14, b2T[1] - 9, locusEnd - 30, b2T[1])],
      `depth gained = ${R(L)} sin ${R(phi)}° = ${R(d)} mm`));
    steps.push(S(`Project up: ${a1}${b}₂′ = ${R(L)} cos ${R(phi)}° = ${R(Lf)} mm`, 'Set square + T-square',
      `Draw a vertical projector from ${b}₂ to the horizontal line through ${a1}. ${a1}${b}₂′ is ${R(Lf)} mm long. This is the final front view length, so it is the radius of the next arc.`,
      [ln(b2T[0], b2T[1], b2F[0], b2F[1], 'proj'), ln(aF[0], aF[1], b2F[0], b2F[1], 'thin'), pt(b2F[0], b2F[1], `${b}₂′`, 2, 2)], `${a1}${b}₂′ = ${R(Lf)} mm`));
    steps.push(S(`Arc from ${a1}, radius ${R(Lf)}, cuts the locus of ${b1}`, 'Compass',
      `Put the compass point on ${a1}, open it to ${a1}${b}₂′ (${R(Lf)} mm) and swing an arc up to the horizontal locus of ${b1}. The cut is the final point ${b1}.`,
      [arc(aF[0], aF[1], Lf, 0, deg(Math.atan2(h, dx))), pt(bF[0], bF[1], b1, 3, 2), ...callout('arc cuts here', bF[0] + 24, bF[1] + 12, bF[0] + 1.5, bF[1] + 1)], `${b1} is ${R(ha + h)} mm above XY`));
    steps.push(S(`Arc from ${a}, radius ${R(Lt)}, cuts the locus of ${b}`, 'Compass',
      `Put the compass point on ${a}, open it to ${a}${b}₁ (${R(Lt)} mm) and swing an arc to the horizontal locus of ${b}. A vertical projector from ${b1} must hit the same point ${b}. If it does not, recheck.`,
      [arc(aT[0], aT[1], Lt, 0, -deg(Math.atan2(d, dx))), ln(bF[0], bF[1], bT[0], bT[1], 'proj'), pt(bT[0], bT[1], b, 3, -6), ...callout('arc cuts here', bT[0] + 24, bT[1] - 12, bT[0] + 1.5, bT[1] - 1)], `${b} is ${R(da + d)} mm below XY`));
    steps.push(S(`Join ${a1}${b1} and ${a}${b}`, 'Scale + set square',
      `Join ${a1} to ${b1} for the front view and ${a} to ${b} for the top view. Neither shows the true length because the line is inclined to both planes.`,
      [ln(aF[0], aF[1], bF[0], bF[1]), ln(aT[0], aT[1], bT[0], bT[1])], `${a1}${b1} = ${R(Lf)} mm · ${a}${b} = ${R(Lt)} mm`));
  }

  const final: Prim[] = [
    ...xy,
    ...lineViews({ x: 0, ha, da }, { x: dx, ha: ha + h, da: da + d }, n1, n2),
    ...(ha > 0 ? [dim(-14, 0, -14, ha, String(R(ha)), 0)] : []),
    ...(da > 0 ? [dim(-14, 0, -14, -da, String(R(da)), 0)] : []),
  ];
  steps.push(S('Finish the sheet', 'HB pencil + eraser',
    `Make ${a1}${b1} and ${a}${b} thick and dark. Keep XY, projectors, arcs and construction lines thin. Label ${a1} ${b1} (front view) and ${a} ${b} (top view), and add dimensions.`,
    final, `Front view ${R(Lf)} mm · Top view ${R(Lt)} mm`));

  return { input: inp, kind, n1, n2, xyLen, aF, bF, aT, bT, L, Lf, Lt, h, d, dx, steps, final };
}
