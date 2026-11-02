import type { Prim, Solution, Step } from './types';
import { R, deg, ln, pt, arc, dim, S, text, callout, endLabel, angMark, xyPrims, lineViews } from './draw';

type M = { title: string; body: string };
const COMMON = (a: string, b: string): M[] => [
  { title: 'Top view above XY', body: 'In first angle the top view goes BELOW XY (point in front of VP) and the front view ABOVE XY (point above HP).' },
  { title: 'Same thickness everywhere', body: 'XY, projectors, arcs and loci are thin. Only the final views of the line are thick and dark.' },
  { title: 'Wrong labels', body: `Front view: ${a}′ ${b}′. Top view: ${a} ${b}. Small letters only.` },
];

function mk(id: string, title: string, head: string[], steps: Step[], final: Prim[], results: { label: string; value: string }[], mist: M[]): Solution {
  steps.push(S('Finish the sheet', 'HB pencil + eraser', 'Make the views of the line thick and dark. Keep XY, projectors, arcs and loci thin. Label the points and add dimensions. Write the answer clearly.', final, results[0] ? `${results[0].label}: ${results[0].value}` : undefined));
  return { id, title, steps, final, results, header: head, mistakes: mist };
}

/** Q2: 100 mm line ∥ HP, 40 above HP, ends 25 and 50 in front of VP. Find inclination with VP. */
export function q2(id: string): Solution {
  const L = 100, ha = 40, d1 = 25, d2 = 50, dd = d2 - d1;
  const phi = deg(Math.asin(dd / L)), dx = Math.sqrt(L * L - dd * dd);
  const xy = xyPrims(-40, dx + 50);
  const final = [...xy, ...lineViews({ x: 0, ha, da: d1 }, { x: dx, ha, da: d2 }, 'A', 'B'), dim(-14, 0, -14, ha, '40', 0), dim(-14, 0, -14, -d1, '25', 0), dim(dx + 14, 0, dx + 14, -d2, '50', 0)];
  const steps: Step[] = [
    S('Draw the reference line XY', 'T-square + 2H pencil', 'Draw XY about 200 mm long near the middle of the sheet. Mark the projector of a about 40 mm from the left end.', xy),
    S("Mark a′ and a, and draw the two loci", 'Scale + T-square',
      `a′ is 40 mm above XY. a is 25 mm below XY. B is 50 mm in front of VP, so b lies on a horizontal line 50 mm below XY (locus of b). The line is parallel to HP, so b′ lies on the horizontal line 40 mm above XY (locus of b′).`,
      [ln(0, ha + 8, 0, -d1 - 8, 'proj'), pt(0, ha, "a′", -7, 2), pt(0, -d1, 'a', -7, -6), ln(0, ha, dx + 30, ha, 'dash'), ln(0, -d2, dx + 30, -d2, 'dash'), ...endLabel('locus of b′', dx + 30, ha), ...endLabel('locus of b', dx + 30, -d2)], 'a′ = 40 above · a = 25 below'),
    S('Arc from a, radius 100, cuts the locus of b', 'Compass', 'The line is parallel to HP, so the top view ab shows the TRUE LENGTH 100 mm. With centre a and radius 100 mm draw an arc to cut the locus of b. The cut is b.',
      [arc(0, -d1, L, 0, -phi), pt(dx, -d2, 'b', 3, -6)], 'ab = 100 mm (true length)'),
    S("Project b up to the locus of b′", 'Set square', 'Draw a vertical projector from b up to the horizontal line 40 mm above XY. It meets it at b′.',
      [ln(dx, -d2, dx, ha, 'proj'), pt(dx, ha, "b′", 3, 2)], `a′b′ = ${R(dx)} mm`),
    S('Join the points and measure φ', 'Scale + protractor', 'Join a′b′ and ab. The angle that ab makes with XY is the inclination of the line with VP, because the line is parallel to HP.',
      [ln(0, ha, dx, ha), ln(0, -d1, dx, -d2), ...angMark(0, -d1, phi, -1, R(phi).toString())], `sin φ = (50 − 25)/100 → φ = ${R(phi)}°`),
  ];
  return mk(id, 'Q2 · Find the inclination with VP', ['PROJECTION OF LINES', 'Line AB 100 mm, ∥ HP, 40 above HP', 'A 25 and B 50 in front of VP'], steps, final,
    [{ label: 'Inclination with VP (φ)', value: `${R(phi)}°` }, { label: "a′b′ (front view)", value: `${R(dx)} mm` }, { label: 'ab (top view = true length)', value: '100 mm' }],
    [{ title: 'Reading the angle from the wrong view', body: 'The angle with VP is seen in the TOP view because the line is parallel to HP. Do not measure it on the front view.' }, ...COMMON('a', 'b')]);
}

