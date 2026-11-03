import type { Prim, Solution, Step } from './types';
import { ln, arc, circle, dim, S, text, textMM, callout, arrow, hatchRect } from './draw';

/**
 * Sheet 1: the textbook figure "Types of lines" (Fig. 3-2): a lug with a base plate.
 * Front view on top, top view below it (as in the book), all dimensions in mm, y up.
 */
const FV_HOLE = { x: 25, y: 30, r: 10 };
const PV_C = { x: 65, y: -65 };

const fvOutline: Prim[] = [
  ln(0, 0, 90, 0), ln(90, 0, 90, 10), ln(90, 10, 50, 10), ln(0, 0, 0, 30), ln(50, 10, 50, 30),
  arc(25, 30, 25, 0, 180, 'thick'), circle(FV_HOLE.x, FV_HOLE.y, FV_HOLE.r, 'thick'),
];
const pvOutline: Prim[] = [
  ln(0, -40, 65, -40), ln(0, -90, 65, -90), ln(0, -90, 0, -40),
  arc(PV_C.x, PV_C.y, 25, -90, 90, 'thick'), circle(PV_C.x, PV_C.y, 10, 'thick'),
];
const hidden: Prim[] = [ln(0, 10, 50, 10, 'hidden'), ln(55, 0, 55, 10, 'hidden'), ln(75, 0, 75, 10, 'hidden')];
const centre: Prim[] = [
  ln(25, 6, 25, 60, 'centre'), ln(-12, 30, 62, 30, 'centre'), ln(65, -4, 65, 14, 'centre'),
  ln(-8, -65, 100, -65, 'centre'), ln(23, -36, 23, -94, 'centre'), ln(65, -36, 65, -94, 'centre'),
];
const dims: Prim[] = [dim(0, 0, 90, 0, '90', -14)];
const leader: Prim[] = [arrow(88, -42, 72.07, -57.93), ln(88, -42, 98, -42, 'fine'), text(99.5, -44, 'Ø20', 0.85, 'start')];
const blocks: [number, number, number, number][] = [[0, -52, 14, -40], [32, -52, 46, -40], [0, -90, 14, -78], [32, -90, 46, -78]];
const hatch: Prim[] = [
  ln(0, -52, 65, -52), ln(0, -78, 65, -78), ln(14, -52, 14, -40), ln(32, -52, 32, -40), ln(46, -52, 46, -40), ln(14, -90, 14, -78), ln(32, -90, 32, -78), ln(46, -90, 46, -78),
  ...blocks.flatMap(([a, b, c, d]) => hatchRect(a, b, c, d, 3)),
];
const cutting: Prim[] = [
  ln(-12, 30, -4, 30, 'thick'), ln(54, 30, 62, 30, 'thick'),
  arrow(-10, 44, -10, 31), arrow(60, 44, 60, 31),
  text(-14, 46, 'P', 0.9, 'end'), text(63, 46, 'P', 0.9, 'start'),
];

/**
 * Border and title block of the real sheet: A2 (594 x 420, landscape), 20 mm filing margin on the left and
 * 10 mm on the other sides (border 564 x 400). The figure is drawn at 2 : 1 so it fills the sheet, so one
 * drawing unit here = 2 mm of paper (K = 0.5 units per paper mm). Title block 200 x 70 at the bottom right,
 * laid out like the class sheet: TITLE across the top, then NAME ... REMARK, with "ALL DIMENSIONS ARE IN MM",
 * the scale and the first-angle projection symbol on the right.
 */
