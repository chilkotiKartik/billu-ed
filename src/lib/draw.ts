import type { LineStyle, Prim, Step } from './types';

export const R = (v: number) => Math.round(v * 100) / 100;
export const rad = (d: number) => (d * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;

export const ln = (x1: number, y1: number, x2: number, y2: number, w: LineStyle = 'thick'): Prim => ({ t: 'line', x1, y1, x2, y2, w });
/** A short quick stroke (used for lettering), drawn faster in the animation. */
export const lnf = (x1: number, y1: number, x2: number, y2: number, w: LineStyle = 'fine'): Prim => ({ t: 'line', x1, y1, x2, y2, w, f: true });
export const pt = (x: number, y: number, label: string, dx = 3, dy = 2): Prim => ({ t: 'pt', x, y, label, dx, dy });
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number, w?: LineStyle): Prim => ({ t: 'arc', cx, cy, r, a0, a1, w });
export const circle = (cx: number, cy: number, r: number, w: LineStyle = 'thick'): Prim => ({ t: 'circle', cx, cy, r, w });
export const arrow = (x1: number, y1: number, x2: number, y2: number): Prim => ({ t: 'arrow', x1, y1, x2, y2 });
export const text = (x: number, y: number, t: string, size = 1, anchor: 'start' | 'middle' | 'end' = 'start'): Prim => ({ t: 'text', x, y, text: t, size, anchor });
/** Lettering with a real height in mm (e.g. 3.5 mm in a title block), so it always stays inside its box at any zoom. */
export const textMM = (x: number, y: number, t: string, mm: number, anchor: 'start' | 'middle' | 'end' = 'start'): Prim => ({ t: 'text', x, y, text: t, mm, anchor });
export const dim = (x1: number, y1: number, x2: number, y2: number, label: string, off = 7): Prim => ({ t: 'dim', x1, y1, x2, y2, label, off });
export const S = (title: string, tool: string, why: string, prims: Prim[], calc?: string): Step => ({ title, tool, why, prims, calc });

/** A label with an arrow pointing at (px,py). The arrow starts at the edge of the text, never inside it. */
export function callout(label: string, tx: number, ty: number, px: number, py: number): Prim[] {
  const dx = px - tx, dy = py - ty;
  const hw = label.length * 1.75;
  const horizontal = Math.abs(dx) > hw + 4 && Math.abs(dy) < Math.abs(dx);
  const sx = horizontal ? tx + Math.sign(dx) * (hw + 1.5) : tx;
  const sy = horizontal ? ty + 1.4 : dy < 0 ? ty - 1.5 : ty + 4.6;
  const t = text(tx, ty, label, 0.9, 'middle'), a = arrow(sx, sy, px, py);
  if (t.t === 'text') t.n = true;
  if (a.t === 'arrow') a.n = true;
  return [t, a];
}

/** Label placed to the right of a horizontal construction line that ends at xEnd. */
export function endLabel(label: string, xEnd: number, y: number): Prim[] {
  return callout(label, xEnd + label.length * 1.75 + 9, y - 1.4, xEnd + 1, y);
}

/** Angle mark at (cx,cy) measured from the +x direction; sign=1 goes up, -1 goes down. */
export function angMark(cx: number, cy: number, ang: number, sign: 1 | -1, label: string): Prim[] {
  if (ang <= 0) return [];
  const r = 16;
  const m = rad(ang / 2) * sign;
  return [
    ln(cx, cy, cx + 28, cy, 'dash'),
    arc(cx, cy, r, 0, sign * ang),
    ang < 25
      ? text(cx + r + 16, cy + (sign === 1 ? -6 : 3), `${label}°`)
      : text(cx + (r + 6) * Math.cos(m), cy + (r + 6) * Math.sin(m), `${label}°`),
  ];
}

export function xyPrims(left: number, right: number): Prim[] {
  return [ln(left, 0, right, 0, 'thin'), text(left - 8, -2, 'X', 1.1), text(right + 3, -2, 'Y', 1.1)];
}

/** 45° hatching clipped to a rectangle. */
export function hatchRect(x0: number, y0: number, x1: number, y1: number, gap = 5): Prim[] {
  const out: Prim[] = [];
  for (let c = y0 - x1 + gap; c < y1 - x0; c += gap) {
    const xs = Math.max(x0, y0 - c), xe = Math.min(x1, y1 - c);
    if (xe - xs > 0.5) out.push(ln(xs, xs + c, xe, xe + c, 'fine'));
  }
  return out;
}

export interface P3 { x: number; ha: number; da: number } // x along XY, height above HP, distance in front of VP

/** Thick views of a line AB with projectors, labels and length dimensions. Coincident ends get one combined label. */
export function lineViews(A: P3, B: P3, n1: string, n2: string, dims = true): Prim[] {
  const a = n1.toLowerCase(), b = n2.toLowerCase();
  const aF: [number, number] = [A.x, A.ha], bF: [number, number] = [B.x, B.ha];
  const aT: [number, number] = [A.x, -A.da], bT: [number, number] = [B.x, -B.da];
  const same = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.01;
  const top = Math.max(aF[1], bF[1], aT[1], bT[1]) + 8, bot = Math.min(aF[1], bF[1], aT[1], bT[1]) - 8;
  const out: Prim[] = [ln(A.x, top, A.x, bot, 'proj')];
  if (Math.abs(B.x - A.x) > 0.01) out.push(ln(B.x, top, B.x, bot, 'proj'));
  if (!same(aF, bF)) out.push(ln(aF[0], aF[1], bF[0], bF[1]));
  if (!same(aT, bT)) out.push(ln(aT[0], aT[1], bT[0], bT[1]));
  if (same(aF, bF)) out.push(pt(aF[0], aF[1], `${a}′(${b}′)`, 3, 2));
  else out.push(pt(aF[0], aF[1], `${a}′`, -7, 2), pt(bF[0], bF[1], `${b}′`, 3, 2));
  if (same(aT, bT)) out.push(pt(aT[0], aT[1], `${a}(${b})`, 3, -6));
  else out.push(pt(aT[0], aT[1], a, -7, -6), pt(bT[0], bT[1], b, 3, -6));
  if (dims) {
    if (!same(aF, bF) && Math.hypot(bF[0] - aF[0], bF[1] - aF[1]) > 12) out.push(dim(aF[0], aF[1], bF[0], bF[1], String(R(Math.hypot(bF[0] - aF[0], bF[1] - aF[1]))), 8));
    if (!same(aT, bT) && Math.hypot(bT[0] - aT[0], bT[1] - aT[1]) > 12) out.push(dim(aT[0], aT[1], bT[0], bT[1], String(R(Math.hypot(bT[0] - aT[0], bT[1] - aT[1]))), -8));
  }
  return out;
}