/** Q3: 90 mm line ∥ VP, 25 in front of VP; one end in HP, other 50 above HP. Find inclination with HP. */
export function q3(id: string): Solution {
  const L = 90, da = 25, hb = 50;
  const theta = deg(Math.asin(hb / L)), dx = Math.sqrt(L * L - hb * hb);
  const xy = xyPrims(-40, dx + 50);
  const final = [...xy, ...lineViews({ x: 0, ha: 0, da }, { x: dx, ha: hb, da }, 'A', 'B'), dim(-14, 0, -14, -da, '25', 0), dim(dx + 14, 0, dx + 14, hb, '50', 0)];
  const steps: Step[] = [
    S('Draw the reference line XY', 'T-square + 2H pencil', 'Draw XY about 190 mm long. Mark the projector of a about 40 mm from the left end.', xy),
    S("Mark a′ on XY and a below it, then draw the loci", 'Scale + T-square',
      "End A is in HP, so a′ is ON XY. The line is 25 mm in front of VP, so a is 25 mm below XY, and b is on the same horizontal line (locus of b). The other end is 50 mm above HP, so b′ lies on a horizontal line 50 mm above XY (locus of b′).",
      [ln(0, 8, 0, -da - 8, 'proj'), pt(0, 0, "a′", -7, 2), pt(0, -da, 'a', -7, -6), ln(0, hb, dx + 30, hb, 'dash'), ln(0, -da, dx + 30, -da, 'dash'), ...endLabel('locus of b′', dx + 30, hb), ...endLabel('locus of b', dx + 30, -da)], "a′ on XY · a = 25 below"),
    S("Arc from a′, radius 90, cuts the locus of b′", 'Compass', 'The line is parallel to VP, so the front view a′b′ shows the TRUE LENGTH 90 mm. With centre a′ and radius 90 mm draw an arc to cut the locus of b′. The cut is b′.',
      [arc(0, 0, L, 0, theta), pt(dx, hb, "b′", 3, 2)], "a′b′ = 90 mm (true length)"),
    S('Project b′ down to the locus of b', 'Set square', 'Draw a vertical projector from b′ down to the horizontal line through a. It meets it at b.', [ln(dx, hb, dx, -da, 'proj'), pt(dx, -da, 'b', 3, -6)], `ab = 90 cos θ = ${R(dx)} mm`),
    S('Join the points and measure θ', 'Scale + protractor', 'Join a′b′ and ab. The angle that a′b′ makes with XY is the inclination of the line with HP, because the line is parallel to VP.',
      [ln(0, 0, dx, hb), ln(0, -da, dx, -da), ...angMark(0, 0, theta, 1, R(theta).toString())], `sin θ = 50/90 → θ = ${R(theta)}°`),
  ];
  return mk(id, 'Q3 · Find the inclination with HP', ['PROJECTION OF LINES', 'Line AB 90 mm, ∥ VP, 25 in front of VP', 'A in HP, B 50 above HP'], steps, final,
    [{ label: 'Inclination with HP (θ)', value: `${R(theta)}°` }, { label: "a′b′ (front view = true length)", value: '90 mm' }, { label: 'ab (top view)', value: `${R(dx)} mm` }],
    [{ title: 'Reading the angle from the wrong view', body: 'The angle with HP is seen in the FRONT view because the line is parallel to VP.' }, ...COMMON('a', 'b')]);
}