const K = 0.5;
const L = -80, R = L + 564 * K, B = -122, T = B + 400 * K;
// Title block 220 x 56 (paper mm), same layout as every other sheet in the app.
const mm = (v: number) => v * K;
const TW = 220, TH = 56, RH = TH / 3, C1 = 146, D1 = 74, D2 = 128;
const X0 = R - mm(TW), Y0 = B + mm(TH);              // top-left corner of the block (y is up)
const X = (v: number) => X0 + mm(v), Y = (v: number) => Y0 - mm(v); // block coordinates: v from the top-left
const cell = (x1: number, x2: number, top: number, label: string, value: string, vmm = 6): Prim[] => [
  textMM((X(x1) + X(x2)) / 2, Y(top + 5.6), label, mm(3), 'middle'),
  textMM((X(x1) + X(x2)) / 2, Y(top + 14), value, mm(vmm), 'middle'),
];
const symbol: Prim[] = [ // first-angle symbol: frustum (left) and its end view as two circles (right)
  ln(X(C1 + 6), Y(RH + 9), X(C1 + 14), Y(RH + 10.6), 'fine'), ln(X(C1 + 14), Y(RH + 10.6), X(C1 + 14), Y(RH + 14.6), 'fine'),
  ln(X(C1 + 14), Y(RH + 14.6), X(C1 + 6), Y(RH + 16.2), 'fine'), ln(X(C1 + 6), Y(RH + 16.2), X(C1 + 6), Y(RH + 9), 'fine'),
  circle(X(C1 + 21), Y(RH + 12.6), mm(3.2), 'fine'), circle(X(C1 + 21), Y(RH + 12.6), mm(1.8), 'fine'),
];
const frame: Prim[] = [
  ln(L, B, R, B), ln(R, B, R, T), ln(R, T, L, T), ln(L, T, L, B),
  ln(X0, Y0, R, Y0), ln(X0, B, X0, Y0),
  ln(X0, Y(RH), R, Y(RH), 'fine'), ln(X0, Y(2 * RH), R, Y(2 * RH), 'fine'),
  ln(X(C1), Y0, X(C1), Y(2 * RH), 'fine'), ln(X(D1), Y(2 * RH), X(D1), B, 'fine'), ln(X(D2), Y(2 * RH), X(D2), B, 'fine'),
  ...cell(0, C1, 0, 'NAME OF FIRM / INSTITUTION', 'YOUR INSTITUTION'),
  ...cell(C1, TW, 0, 'DRAWING NO.', 'SHEET-01'),
  ...cell(0, C1, RH, 'TITLE OF DRAWING', 'LINES AND DIMENSIONING'),
  textMM((X(C1) + X(TW)) / 2, Y(RH + 5.6), 'PROJ. / SCALE', mm(3), 'middle'), textMM(X(C1 + 52), Y(RH + 14.2), '2 : 1', mm(6), 'middle'), ...symbol,
  ...cell(0, D1, 2 * RH, 'DRAWN BY', 'YOUR NAME', 5.5),
  ...cell(D1, D2, 2 * RH, 'CHECKED BY', 'FACULTY', 5.5),
  ...cell(D2, TW, 2 * RH, 'REMARKS / STANDARD', 'ALL DIMENSIONS IN MM', 4.6),
];

/** A permanent name label: capital letters with a thin arrow to the line it names. */
const name = (t: string, tx: number, ty: number, px: number, py: number, anchor: 'start' | 'end' | 'middle' = 'start'): Prim[] => [text(tx, ty, t, 0.62, anchor), arrow(tx + (anchor === 'end' ? 1 : anchor === 'middle' ? 0 : -1), ty + 0.8, px, py)];
const names: Prim[] = [
  ...name('OUTLINE (A)', -10, 22, -0.6, 19, 'end'),
  ...name('CENTRE LINE (G)', 14, 66, 25, 60, 'end'),
  ...name('CUTTING-PLANE LINE (H)', 44, 66, 61, 32),
  ...name('HIDDEN LINE (E)', 72, 24, 75, 6),
  ...name('DIMENSION LINE (B)', -8, -24, 10, -14.6, 'end'),
  ...name('EXTENSION LINE (B)', 96, -18, 90.4, -12),
  ...name('SECTION LINE (D)', -8, -36, 6, -46, 'end'),
  ...name('LEADER LINE (B)', 104, -31, 80, -50.5),
];

