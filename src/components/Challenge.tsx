'use client';
import { useMemo, useRef, useState } from 'react';
import type { Prim, Solution } from '@/lib/types';
import { Prims, fit } from './Prims';
import { CatSays } from './Cat';
import { sfx } from '@/lib/sfx';
import { R } from '@/lib/draw';

const isNote = (p: Prim) => (p.t === 'text' || p.t === 'arrow') && !!p.n;
const TOL = 5; // mm

/** "Your turn": tap where the next point goes. The cat checks it against the exact position. */
export function Challenge({ sol, award }: { sol: Solution; award: (xp: number, why: string, kind: 'tap') => void }) {
  const v = useMemo(() => fit(sol), [sol]);
  const targets = useMemo(() => sol.steps.map((st, i) => ({ i, pt: st.prims.find((p) => p.t === 'pt' && !isNote(p)) })).filter((x): x is { i: number; pt: Extract<Prim, { t: 'pt' }> } => !!x.pt && x.i > 0), [sol]);
  const [k, setK] = useState(0);
  const [tap, setTap] = useState<{ x: number; y: number; d: number } | null>(null);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const ref = useRef<SVGSVGElement>(null);

  if (!targets.length) return <div className="note">This question has no points to place. Use the Animated lesson tab.</div>;
  if (k >= targets.length) {
    return (
      <>
        <CatSays mood="happy" k="turn-done">Purr-fect round! You placed {score} of {targets.length} points correctly. 🎯</CatSays>
        <button className="btn primary full" onClick={() => { setK(0); setScore(0); setTap(null); }}>Play again</button>
      </>
    );
  }
  const { i, pt } = targets[k];
  const st = sol.steps[i];
  const before = sol.steps.slice(0, i).flatMap((s) => s.prims).filter((p) => !isNote(p));
  const label = pt.label.replace(/\(.*\)/, '');

  function click(e: React.MouseEvent<SVGSVGElement>) {
    if (tap || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * v.W, vy = ((e.clientY - r.top) / r.height) * v.H;
    const mx = (vx - v.ox) / v.s, my = (v.oy - vy) / v.s;
    const d = Math.hypot(mx - pt.x, my - pt.y);
    setTap({ x: vx, y: vy, d });
    if (d <= TOL) { sfx('win'); setScore((x) => x + 1); award(5, 'Point placed', 'tap'); } else sfx('bad');
  }
  const [cx, cy] = v.map(pt.x, pt.y);
  return (
    <div className="player">
      <div className="card qcard"><span className="qtag">Your turn {k + 1}/{targets.length}</span>Tap where <b>{label}</b> goes. <small>({st.title})</small></div>
      <div className="card stage">
        <svg ref={ref} viewBox={`0 0 ${v.W} ${v.H}`} width="100%" style={{ display: 'block', cursor: tap ? 'default' : 'crosshair', touchAction: 'manipulation' }} onClick={click} aria-label="Tap to place the point">
          <rect width={v.W} height={v.H} fill="#fff" />
          <Prims items={[...before, ...(tap ? st.prims.filter((p) => !isNote(p)) : [])]} hi={before.length} map={v.map} u={1} fs={10.5} dz={Math.min(v.s, 1.8)} />
          {tap && (<>
            <circle cx={cx} cy={cy} r={TOL * v.s} fill="rgba(11,122,117,.15)" stroke="#0B7A75" strokeWidth="2" strokeDasharray="4 3"><animate attributeName="r" from="2" to={TOL * v.s} dur=".5s" /></circle>
            <g stroke={tap.d <= TOL ? '#0B7A75' : '#B91C1C'} strokeWidth="3" strokeLinecap="round"><path d={`M${tap.x - 7} ${tap.y - 7}l14 14M${tap.x + 7} ${tap.y - 7}l-14 14`} /></g>
            {tap.d > TOL && <line x1={tap.x} y1={tap.y} x2={cx} y2={cy} stroke="#B91C1C" strokeWidth="1.5" strokeDasharray="3 3" />}
          </>)}
        </svg>
      </div>
      <CatSays mood={!tap ? 'think' : tap.d <= TOL ? 'happy' : 'point'} k={`t${k}-${tap ? 1 : 0}`}>
        {!tap ? <>Where does <b>{label}</b> land? Look at the numbers in the question and tap the spot.{hint && <><br /><i>Hint: {st.why}</i></>}</>
          : tap.d <= TOL ? <><b>Purr-fect! +5 XP.</b> You were {R(tap.d)} mm away. {st.why}</>
          : <><b>Not quite.</b> You were {R(tap.d)} mm away. The green circle is the right spot. {st.why}</>}
      </CatSays>
      <div className="row">
        {!tap ? <button className="btn ghost grow" onClick={() => setHint(true)}>💡 Hint</button>
          : <button className="btn primary grow" onClick={() => { setK(k + 1); setTap(null); setHint(false); }}>{k + 1 < targets.length ? 'Next point →' : 'Finish'}</button>}
      </div>
    </div>
  );
}