/** Q4: top view of 75 mm line measures 55 mm; line in VP; one end 25 above HP. */
export function q4(id: string): Solution {
  const L = 75, Lt = 55, ha = 25;
  const theta = deg(Math.acos(Lt / L)), h = Math.sqrt(L * L - Lt * Lt);
  const xy = xyPrims(-40, 150);
  const final = [...xy, ...lineViews({ x: 0, ha, da: 0 }, { x: Lt, ha: ha + h, da: 0 }, 'A', 'B'), dim(-14, 0, -14, ha, '25', 0)];
  const steps: Step[] = [
    S('Draw the reference line XY', 'T-square + 2H pencil', 'Draw XY about 190 mm long. Mark the projector of a about 40 mm from the left end.', xy),
    S("Mark a′ 25 mm above XY and a on XY", 'Scale + set square', 'The line is in VP, so the whole top view lies ON XY. End A is 25 mm above HP, so a′ is 25 mm above XY and a is on XY below it.',
      [ln(0, ha + 8, 0, -8, 'proj'), pt(0, ha, "a′", -7, 2), pt(0, 0, 'a', -7, -6), dim(-14, 0, -14, ha, '25', 0)], "a′ = 25 above XY"),
    S('Draw the top view ab = 55 mm along XY', 'Scale', 'The top view measures 55 mm and lies on XY. Mark b on XY, 55 mm from a.', [ln(0, 0, Lt, 0), pt(Lt, 0, 'b', 3, -6), dim(0, 0, Lt, 0, '55', -9)], 'ab = 55 mm'),
    S("Draw the vertical locus of b′", 'Set square', 'Draw a vertical projector upward from b. The front view b′ must lie on it.', [ln(Lt, 0, Lt, ha + h + 12, 'dash'), ...callout('locus of b′', Lt + 30, ha + h + 8, Lt + 1, ha + h + 8)]),
    S("Arc from a′, radius 75, cuts the projector at b′", 'Compass', 'The line is in VP, so its front view shows the TRUE LENGTH 75 mm. With centre a′ and radius 75 mm draw an arc to cut the projector. The cut is b′.',
      [arc(0, ha, L, 0, theta), pt(Lt, ha + h, "b′", 3, 2)], `b′ is ${R(ha + h)} mm above XY`),
    S('Join a′b′ and measure θ', 'Scale + protractor', 'Join a′ to b′. This is the front view and the true length. The angle with XY is the inclination with HP.',
      [ln(0, ha, Lt, ha + h), ...angMark(0, ha, theta, 1, R(theta).toString())], `cos θ = 55/75 → θ = ${R(theta)}°`),
  ];
  return mk(id, 'Q4 · Top view length given', ['PROJECTION OF LINES', 'Line AB 75 mm, in VP, top view 55 mm', 'End A 25 mm above HP'], steps, final,
    [{ label: 'Inclination with HP (θ)', value: `${R(theta)}°` }, { label: "b′ height above XY", value: `${R(ha + h)} mm` }, { label: "a′b′ (true length)", value: '75 mm' }],
    [{ title: 'Drawing the top view away from XY', body: 'The line is IN the VP, so its top view lies exactly ON XY, not below it.' }, ...COMMON('a', 'b')]);
}

