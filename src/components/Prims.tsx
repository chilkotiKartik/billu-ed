import type { LineStyle, Prim, Solution } from '@/lib/types';
import { bbox } from '@/lib/geom';

type Map = (x: number, y: number) => [number, number];

const INK = '#1B2340', ORANGE = '#C2410C', TEAL = '#0B7A75', GREY = '#6B7390', LIGHT = '#9AA0B5', FINE = '#2F3858';

function style(w: LineStyle, u: number, dz: number, cur: boolean) {
  const hot = cur ? ORANGE : undefined;
  switch (w) {
    case 'thick': return { sw: 3 * u, col: hot ?? INK, da: undefined as string | undefined, draw: true };
    case 'fine': return { sw: 1.1 * u, col: hot ?? FINE, da: undefined, draw: true };
    case 'thin': return { sw: u, col: GREY, da: undefined, draw: false };
    case 'proj': return { sw: 0.8 * u, col: LIGHT, da: `${2 * u} ${3 * u}`, draw: false };
    case 'dash': return { sw: 1.2 * u, col: TEAL, da: `${4 * u} ${3 * u}`, draw: false };
    case 'hidden': return { sw: 1.3 * u, col: hot ?? FINE, da: `${3 * dz} ${1.5 * dz}`, draw: false };
    case 'centre': return { sw: u, col: hot ?? FINE, da: `${12 * dz} ${2 * dz} ${2.5 * dz} ${2 * dz}`, draw: false };
    case 'locus': return { sw: u, col: hot ?? FINE, da: `${10 * dz} ${2 * dz} ${2.5 * dz} ${2 * dz} ${2.5 * dz} ${2 * dz}`, draw: false };
  }
}

