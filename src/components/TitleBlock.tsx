// One title block for every sheet, laid out like a real ED submission sheet:
//   NAME OF FIRM / INSTITUTION        | DRAWING NO.
//   TITLE OF DRAWING                  | PROJ. / SCALE (+ first-angle symbol)
//   DRAWN BY | CHECKED BY             | REMARKS / STANDARD
// Drawn in mm for an A3 sheet (180 x 45). Pass `k` to scale it for bigger paper (A1 = 2).
const INK = '#1B2340', MUT = '#5B6175';
export const TB_W = 180, TB_H = 45;

/** Capitals for the title block, but θ and φ stay lowercase (Θ / Φ mean something else in ED). */
export const caps = (t: string) => t.toUpperCase().replace(/Θ/g, 'θ').replace(/Φ/g, 'φ');

/** Shrinks the font so the text always fits its box (no cut-off words). Average capital width ≈ 0.64 em. */
const fit = (text: string, width: number, max: number) => Math.min(max, width / Math.max(1, text.length * 0.64));

function Cell({ x, y, w, label, value, sub, subColor, center = false }: { x: number; y: number; w: number; label: string; value: string; sub?: string; subColor?: string; center?: boolean }) {
  const pad = 2.5, tx = center ? x + w / 2 : x + pad, anchor = center ? 'middle' : 'start';
  const v = caps(value);
  return (
    <g>
      <text x={tx} y={y + 4.6} fontSize={2.5} fill={MUT} fontWeight={600} letterSpacing={0.15} textAnchor={anchor}>{label}</text>
      <text x={tx} y={y + (sub ? 10.2 : 11.2)} fontSize={fit(v, w - 2 * pad, 4.6)} fill={INK} fontWeight={700} textAnchor={anchor}>{v}</text>
      {sub && <text x={tx} y={y + 13.6} fontSize={fit(sub, w - 2 * pad, 2.7)} fill={subColor ?? MUT} fontWeight={600} textAnchor={anchor}>{sub}</text>}
    </g>
  );
}

/** First-angle projection symbol (BIS): frustum of a cone, and its end view (two circles) to the right. */
function FirstAngle({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke={INK} strokeWidth={0.35} fill="none">
      <path d={`M${cx - 11} ${cy - 3.2} L${cx - 3} ${cy - 1.8} L${cx - 3} ${cy + 1.8} L${cx - 11} ${cy + 3.2} Z`} />
      <circle cx={cx + 3.6} cy={cy} r={3.2} /><circle cx={cx + 3.6} cy={cy} r={1.8} />
      <line x1={cx - 13} y1={cy} x2={cx + 8.5} y2={cy} strokeDasharray="2 0.7 0.4 0.7" strokeWidth={0.2} />
    </g>
  );
}

export interface TitleInfo { institution: string; drawingNo: string; title: string; scale: string; name: string; roll?: string; date?: string }

export function TitleBlock({ x, y, k = 1, info }: { x: number; y: number; k?: number; info: TitleInfo }) {
  const W = TB_W, H = TB_H, r = 15, c1 = 120, d1 = 60, d2 = 105;
  const date = info.date ?? new Date().toLocaleDateString('en-GB');
  return (
    <g transform={`translate(${x},${y}) scale(${k})`} fontFamily="Arial, Helvetica, sans-serif">
      <rect width={W} height={H} fill="#fff" stroke={INK} strokeWidth={0.9} />
      <g stroke={INK} strokeWidth={0.45}>
        <line x1={0} y1={r} x2={W} y2={r} /><line x1={0} y1={2 * r} x2={W} y2={2 * r} />
        <line x1={c1} y1={0} x2={c1} y2={2 * r} /><line x1={d1} y1={2 * r} x2={d1} y2={H} /><line x1={d2} y1={2 * r} x2={d2} y2={H} />
      </g>
      <Cell x={0} y={0} w={c1} label="NAME OF FIRM / INSTITUTION" value={info.institution || ' '} center />
      <Cell x={c1} y={0} w={W - c1} label="DRAWING NO." value={info.drawingNo} center />
      <Cell x={0} y={r} w={c1} label="TITLE OF DRAWING" value={info.title} center />
      <text x={c1 + (W - c1) / 2} y={r + 4.6} fontSize={2.5} fill={MUT} fontWeight={600} letterSpacing={0.15} textAnchor="middle">PROJ. / SCALE</text>
      <text x={c1 + 40} y={r + 10.8} fontSize={4.6} fill={INK} fontWeight={700} textAnchor="middle">{info.scale}</text>
      <FirstAngle cx={c1 + 16} cy={r + 9.4} />
      <Cell x={0} y={2 * r} w={d1} label="DRAWN BY" value={info.name || '________'} sub={[info.roll, date].filter(Boolean).join(' · ')} center />
      <Cell x={d1} y={2 * r} w={d2 - d1} label="CHECKED BY" value="FACULTY" sub="SIGN: __________" center />
      <Cell x={d2} y={2 * r} w={W - d2} label="REMARKS / STANDARD" value="ALL DIMENSIONS IN MM" sub="FIRST ANGLE · BIS SP 46" center />
    </g>
  );
}

/** "s3-C1" -> "SHEET-03"; custom questions -> "CUSTOM". */
export const drawingNoOf = (id: string) => { const m = /^s(\d+)/.exec(id); return m ? `SHEET-${m[1].padStart(2, '0')}` : 'CUSTOM'; };