/** Q5: front view of a line inclined 30° to VP is 65 mm; line ∥ HP, 40 above HP; one end 30 in front of VP. */
export function q5(id: string): Solution {
  const phi = 30, Lf = 65, ha = 40, da = 30;
  const L = Lf / Math.cos((phi * Math.PI) / 180), d = L * Math.sin((phi * Math.PI) / 180);
  const xy = xyPrims(-40, Lf + 60);
  const final = [...xy, ...lineViews({ x: 0, ha, da }, { x: Lf, ha, da: da + d }, 'A', 'B'), dim(-14, 0, -14, ha, '40', 0), dim(-14, 0, -14, -da, '30', 0)];
  const steps: Step[] = [
    S('Draw the reference line XY', 'T-square + 2H pencil', 'Draw XY about 170 mm long. Mark the projector of a about 40 mm from the left end.', xy),
    S("Mark a′ 40 mm above XY and a 30 mm below XY", 'Scale + set square', 'The line is parallel to HP and 40 mm above it, so the whole front view is 40 mm above XY. End A is 30 mm in front of VP, so a is 30 mm below XY.',
      [ln(0, ha + 8, 0, -da - 8, 'proj'), pt(0, ha, "a′", -7, 2), pt(0, -da, 'a', -7, -6), dim(-14, 0, -14, ha, '40', 0), dim(-14, 0, -14, -da, '30', 0)], "a′ = 40 above · a = 30 below"),
    S("Draw the front view a′b′ = 65 mm parallel to XY", 'Scale + T-square', 'The line is parallel to HP, so its front view is parallel to XY. Draw a′b′ = 65 mm, 40 mm above XY.',
      [ln(0, ha, Lf, ha), pt(Lf, ha, "b′", 3, 2), dim(0, ha, Lf, ha, '65', 9)], "a′b′ = 65 mm"),
    S('Project b′ down: the locus of b', 'Set square', 'Draw a vertical projector from b′ downwards. The top view b must lie on it.', [ln(Lf, ha, Lf, -da - d - 10, 'dash'), ...callout('locus of b', Lf + 30, -da - d - 8, Lf + 1, -da - d - 8)]),
    S('From a draw a line at 30° to XY: it cuts the projector at b', 'Protractor + T-square', 'The line is parallel to HP, so the top view shows the TRUE angle φ = 30° with XY. Draw a line from a at 30° to XY, going downwards. Where it meets the projector is b.',
      [ln(0, -da, Lf, -da - d), ...angMark(0, -da, phi, -1, '30'), pt(Lf, -da - d, 'b', 3, -6)], `ab = 65 / cos 30° = ${R(L)} mm`),
    S('Measure ab: the true length', 'Scale', 'The top view ab is the true length of the line, because the line is parallel to HP.', [dim(0, -da, Lf, -da - d, R(L).toString(), -9)], `true length = ${R(L)} mm`),
  ];
  return mk(id, 'Q5 · Front view length given', ['PROJECTION OF LINES', 'Line ∥ HP, 40 above HP, φ = 30°', 'Front view 65 mm, A 30 in front of VP'], steps, final,
    [{ label: 'True length of the line', value: `${R(L)} mm` }, { label: "a′b′ (front view)", value: '65 mm' }, { label: 'b below XY', value: `${R(da + d)} mm` }],
    [{ title: 'Using 65 mm as the true length', body: '65 mm is only the FRONT view. The true length is longer: 65 ÷ cos 30° = 75.06 mm. It is seen in the top view.' }, ...COMMON('a', 'b')]);
}

