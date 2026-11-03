import type { Solution } from './types';
import { bbox } from './geom';

/** Centres the drawing on an A3 landscape sheet (420 x 297 mm), reducing the scale only if it would not fit. */
export function sheetLayout(sol: Solution) {
  const bb = bbox(sol.final);
  const options: [number, string][] = [[2, '2:1'], [1, '1:1'], [0.5, '1:2'], [0.25, '1:4'], [0.2, '1:5']];
  let s = 1, label = '1:1';
  for (const [k, l] of options) {
    s = k; label = l;
    if ((bb.w + 16) * k <= 380 && (bb.h + 16) * k <= 215) break;
  }
  const ox = 210 - ((bb.minx + bb.maxx) / 2) * s;
  const oy = 140 + ((bb.miny + bb.maxy) / 2) * s;
  return { s, label, ox, oy };
}