export function sheet1Solution(id = 's1'): Solution {
  const steps: Step[] = [
    S('Border and title block', 'H pencil + scale',
      'Keep the A2 sheet landscape (594 × 420). Draw the border with THICK lines: 20 mm from the left edge (space for filing) and 10 mm from the other three edges. Draw the title block 220 × 56 at the bottom right in three rows: NAME OF FIRM / INSTITUTION and DRAWING NO.; TITLE OF DRAWING and PROJ. / SCALE with the first-angle symbol; DRAWN BY, CHECKED BY and REMARKS (ALL DIMENSIONS IN MM). Small labels 3 mm, entries 6 mm, all capitals. The figure is drawn at 2 : 1 (twice full size) so it fills the sheet, but the dimensions still show the true size.',
      frame, 'border 564 × 400 · margins 20 left, 10 others · title block 220 × 56 · scale 2 : 1'),
    S('Line A: outline of the front view', 'H pencil, sharp',
      'Draw the visible edges with a continuous THICK line: the base plate 90 mm long and 10 mm thick, the lug 50 mm wide with a semicircular top of radius 25, and the hole Ø20 at the centre of the arc, 30 mm above the base.',
      [...fvOutline, ...callout('A · outline', -38, 24, -0.8, 18)], 'base 90 × 10 · lug 50 wide · R25 · hole Ø20'),
    S('Line A: outline of the top view', 'H pencil, sharp',
      'Draw the top view directly below the front view, 50 mm from it. It is 50 mm wide. The right end is a half circle of radius 25, with the hole Ø20 at its centre. The overall length is again 90 mm.',
      [...pvOutline, ...callout('A · outline', -38, -62, -0.8, -62)], 'width 50 · length 65 + R25 = 90'),
    S('Line E: hidden lines', 'H pencil',
      'The hole in the base plate cannot be seen from the front. Show it with short DASHES: dash 3 mm, gap 1 mm, equal gaps, joined at corners. Also dash the line where the lug meets the base.',
      [...hidden, ...callout('E · hidden line', 84, 26, 75.5, 5)], 'dash 3 mm · gap 1 mm'),
    S('Line G: centre lines', '2H pencil',
      'Draw thin chain lines (long dash, short dash, long dash) through the centre of every circle and arc. They cross at long dashes and stick out 3 to 4 mm past the circle.',
      [...centre, ...callout('G · centre line', 40, 70, 25.6, 60)], 'long–short–long'),
    S('Line B: extension and dimension lines', '2H pencil',
      'Draw two thin EXTENSION lines down from the ends of the base, leaving a small gap from the object. Between them draw a thin DIMENSION line with arrowheads at both ends and write 90 on it.',
      [...dims, ...callout('B · extension line', 118, -24, 90.5, -12), ...callout('B · dimension line', 40, -27, 60, -14.8)], 'arrowhead 6 mm long, 2 mm wide (1:3)'),
    S('Line B: leader line', '2H pencil',
      'A LEADER starts at a note and ends with an arrowhead that touches the feature. Draw it at about 45° so it points to the centre of the hole, and write Ø20 at the other end.',
      [...leader, ...callout('B · leader line', 124, -56, 88, -43)], 'arrow touches the circle'),
    S('Line D: section lines (hatching)', '2H pencil + 45° set square',
      'In the top view, the cut parts are hatched with thin 45° lines about 3 mm apart. The slot between the blocks is empty, so it is NOT hatched.',
      [...hatch, ...callout('D · section line', -36, -46, -0.8, -46)], '45° · 3 mm apart'),
    S('Line H: cutting-plane line', '2H and H pencil',
      'Show where the object is cut with a thin chain line that is THICK at both ends. The arrows at the ends point in the direction you look from, and are marked P.',
      [...cutting, ...callout('H · cutting-plane line', 84, 56, 61, 31)], 'thick ends · arrows show the view'),
    S('Write the names in capital letters', 'H pencil, 3.5 mm letters',
      'Write the name of each line in CAPITAL letters 3.5 mm high, with its letter (A, B, D, E, G, H) in brackets, and a thin arrow to the line it names. Keep the words clear of the drawing.',
      names, 'letter height 3.5 mm'),
  ];
  // The border is part of the lesson (step 1), but not of `final`: the A3 sheet preview and the full-sheet pages draw their own border and title block.
  const final: Prim[] = [...fvOutline, ...pvOutline, ...hidden, ...centre, ...dims, ...leader, ...hatch, ...cutting, ...names];
  steps.push(S('Check every line against the key', 'Eyes + scale', 'Compare each line with the key: A is the darkest, B and G are thin, E is dashed, D is thin hatching, H is a chain with thick ends. Fix the weight of each line before you finish.', final));
  return {
    id, title: 'Sheet 1 · Types of lines', steps, final,
    results: [
      { label: 'A · Outline', value: 'continuous thick (H pencil)' },
      { label: 'B · Dimension / extension / leader', value: 'continuous thin (2H)' },
      { label: 'D · Section lines', value: 'thin 45° hatching (2H)' },
      { label: 'E · Hidden', value: 'dashed, 3 mm dash, 1 mm gap' },
      { label: 'G · Centre', value: 'thin chain (long–short)' },
      { label: 'H · Cutting plane', value: 'thin chain, thick ends' },
    ],
    header: ['LINES AND DIMENSIONING', 'IS / BIS conventions (SP 46)', 'Base 90 × 10, lug R25, hole Ø20'],
    mistakes: [
      { title: 'Every line the same weight', body: 'The sheet is about line weight. A is thick and dark. B, D, G and H (between the ends) are thin. If all lines look alike you lose the marks.' },
      { title: 'Hidden dashes too long or too far apart', body: 'Dash about 3 mm and gap about 1 mm, equal all along the line. Dashes must touch at corners.' },
      { title: 'Centre lines too short or solid', body: 'Use long–short–long. Cross at long dashes, and extend 3 to 4 mm beyond the circle.' },
      { title: 'Arrowheads wrong', body: 'Arrowheads are filled and slim: width : length = 1 : 3 (about 2 mm × 6 mm). A leader must touch the feature.' },
      { title: 'Hatching in the slot', body: 'Hatch only the solid material that the plane cuts. Keep the 45° lines evenly spaced.' },
      { title: 'Cutting-plane ends not thick', body: 'Only the ends of H are thick. The middle is thin chain.' },
    ],
  };
}