/** Q6: vertical line AB 75 mm (A in HP, 25 in front of VP); line AC 100 mm in HP, ∥ VP. Join BC; find inclination with HP. */
export function q6(id: string): Solution {
  const da = 25, AB = 75, AC = 100, BC = Math.hypot(AB, AC), theta = deg(Math.atan2(AB, AC));
  const xy = xyPrims(-40, 150);
  const fv: Prim[] = [ln(0, 0, 0, AB), ln(0, 0, AC, 0), ln(0, AB, AC, 0)];
  const tv: Prim[] = [ln(0, -da, AC, -da)];
  const labels: Prim[] = [pt(0, AB, "b′", -7, 2), pt(0, 0, "a′", -8, 2), pt(AC, 0, "c′", 3, 2), pt(0, -da, 'a(b)', -14, -6), pt(AC, -da, 'c', 3, -6)];
  const final = [...xy, ln(0, AB + 8, 0, -da - 8, 'proj'), ln(AC, 8, AC, -da - 8, 'proj'), ...fv, ...tv, ...labels, dim(0, -da, AC, -da, '100', -9), dim(-14, 0, -14, AB, '75', 0), dim(-14, 0, -14, -da, '25', 0)];
  const steps: Step[] = [
    S('Draw the reference line XY', 'T-square + 2H pencil', 'Draw XY about 190 mm long. Mark the projector of a about 40 mm from the left end.', xy),
    S("Mark a′ on XY and a 25 mm below", 'Scale + set square', 'End A is in HP, so a′ is ON XY. A is 25 mm in front of VP, so a is 25 mm below XY on the same projector.',
      [ln(0, 8, 0, -da - 8, 'proj'), pt(0, 0, "a′", -8, 2), pt(0, -da, 'a', -8, -6), dim(-14, 0, -14, -da, '25', 0)], "a on the projector, 25 below XY"),
    S('Line AB is vertical: draw a′b′ = 75 mm upwards', 'Scale + set square', 'AB is a vertical line (perpendicular to HP). Its front view is a vertical line of the TRUE length 75 mm. Its top view is a single point, so b falls on a.',
      [ln(0, 0, 0, AB), pt(0, AB, "b′", -8, 2), pt(0, -da, 'a(b)', -16, -6), dim(-14, 0, -14, AB, '75', 0)], "a′b′ = 75 mm · top view is a point"),
    S('Line AC is in HP and ∥ VP: draw a′c′ and ac = 100 mm', 'Scale + T-square', 'AC is in HP, so its front view lies ON XY. It is parallel to VP, so its front view shows the true length. Draw a′c′ = 100 mm along XY. Project c down to the horizontal line through a.',
      [ln(0, 0, AC, 0), pt(AC, 0, "c′", 3, 2), ln(AC, 8, AC, -da - 8, 'proj'), ln(0, -da, AC, -da), pt(AC, -da, 'c', 3, -6), dim(0, -da, AC, -da, '100', -9)], "a′c′ = ac = 100 mm"),
    S('Join b′c′ and bc', 'Scale + set square', 'Join b′ to c′ for the front view of BC. Join b to c for its top view; b is on a, so bc lies along ac. B and C are both 25 mm in front of VP, so BC is parallel to VP and b′c′ is its TRUE LENGTH.',
      [ln(0, AB, AC, 0), ln(0, -da, AC, -da)], `BC = √(75² + 100²) = ${R(BC)} mm`),
    S('Measure the inclination of BC with HP', 'Protractor', 'The angle between b′c′ and XY, measured at c′, is the inclination of BC with HP (because BC is parallel to VP).',
      [arc(AC, 0, 18, 180 - theta, 180), text(AC - 34, 6, `${R(theta)}°`)], `tan θ = 75/100 → θ = ${R(theta)}°`),
  ];
  return mk(id, 'Q6 · Vertical line AB and line AC', ['PROJECTION OF LINES', 'AB 75 mm vertical, AC 100 mm in HP ∥ VP', 'A in HP, 25 in front of VP'], steps, final,
    [{ label: 'Inclination of BC with HP', value: `${R(theta)}°` }, { label: 'True length of BC', value: `${R(BC)} mm` }, { label: "Top view of AB", value: 'a point: a(b)' }],
    [{ title: 'Drawing AB’s top view as a line', body: 'A vertical line (perpendicular to HP) has a POINT as its top view. b falls exactly on a.' }, { title: 'Putting a′c′ above XY', body: 'AC lies in HP, so its front view is ON XY.' }, ...COMMON('a', 'b')]);
}
