import { bbox } from './geom';
import type { Solution } from './types';
import { SHEETS, type Q } from './catalog';

export interface Page { sheetId: string; title: string; part: string; items: { q: Q; sol: Solution }[] }
export interface Placed { q: Q; sol: Solution; s: number; x: number; y: number; w: number; h: number; bb: ReturnType<typeof bbox> }

// A3 landscape, 20 mm binding margin on the left, 10 mm elsewhere
export type Paper = 'A1' | 'A3';
export const PAPER: Record<Paper, [number, number]> = { A3: [420, 297], A1: [841, 594] };
export const areaOf = (p: Paper = 'A3') => ({ x: 26, y: 16, w: PAPER[p][0] - 42, h: PAPER[p][1] - 61 });
const SCALES = [1, 0.8, 0.7, 0.6, 0.5, 0.4, 0.33, 0.25];

/** One page per part of a sheet, so a sheet looks like the paper a student hands in. */
export function pages(): Page[] {
  return SHEETS.flatMap((sh) => sh.parts.map((pt) => ({ sheetId: sh.id, title: sh.title, part: pt.title, items: pt.qs.map((q) => ({ q, sol: q.build() })) })));
}

/** Shelf packing: the largest scale at which every drawing fits, then the free space is shared out evenly. */
export function layoutPage(pg: Page, paper: Paper = 'A3'): { placed: Placed[]; scale: number } {
  const AREA = areaOf(paper);
  const bbs = pg.items.map((i) => bbox(i.sol.final));
  for (const s of SCALES) {
    const boxes = bbs.map((b) => ({ w: b.w * s + 14, h: b.h * s + 18 }));
    const rows: number[][] = [];
    let cur: number[] = [], cw = 0, ok = true;
    boxes.forEach((b, i) => {
      if (b.w > AREA.w) ok = false;
      if (cur.length && cw + b.w > AREA.w) { rows.push(cur); cur = []; cw = 0; }
      cur.push(i); cw += b.w;
    });
    if (cur.length) rows.push(cur);
    const rowH = rows.map((r) => Math.max(...r.map((i) => boxes[i].h)));
    const totalH = rowH.reduce((a, b) => a + b, 0);
    if (!ok || totalH > AREA.h) continue;
    const gapY = (AREA.h - totalH) / (rows.length + 1);
    const placed: Placed[] = [];
    let y = AREA.y + gapY;
    rows.forEach((r, ri) => {
      const sumW = r.reduce((a, i) => a + boxes[i].w, 0);
      const gapX = (AREA.w - sumW) / (r.length + 1);
      let x = AREA.x + gapX;
      r.forEach((i) => {
        placed[i] = { ...pg.items[i], s, x, y, w: boxes[i].w, h: rowH[ri], bb: bbs[i] };
        x += boxes[i].w + gapX;
      });
      y += rowH[ri] + gapY;
    });
    return { placed, scale: s };
  }
  return { placed: [], scale: 0.2 };
}
