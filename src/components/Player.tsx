'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Prim, Solution } from '@/lib/types';
import { Prims } from './Prims';
import { Cat, CatSays, type Mood } from './Cat';
import { bbox } from '@/lib/geom';
import { added } from '@/lib/explain';
import { PENCILS, pencilOf, pencilsOf, colOf } from '@/lib/pencil';

interface Ev { si: number; prim: Prim; start: number; dur: number; note: boolean }
const isNote = (p: Prim) => (p.t === 'text' || p.t === 'arrow') && !!p.n;
const geom = (p: Prim) => p.t === 'line' || p.t === 'arc' || p.t === 'circle';

function durOf(p: Prim): number {
  switch (p.t) {
    case 'line': if (p.f) return 0.4; return Math.min(3.4, Math.max(1.1, Math.hypot(p.x2 - p.x1, p.y2 - p.y1) / 38));
    case 'arc': return 2.6;
    case 'circle': return 2.4;
    case 'dim': return 1.6;
    case 'arrow': return 1;
    default: return 0.7;
  }
}

/** Lays every primitive of every step on one timeline, so the whole construction can be played, paused and scrubbed. */
function timeline(sol: Solution) {
  const evs: Ev[] = [];
  const starts: number[] = [], ends: number[] = [];
  let t = 0;
  const seen = new Set<string>();
  sol.steps.forEach((st, si) => {
    starts.push(t);
    t += 1.2;
    st.prims.forEach((p) => {
      const key = JSON.stringify(p);
      if (!isNote(p) && seen.has(key)) return;
      seen.add(key);
      const d = durOf(p);
      evs.push({ si, prim: p, start: t, dur: d, note: isNote(p) });
      t += d * (isNote(p) ? 0.8 : 1) + 0.35;
    });
    t += Math.max(2.5, st.why.length * 0.045); // time to read or listen
    ends.push(t);
  });
  return { evs, starts, ends, total: t };
}

const partial = (p: Prim, k: number): Prim => {
  if (p.t === 'line') return { ...p, x2: p.x1 + (p.x2 - p.x1) * k, y2: p.y1 + (p.y2 - p.y1) * k };
  if (p.t === 'arc') return { ...p, a1: p.a0 + (p.a1 - p.a0) * k };
  if (p.t === 'circle') return { t: 'arc', cx: p.cx, cy: p.cy, r: p.r, a0: 0, a1: 360 * k, w: p.w };
  return p;
};