function Head({ x, y, ux, uy, size, color }: { x: number; y: number; ux: number; uy: number; size: number; color: string }) {
  const bx = x - ux * size, by = y - uy * size, px = -uy * size / 6, py = ux * size / 6; // width : length = 1 : 3
  return <polygon points={`${x},${y} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />;
}

/**
 * Draws primitives. u = line-width unit (px), fs = font size, dz = px per paper-mm (for dash lengths),
 * hi = index from which items are "current" (orange + animated), sk = key that restarts the animation.
 */
export function Prims({ items, map, u, fs, dz, hi, sk = 0 }: { items: Prim[]; map: Map; u: number; fs: number; dz: number; hi?: number; sk?: number }) {
  const sc = Math.abs(map(1, 0)[0] - map(0, 0)[0]) || 1;
  return (
    <g fontFamily="Arial, sans-serif">
      {items.map((p, i) => {
        const cur = hi !== undefined && i >= hi;
        const ink = cur ? ORANGE : INK;
        const key = (cur ? `c${sk}-` : 'p-') + i;
        const cls = cur ? 'fx' : undefined;
        switch (p.t) {
          case 'line': {
            const [x1, y1] = map(p.x1, p.y1), [x2, y2] = map(p.x2, p.y2);
            const st = style(p.w, u, dz, cur);
            const drawIn = cur && st.draw;
            return <line key={key} className={drawIn ? 'drawin' : cls} pathLength={drawIn ? 1 : undefined} x1={x1} y1={y1} x2={x2} y2={y2} stroke={st.col} strokeWidth={st.sw} strokeDasharray={drawIn ? undefined : st.da} strokeLinecap={st.da ? 'butt' : 'round'} />;
          }
          case 'arrow': {
            const [x1, y1] = map(p.x1, p.y1), [x2, y2] = map(p.x2, p.y2);
            const l = Math.hypot(x2 - x1, y2 - y1) || 1;
            return (
              <g key={key} className={cls}>
                <line x1={x1} y1={y1} x2={x2 - ((x2 - x1) / l) * 6 * u} y2={y2 - ((y2 - y1) / l) * 6 * u} stroke={cur ? ORANGE : FINE} strokeWidth={1.1 * u} />
                <Head x={x2} y={y2} ux={(x2 - x1) / l} uy={(y2 - y1) / l} size={6 * u} color={cur ? ORANGE : FINE} />
              </g>
            );
          }
          case 'pt': {
            const [x, y] = map(p.x, p.y), [lx, ly] = map(p.x + (p.dx ?? 3), p.y + (p.dy ?? 2));
            return (
              <g key={key} className={cls}>
                <circle cx={x} cy={y} r={2.6 * u + 0.6} fill={ink} />
                <text x={lx} y={ly} fontSize={fs * 1.2} fontWeight={700} fill={ink} textAnchor={(p.dx ?? 3) < 0 ? 'end' : 'start'} paintOrder="stroke" stroke="#fff" strokeWidth={3.4 * u} strokeLinejoin="round">{p.label}</text>
              </g>
            );
          }
          case 'arc': {
            const n = Math.max(24, Math.ceil(Math.abs(p.a1 - p.a0) / 4));
            const pts: string[] = [];
            for (let k = 0; k <= n; k++) {
              const a = ((p.a0 + ((p.a1 - p.a0) * k) / n) * Math.PI) / 180;
              const [x, y] = map(p.cx + p.r * Math.cos(a), p.cy + p.r * Math.sin(a));
              pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
            }
            const st = p.w ? style(p.w, u, dz, cur) : { sw: 1.6 * u, col: cur ? ORANGE : TEAL, da: undefined };
            return <polyline key={key} className={cls} points={pts.join(' ')} fill="none" stroke={st.col} strokeWidth={st.sw} strokeDasharray={st.da} />;
          }
          case 'circle': {
            const [x, y] = map(p.cx, p.cy);
            const st = style(p.w ?? 'thick', u, dz, cur);
            return <circle key={key} className={cls} cx={x} cy={y} r={p.r * sc} fill="none" stroke={st.col} strokeWidth={st.sw} strokeDasharray={st.da} />;
          }
          case 'text': {
            const [x, y] = map(p.x, p.y);
            // mm text (title block) scales with the drawing so it always stays inside its box; other labels keep a readable screen size
            const size = p.mm ? p.mm * Math.abs(map(1, 0)[0] - map(0, 0)[0]) : fs * 1.1 * (p.size ?? 1);
            return <text key={key} className={cls} x={x} y={y} fontSize={size} fontWeight={700} fill={ink} textAnchor={p.anchor ?? 'start'} paintOrder="stroke" stroke="#fff" strokeWidth={3.4 * u} strokeLinejoin="round">{p.text}</text>;
          }
          case 'dim': {
            const dx = p.x2 - p.x1, dy = p.y2 - p.y1, len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len, off = p.off ?? 7;
            const a1 = map(p.x1 + nx * off, p.y1 + ny * off), a2 = map(p.x2 + nx * off, p.y2 + ny * off);
            const e1 = map(p.x1, p.y1), e2 = map(p.x2, p.y2);
            const lab = map((p.x1 + p.x2) / 2 + nx * off, (p.y1 + p.y2) / 2 + ny * off);
            const ang0 = (Math.atan2(a2[1] - a1[1], a2[0] - a1[0]) * 180) / Math.PI, ang = ang0 > 90 ? ang0 - 180 : ang0 <= -90 ? ang0 + 180 : ang0;
            const pl = Math.hypot(a2[0] - a1[0], a2[1] - a1[1]) || 1;
            const ux = (a2[0] - a1[0]) / pl, uy = (a2[1] - a1[1]) / pl;
            const col = cur ? ORANGE : FINE;
            return (
              <g key={key} className={cls} stroke={col} strokeWidth={0.9 * u}>
                {off !== 0 && <line x1={e1[0]} y1={e1[1]} x2={a1[0] + (a1[0] - e1[0]) * 0.12} y2={a1[1] + (a1[1] - e1[1]) * 0.12} />}
                {off !== 0 && <line x1={e2[0]} y1={e2[1]} x2={a2[0] + (a2[0] - e2[0]) * 0.12} y2={a2[1] + (a2[1] - e2[1]) * 0.12} />}
                <line x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} />
                <Head x={a1[0]} y={a1[1]} ux={-ux} uy={-uy} size={6 * u} color={col} />
                <Head x={a2[0]} y={a2[1]} ux={ux} uy={uy} size={6 * u} color={col} />
                <text transform={`translate(${lab[0]},${lab[1]}) rotate(${ang})`} dy={fs * 0.36} stroke="#fff" strokeWidth={5 * u} paintOrder="stroke" strokeLinejoin="round" fill={cur ? ORANGE : INK} fontSize={fs * 1.05} fontWeight={700} textAnchor="middle">{p.label}</text>
              </g>
            );
          }
        }
      })}
    </g>
  );
}

/** Shared view fitting: the same box for every step, so nothing jumps. */
export function fit(sol: Solution) {
  const W = 342, H = 330, pad = 12;
  const bb = bbox([...sol.final, ...sol.steps.flatMap((s) => s.prims)]);
  const s = Math.min((W - 2 * pad) / Math.max(bb.w, 1), (H - 2 * pad) / Math.max(bb.h, 1));
  const ox = (W - bb.w * s) / 2 - bb.minx * s, oy = (H - bb.h * s) / 2 + bb.maxy * s;
  return { W, H, s, ox, oy, map: ((x: number, y: number) => [ox + x * s, oy - y * s]) as Map };
}

/** Step view: draws steps 0..upto; the current step is orange and animated. The view is fixed so nothing jumps between steps. */
export function DrawingSvg({ sol, upto }: { sol: Solution; upto: number }) {
  const W = 342, H = 330, pad = 12;
  const bb = bbox([...sol.final, ...sol.steps.flatMap((s) => s.prims)]);
  const s = Math.min((W - 2 * pad) / Math.max(bb.w, 1), (H - 2 * pad) / Math.max(bb.h, 1));
  const ox = (W - bb.w * s) / 2 - bb.minx * s;
  const oy = (H - bb.h * s) / 2 + bb.maxy * s;
  const map: Map = (x, y) => [ox + x * s, oy - y * s];
  // notes (callout labels and arrows) belong to one step only, so they do not pile up
  const prev = sol.steps.slice(0, upto).flatMap((x) => x.prims).filter((p) => !((p.t === 'text' || p.t === 'arrow') && p.n));
  const cur = sol.steps[upto].prims;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Drawing after step ${upto + 1}`} style={{ display: 'block' }}>
      <Prims items={[...prev, ...cur]} hi={prev.length} sk={upto} map={map} u={1} fs={12.5} dz={Math.min(s, 1.8)} />
    </svg>
  );
}
