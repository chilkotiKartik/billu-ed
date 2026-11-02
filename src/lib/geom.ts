import type { Prim } from './types';

export function bbox(all: Prim[]) {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  const add = (x: number, y: number) => { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); };
  for (const p of all) {
    switch (p.t) {
      case 'line': case 'arrow': add(p.x1, p.y1); add(p.x2, p.y2); break;
      case 'dim': {
        const dx = p.x2 - p.x1, dy = p.y2 - p.y1, l = Math.hypot(dx, dy) || 1;
        const nx = -dy / l, ny = dx / l, off = p.off ?? 7, lo = off + (off >= 0 ? 6 : -8);
        add(p.x1, p.y1); add(p.x2, p.y2); add(p.x1 + nx * off, p.y1 + ny * off); add(p.x2 + nx * off, p.y2 + ny * off);
        add((p.x1 + p.x2) / 2 + nx * lo, (p.y1 + p.y2) / 2 + ny * lo);
        break;
      }
      case 'pt': add(p.x, p.y); add(p.x + (p.dx ?? 3) + p.label.length * 2.4, p.y + (p.dy ?? 2) + 4); add(p.x + (p.dx ?? 3), p.y + (p.dy ?? 2) - 3); break;
      case 'arc': for (let k = 0; k <= 12; k++) { const a = ((p.a0 + ((p.a1 - p.a0) * k) / 12) * Math.PI) / 180; add(p.cx + p.r * Math.cos(a), p.cy + p.r * Math.sin(a)); } break;
      case 'circle': add(p.cx - p.r, p.cy - p.r); add(p.cx + p.r, p.cy + p.r); break;
      case 'text': {
        const w = p.text.length * 4.0 * (p.size ?? 1);
        const x0 = p.anchor === 'middle' ? p.x - w / 2 : p.anchor === 'end' ? p.x - w : p.x;
        add(x0, p.y - 1); add(x0 + w, p.y + 4);
        break;
      }
    }
  }
  if (!isFinite(minx)) { minx = 0; maxx = 1; miny = 0; maxy = 1; }
  return { minx, maxx, miny, maxy, w: maxx - minx, h: maxy - miny };
}
