import type { Prim, Solution, Step } from './types';
import { ln, lnf, S, text } from './draw';

type Pl = [number, number][];
// Single-stroke upright capitals on a 4 × 6 grid (the BIS "gothic" style). Each glyph is a list of polylines.
const G: Record<string, Pl[]> = {
  A: [[[0, 0], [0, 4], [2, 6], [4, 4], [4, 0]], [[0, 3], [4, 3]]],
  B: [[[0, 0], [0, 6], [3, 6], [4, 5], [4, 4], [3, 3], [4, 2], [4, 1], [3, 0], [0, 0]], [[0, 3], [3, 3]]],
  C: [[[4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0], [3, 0], [4, 1]]],
  D: [[[0, 0], [0, 6], [2, 6], [4, 4], [4, 2], [2, 0], [0, 0]]],
  E: [[[4, 6], [0, 6], [0, 0], [4, 0]], [[0, 3], [3, 3]]],
  F: [[[4, 6], [0, 6], [0, 0]], [[0, 3], [3, 3]]],
  G: [[[4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 3], [2, 3]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[1, 6], [3, 6]], [[2, 6], [2, 0]], [[1, 0], [3, 0]]],
  J: [[[4, 6], [4, 1], [3, 0], [1, 0], [0, 1]]],
  K: [[[0, 0], [0, 6]], [[4, 6], [0, 2.5]], [[1.5, 3.7], [4, 0]]],
  L: [[[0, 6], [0, 0], [4, 0]]],
  M: [[[0, 0], [0, 6], [2, 3], [4, 6], [4, 0]]],
  N: [[[0, 0], [0, 6], [4, 0], [4, 6]]],
  O: [[[1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 1], [3, 0], [1, 0]]],
  P: [[[0, 0], [0, 6], [3, 6], [4, 5], [4, 4], [3, 3], [0, 3]]],
  Q: [[[1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 1], [3, 0], [1, 0]], [[2.5, 1.5], [4, -0.5]]],
  R: [[[0, 0], [0, 6], [3, 6], [4, 5], [4, 4], [3, 3], [0, 3]], [[2, 3], [4, 0]]],
  S: [[[4, 5], [3, 6], [1, 6], [0, 5], [0, 4], [1, 3], [3, 3], [4, 2], [4, 1], [3, 0], [1, 0], [0, 1]]],
  T: [[[0, 6], [4, 6]], [[2, 6], [2, 0]]],
  U: [[[0, 6], [0, 1], [1, 0], [3, 0], [4, 1], [4, 6]]],
  V: [[[0, 6], [2, 0], [4, 6]]],
  W: [[[0, 6], [1, 0], [2, 3], [3, 0], [4, 6]]],
  X: [[[0, 6], [4, 0]], [[4, 6], [0, 0]]],
  Y: [[[0, 6], [2, 3], [4, 6]], [[2, 3], [2, 0]]],
  Z: [[[0, 6], [4, 6], [0, 0], [4, 0]]],
  '0': [[[1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 1], [3, 0], [1, 0]]],
  '1': [[[1, 5], [2, 6], [2, 0]], [[1, 0], [3, 0]]],
  '2': [[[0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [0, 0], [4, 0]]],
  '3': [[[0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [1.5, 3]], [[3, 3], [4, 2], [4, 1], [3, 0], [1, 0], [0, 1]]],
  '4': [[[3, 0], [3, 6], [0, 2], [4, 2]]],
  '5': [[[4, 6], [0, 6], [0, 3], [3, 3], [4, 2], [4, 1], [3, 0], [1, 0], [0, 1]]],
  '6': [[[4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]]],
  '7': [[[0, 6], [4, 6], [1.5, 0]]],
  '8': [[[1, 3], [0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [3, 3]]],
  '9': [[[4, 3], [1, 3], [0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 1], [3, 0], [1, 0], [0, 1]]],
};

const H = 10, K = H / 6, PITCH = 9.5;

/** One run of capital letters starting at (x, y) with letter height 10 mm. */
function run(str: string, x0: number, y0: number): Prim[] {
  const out: Prim[] = [];
  [...str].forEach((c, i) => {
    const g = G[c]; if (!g) return;
    const ox = x0 + i * PITCH;
    g.forEach((pl) => { for (let k = 0; k < pl.length - 1; k++) out.push(lnf(ox + pl[k][0] * K, y0 + pl[k][1] * K, ox + pl[k + 1][0] * K, y0 + pl[k + 1][1] * K)); });
  });
  return out;
}

const ROWS: { y: number; s: string }[] = [
  { y: 80, s: 'ABCDEFGHIJKLM' },
  { y: 55, s: 'NOPQRSTUVWXYZ' },
  { y: 30, s: '0123456789' },
  { y: 5, s: 'LINES AND LETTERING' },
];
const guides = (y: number, n: number): Prim[] => [ln(-4, y, n * PITCH + 2, y, 'dash'), ln(-4, y + H, n * PITCH + 2, y + H, 'dash')];

export function letteringSolution(id = 's1-lettering'): Solution {
  const guideAll = ROWS.flatMap((r) => guides(r.y, r.s.length));
  const demo: Prim[] = [
    ...run('H', 0, 104), ln(-4, 104, 70, 104, 'dash'), ln(-4, 114, 70, 114, 'dash'), text(12, 107, 'height 10 mm', 0.8), text(12, 98, 'width 6.7 mm (2/3 of height)', 0.8),
  ];
  const steps: Step[] = [
    S('Guide lines for the letters', '4H pencil, very faint',
      'Capital letters are 10 mm high. Draw two faint horizontal guide lines 10 mm apart for every row of letters. Keep them light so they can be rubbed out or left behind.',
      [...guideAll.slice(0, 2), ...guideAll.slice(2)], 'row height 10 mm · gap between rows 15 mm'),
    S('Proportions of one letter', 'H pencil',
      'Every letter is 10 mm high. Its width is about two thirds of the height (6.7 mm), and the gap between letters is about 2 mm. The line is as thick as one tenth of the height (1 mm).',
      demo, 'height 10 · width 6.7 · gap 2 · thickness 1'),
    S('Row 1: A to M', 'H pencil, sharp',
      'Draw each letter with straight, firm strokes, vertical first, then horizontal, then slanted. Keep the same height and the same gap. Do not lift the pencil more than needed.',
      run(ROWS[0].s, 0, ROWS[0].y), '13 letters × 9.5 mm pitch'),
    S('Row 2: N to Z', 'H pencil, sharp', 'Curved letters (C, G, O, Q, S, U) are built from short straight strokes. Check that O and Q are as wide as the other letters.',
      run(ROWS[1].s, 0, ROWS[1].y), '13 letters × 9.5 mm pitch'),
    S('Row 3: numerals 0 to 9', 'H pencil, sharp', 'Numerals are the same height as capitals. Keep 1 narrow and 0 round. The width of 4 and 7 is the same as the other digits.',
      run(ROWS[2].s, 0, ROWS[2].y), '10 digits × 9.5 mm pitch'),
    S('Row 4: write a sentence', 'H pencil, sharp', 'A word space is about 6 mm, the width of one letter. Write your college name this way on your sheet, in capitals.',
      run(ROWS[3].s, 0, ROWS[3].y), 'word space = 6 mm'),
  ];
  const final = [...guideAll, ...ROWS.flatMap((r) => run(r.s, 0, r.y))];
  steps.push(S('Check', 'Eyes + scale', 'All letters should touch both guide lines, lean the same way (upright here) and have the same gaps. Fix any letter that is too wide or too short.', final));
  return {
    id, title: 'Sheet 1 · Lettering', steps, final,
    results: [{ label: 'Letter height', value: '10 mm' }, { label: 'Letter width', value: '≈ 6.7 mm (2/3 of height)' }, { label: 'Gap between letters', value: '≈ 2 mm' }, { label: 'Pencil', value: 'H, sharp' }],
    header: ['LETTERING', 'Single-stroke upright capitals', 'Height 10 mm'],
    mistakes: [
      { title: 'Letters of different heights', body: 'Always draw two guide lines and make every letter touch both.' },
      { title: 'Uneven gaps', body: 'Keep the space between letters about 2 mm. Letters like L, T and V need slightly less space.' },
      { title: 'Round letters too narrow', body: 'C, G, O, Q and S should be as wide as the other letters.' },
      { title: 'Letters too dark and thick', body: 'Use a sharp H pencil. Line thickness is about 1/10 of the height.' },
    ],
  };
}