export function Player({ sol, question }: { sol: Solution; question?: string }) {
  const [W, setW] = useState(342);
  const bb = useMemo(() => bbox([...sol.final, ...sol.steps.flatMap((x) => x.prims)]), [sol]);
  const asp = bb.h / Math.max(bb.w, 1);
  const [fs, setFs] = useState(false);
  const [boxH, setBoxH] = useState(300);
  const H = fs ? Math.max(200, boxH) : Math.round(Math.min(700, Math.max(300, W * (W > 520 ? Math.max(0.74, Math.min(0.95, asp)) : Math.max(0.92, Math.min(1.3, asp + 0.06)))))), pad = 14;
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = boxRef.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => { setW(Math.round(Math.min(fs ? 2400 : 960, Math.max(290, el.clientWidth)))); setBoxH(Math.round(el.clientHeight)); });
    ro.observe(el); return () => ro.disconnect();
  }, [fs]);
  // big screen: real fullscreen + landscape where the phone allows it, else a fixed overlay (iPhone)
  const openFs = async () => {
    setFs(true);
    try { await stageRef.current?.requestFullscreen?.(); } catch { /* overlay only */ }
    try { await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape'); } catch { /* not allowed */ }
  };
  const closeFs = () => {
    setFs(false);
    try { screen.orientation?.unlock?.(); } catch { /* ignore */ }
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  };
  useEffect(() => {
    const f = () => { if (!document.fullscreenElement) { setFs(false); try { screen.orientation?.unlock?.(); } catch { /* ignore */ } } };
    document.addEventListener('fullscreenchange', f); return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  useEffect(() => {
    if (!fs) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') closeFs(); };
    document.body.style.overflow = 'hidden'; window.addEventListener('keydown', k);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', k); };
  }, [fs]);
  const tl = useMemo(() => timeline(sol), [sol]);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState(false);
  const [qOpen, setQOpen] = useState(false);
  const lastStep = useRef(-1);

  useEffect(() => { setT(0); setPlaying(true); lastStep.current = -1; }, [sol]);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now(), raf = 0;
    const f = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      setT((x) => { const n = x + dt * speed; if (n >= tl.total) { setPlaying(false); return tl.total; } return n; });
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, tl.total]);

  const si = Math.min(sol.steps.length - 1, Math.max(0, tl.starts.filter((s) => s <= t).length - 1));
  const finished = t >= tl.total;

  useEffect(() => {
    if (!voice || !playing || si === lastStep.current || typeof window === 'undefined' || !('speechSynthesis' in window)) { lastStep.current = si; return; }
    lastStep.current = si;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${sol.steps[si].title}. ${sol.steps[si].why}`);
    u.rate = Math.min(1.6, speed); u.pitch = 1.25;
    window.speechSynthesis.speak(u);
  }, [si, voice, playing, sol, speed]);
  useEffect(() => () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  const full = useMemo(() => {
    const s0 = Math.min((W - 2 * pad) / Math.max(bb.w, 1), (H - 2 * pad - 30) / Math.max(bb.h, 1));
    return { s: s0, ox: (W - bb.w * s0) / 2 - bb.minx * s0, oy: (H - 30 - bb.h * s0) / 2 + bb.maxy * s0 };
  }, [bb, W, H]);
  // camera: zooms in on the part of the sheet that the current step is working on
  const camTargets = useMemo(() => sol.steps.map((st) => {
    const ps = st.prims.filter((p) => p.t !== 'dim');
    const b2 = bbox(ps.length ? ps : st.prims);
    const w = Math.max(b2.w * 1.35, 90), h = Math.max(b2.h * 1.5, 70);
    const s1 = Math.min(Math.max(Math.min((W - 2 * pad) / w, (H - 2 * pad) / h), full.s), full.s * 3.2);
    const cx = (b2.minx + b2.maxx) / 2, cy = (b2.miny + b2.maxy) / 2;
    return { s: s1, ox: W / 2 - cx * s1, oy: H / 2 + cy * s1 };
  }), [sol, full, W, H]);
  const [follow, setFollow] = useState(false);
  const tgt = follow ? camTargets[si] ?? full : full;
  const [cam, setCam] = useState(full);
  const camRef = useRef(full);
  useEffect(() => {
    let raf = 0;
    const f = () => {
      const c = camRef.current, k = 0.09;
      const n = { s: c.s + (tgt.s - c.s) * k, ox: c.ox + (tgt.ox - c.ox) * k, oy: c.oy + (tgt.oy - c.oy) * k };
      const done = Math.abs(n.s - tgt.s) < 0.002 && Math.abs(n.ox - tgt.ox) < 0.2 && Math.abs(n.oy - tgt.oy) < 0.2;
      camRef.current = done ? tgt : n; setCam(camRef.current);
      if (!done) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [tgt.s, tgt.ox, tgt.oy]);
  const { s, ox, oy } = cam;
  const map = (x: number, y: number): [number, number] => [ox + x * s, oy - y * s];

  // what is on the paper right now
  const done: Prim[] = [], cur: Prim[] = [];
  let active: { prim: Prim; k: number } | null = null;
  for (const e of tl.evs) {
    if (e.start > t) break;
    const k = Math.min(1, (t - e.start) / e.dur);
    if (e.note && e.si < si) continue;
    if (k < 1) { if (!e.note || e.si === si) active = { prim: e.prim, k }; continue; }
    (e.si < si ? done : cur).push(e.prim);
  }
  const shownDone = done.filter((p) => !isNote(p));

  // pencil / compass position
  let tip: [number, number] | null = null, compass: { c: [number, number]; p: [number, number] } | null = null, ruler: { a: [number, number]; b: [number, number] } | null = null;
  if (active && geom(active.prim)) {
    const p = active.prim, k = active.k;
    if (p.t === 'line') { const a = map(p.x1, p.y1), b = map(p.x2, p.y2); tip = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; ruler = { a, b }; }
    else {
      const a0 = p.t === 'arc' ? p.a0 : 0, a1 = p.t === 'arc' ? p.a1 : 360;
      const cx = p.t === 'arc' ? p.cx : p.cx, cy = p.t === 'arc' ? p.cy : p.cy;
      const ang = ((a0 + (a1 - a0) * k) * Math.PI) / 180;
      tip = map(cx + p.r * Math.cos(ang), cy + p.r * Math.sin(ang));
      compass = { c: map(cx, cy), p: tip };
    }
  }
  const st = sol.steps[si];
  const what = active ? added([active.prim])[0] : null;
  const mood: Mood = finished ? 'happy' : active ? 'point' : 'think';
  const pct = Math.round((Math.min(t, tl.total) / tl.total) * 100);

  const seek = (v: number) => { setT(v >= tl.total - 0.06 ? tl.total : v); window.speechSynthesis?.cancel(); lastStep.current = -1; };
  const jump = (i: number) => { seek(tl.starts[Math.max(0, Math.min(sol.steps.length - 1, i))]); setPlaying(true); };

  return (
    <div className="player pl">
      {question && <div className={`card qcard ${qOpen ? 'open' : 'clamp'}`} onClick={() => setQOpen((v) => !v)}><span className="qt"><span className="qtag">The question</span>{question}</span><span className="more">{qOpen ? ' ▲ less' : ' … more ▼'}</span></div>}
      <div ref={stageRef} className={`card stage ${fs ? 'fs' : ''}`}>
        <div className="stagebar"><span className="live">{finished ? '✔ Finished' : playing ? '● Drawing live' : '❚❚ Paused'}</span><span>Step {si + 1} of {sol.steps.length} · {pct}%</span><button className="zoomb" onClick={() => setFollow((v) => !v)}>{follow ? '🔍 Zoom: follows step' : '🗺️ Whole sheet'}</button><button className="zoomb" onClick={fs ? closeFs : openFs} aria-label={fs ? 'Exit full screen' : 'Full screen'}>{fs ? '✕ Exit' : '⛶ Full'}</button></div>
        <div ref={boxRef} className="stagebox"><svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Animated construction" style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="3" stdDeviation="2.2" floodColor="#3a2a10" floodOpacity=".28" /></filter>
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" /><feColorMatrix in="b" values="0 0 0 0 .95  0 0 0 0 .45  0 0 0 0 .1  0 0 0 .55 0" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <radialGradient id="tipglow"><stop offset="0" stopColor="#FFB347" stopOpacity=".9" /><stop offset="1" stopColor="#FFB347" stopOpacity="0" /></radialGradient>
            <linearGradient id="wood" x1="0" x2="1"><stop offset="0" stopColor="#E8962F" /><stop offset=".5" stopColor="#FFC25E" /><stop offset="1" stopColor="#D9822A" /></linearGradient>
            <pattern id="pg" width={10 * s} height={10 * s} x={ox % (10 * s)} y={oy % (10 * s)} patternUnits="userSpaceOnUse"><path d={`M${10 * s} 0H0V${10 * s}`} fill="none" stroke="#EADFC4" strokeWidth=".6" /></pattern>
            <pattern id="pg5" width={50 * s} height={50 * s} x={ox % (50 * s)} y={oy % (50 * s)} patternUnits="userSpaceOnUse"><path d={`M${50 * s} 0H0V${50 * s}`} fill="none" stroke="#D9C79B" strokeWidth=".9" /></pattern>
          </defs>
          <rect width={W} height={H} fill="url(#pg)" /><rect width={W} height={H} fill="url(#pg5)" />
          {(() => {
            const len = [100, 50, 20, 10].find((v) => v * s <= W * 0.4) ?? 10, w = len * s, x0 = 10, y0 = H - 12;
            return (
              <g fontFamily="Arial, sans-serif" fontSize="8.5" fill="#1B2340" fontWeight={700}>
                <rect x={x0 - 6} y={y0 - 20} width={w + 126} height={30} rx="6" fill="#fff" opacity=".88" />
                <rect x={x0} y={y0 - 4} width={w / 2} height="4" fill="#1B2340" /><rect x={x0 + w / 2} y={y0 - 4} width={w / 2} height="4" fill="#fff" stroke="#1B2340" strokeWidth=".6" />
                <text x={x0} y={y0 - 7} textAnchor="middle">0</text><text x={x0 + w} y={y0 - 7} textAnchor="middle">{len} mm</text>
                <text x={x0 + w + 34} y={y0 - 1} fontWeight={600} fill="#6B7390">1 square = 10 mm</text>
              </g>
            );
          })()}
          {ruler && (() => {
            const [a, b] = [ruler.a, ruler.b]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
            const ticks = Math.floor((L + 16) / (10 * s));
            return (
              <g transform={`translate(${a[0]},${a[1]}) rotate(${ang})`} opacity=".6" filter="url(#sh)">
                {Math.abs(a[0] - b[0]) < 0.5 && <polygon points={`-10,3 ${Math.min(L, 60) + 12},3 -10,${3 + (Math.min(L, 60) + 22) * 0.62}`} fill="#9FD3EA" fillOpacity=".35" stroke="#3A8FB7" strokeWidth="1" />}
                <rect x={-8} y={3} width={L + 16} height={11} rx="2" fill="#FFE9B8" stroke="#E5A93D" strokeWidth=".8" />
                {Array.from({ length: ticks + 1 }, (_, i) => <g key={i}><line x1={i * 10 * s} y1={3} x2={i * 10 * s} y2={i % 5 === 0 ? 10 : 7} stroke="#8A5A12" strokeWidth=".7" />{i % 2 === 0 && <text x={i * 10 * s} y={15} fontSize="5" fill="#6B4A12" textAnchor="middle" fontFamily="Arial">{i * 10}</text>}</g>)}
              </g>
            );
          })()}
          <g><Prims items={[...shownDone, ...cur]} hi={shownDone.length} sk={0} map={map} u={1.15} fs={12.5} dz={Math.min(s, 1.8)} />
          {active && (
            <g opacity={geom(active.prim) ? 1 : active.k} filter={geom(active.prim) ? 'url(#glow)' : undefined}>
              <Prims items={[partial(active.prim, active.k)]} hi={0} map={map} u={1.15} fs={12.5} dz={Math.min(s, 1.8)} />
            </g>
          )}</g>
          {compass && (() => {
            const { c, p } = compass; const mx = (c[0] + p[0]) / 2, my = (c[1] + p[1]) / 2; const d = Math.hypot(p[0] - c[0], p[1] - c[1]);
            const h: [number, number] = [mx, my - Math.min(70, Math.max(26, d * 0.7))];
            return (
              <g>
                <line x1={c[0]} y1={c[1]} x2={h[0]} y2={h[1]} stroke="#6B7390" strokeWidth="3" strokeLinecap="round" />
                <line x1={p[0]} y1={p[1]} x2={h[0]} y2={h[1]} stroke="#6B7390" strokeWidth="3" strokeLinecap="round" />
                <line x1={h[0]} y1={h[1]} x2={h[0]} y2={h[1] - 12} stroke="#C2410C" strokeWidth="4" strokeLinecap="round" />
                <circle cx={h[0]} cy={h[1]} r="4" fill="#F4A340" stroke="#7A4417" />
                <circle cx={c[0]} cy={c[1]} r="3.4" fill="none" stroke="#C2410C" strokeWidth="1.6" />
              </g>
            );
          })()}
          {active && active.prim.t === 'line' && (() => {
            const p = active.prim, L = Math.hypot(p.x2 - p.x1, p.y2 - p.y1), cur = Math.round(L * active.k);
            return <g fontFamily="Arial"><rect x={W / 2 - 62} y="8" width="124" height="24" rx="12" fill="#C2410C" /><text x={W / 2} y="25" fontSize="13.5" fontWeight={800} fill="#fff" textAnchor="middle">Length {cur} / {Math.round(L)} mm</text></g>;
          })()}
          {tip && !compass && (
            <g transform={`translate(${tip[0]},${tip[1]}) rotate(${35 + Math.sin(t * 11) * 1.6})`} filter="url(#sh)">
              <polygon points="0,0 -4.2,-13 4.2,-13" fill="#F3D3A0" /><polygon points="0,0 -1.5,-4.5 1.5,-4.5" fill="#2B1B12" />
              <rect x="-4.2" y="-46" width="8.4" height="33" fill={active ? colOf(pencilOf(active.prim)) : 'url(#wood)'} /><rect x="-4.2" y="-46" width="2.8" height="33" fill="#fff" opacity=".22" />
              <rect x="-4.2" y="-52" width="8.4" height="6" fill="#C9CED8" /><rect x="-4.2" y="-58" width="8.4" height="6" rx="2" fill="#E0607E" />
              <text transform="rotate(-90) translate(29,2.8)" fontSize="8" fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="Arial">{active ? pencilOf(active.prim) : ''}</text>
            </g>
          )}
          {tip && <circle cx={tip[0]} cy={tip[1]} r={7 + Math.sin(t * 9) * 1.5} fill="url(#tipglow)" pointerEvents="none" />}
          {si > 0 && t - tl.starts[si] < 1.3 && (() => {
            const k = (t - tl.starts[si]) / 1.3, sc = 0.7 + Math.min(1, k * 4) * 0.3;
            return <g transform={`translate(${W - 74},${44}) scale(${sc})`} opacity={k < 0.75 ? 1 : (1 - k) * 4} fontFamily="Arial"><rect x="-62" y="-14" width="124" height="28" rx="14" fill="#15803D" /><text y="5" fontSize="13" fontWeight={800} fill="#fff" textAnchor="middle">✓ Step {si} done</text></g>;
          })()}
          {tip && compass && <circle cx={tip[0]} cy={tip[1]} r="3" fill="#C2410C" />}
        </svg></div>
        {fs && <div className="fsctrl">
          <button className="cb" onClick={() => jump(si - 1)} aria-label="Previous step">⏮</button>
          <button className="cb big" onClick={() => { if (finished) { setT(0); setPlaying(true); } else setPlaying((p) => !p); }} aria-label="Play or pause">{finished ? '↻' : playing ? '❚❚' : '▶'}</button>
          <button className="cb" onClick={() => jump(si + 1)} aria-label="Next step">⏭</button>
          <input className="scrub" type="range" min={0} max={tl.total} step={0.05} value={t} onChange={(e) => seek(Number(e.target.value))} aria-label="Timeline"
            style={{ background: `linear-gradient(90deg,#C2410C ${pct}%,#E8E2D2 ${pct}%)` }} />
        </div>}
        <div className="nowdraw" key={`${si}-${what?.what ?? 'w'}`}>{what ? <>✏️ <b>{what.what}</b>{what.len && <span> · {what.len}</span>}{active && <span className="pgrade" style={{ background: colOf(pencilOf(active.prim)) }}>{pencilOf(active.prim)} pencil</span>}{active && active.prim.t === 'line' && active.prim.w === 'hidden' && <span> · hidden line: dashes 3 mm, gaps 1 mm</span>}</> : finished ? '🎉 Drawing complete' : '🐾 Cat is thinking…'}</div>
      </div>

      <CatSays mood={mood} k={`${sol.id}-${si}`}><b>{st.title}. </b>{st.why}<div className="usep">✏️ Use: {pencilsOf(st.prims).map((g) => <span key={g} className="pgrade" style={{ background: colOf(g) }}>{g} pencil</span>)}</div></CatSays>
      {st.calc && <div className="card info calcbox"><h3>🧮 Working for this step</h3><div className="calcline">{st.calc}</div></div>}

      <div className="card ctrl">
 <div className="track"><span className="runner" style={{ left: `${pct}%` }}><Cat mood={finished ? 'happy' : 'idle'} size={34} /></span>
        <input className="scrub" type="range" min={0} max={tl.total} step={0.05} value={t} onChange={(e) => seek(Number(e.target.value))} aria-label="Timeline"
          style={{ background: `linear-gradient(90deg,#C2410C ${pct}%,#E8E2D2 ${pct}%)` }} /></div>
        <div className="ctrlrow">
          <button className="cb" onClick={() => jump(si - 1)} aria-label="Previous step">⏮</button>
          <button className="cb big" onClick={() => { if (finished) { setT(0); setPlaying(true); } else setPlaying((p) => !p); }} aria-label="Play or pause">{finished ? '↻' : playing ? '❚❚' : '▶'}</button>
          <button className="cb" onClick={() => jump(si + 1)} aria-label="Next step">⏭</button>
          <select className="speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Speed">
            {[0.5, 0.75, 1, 1.5, 2].map((v) => <option key={v} value={v}>{v}×</option>)}
          </select>
          <button className={`cb ${voice ? 'on' : ''}`} onClick={() => { setVoice((v) => !v); window.speechSynthesis?.cancel(); lastStep.current = -1; }} aria-label="Cat voice">{voice ? '🔊' : '🔇'}</button>
        </div>
      </div>
      <details className="card info pencils"><summary>✏️ Pencil guide (H · 2H · 3H · 4H) and arrow heads</summary>
        <table><tbody>{PENCILS.map((x) => <tr key={x.g}><td><span className="pgrade" style={{ background: x.col }}>{x.g}</span></td><td><b>{x.line}</b> — {x.use}</td></tr>)}</tbody></table>
        <p className="small">Arrow heads: width : length = 1 : 3 (about 2 mm wide and 6 mm long), filled solid. Sheet: A1 or A3, scale 1:1 unless stated.</p>
      </details>
      <div className="card chips">
        <h3>Progress</h3>
        <ol className="stepchips">
          {sol.steps.map((x, i) => (
            <li key={i} className={i < si || finished ? 'ok' : i === si ? 'now' : ''}>
              <button onClick={() => jump(i)}><span className="dot">{i < si || finished ? '✓' : i + 1}</span><span className="lbl">{x.title}</span>{i === si && !finished && <span className="arrowpulse">←</span>}</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
