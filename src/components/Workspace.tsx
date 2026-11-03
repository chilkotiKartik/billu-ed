'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { UserButton, useClerk } from '@clerk/nextjs';
import { dailyQuestion, DAILY_XP } from '@/lib/daily';
import { DrawingSvg, Prims } from './Prims';
import { Cat, CatSays } from './Cat';
import { Player } from './Player';
import { YtCard } from './YtCard';
import { Sidebar, type Nav } from './Sidebar';
import { About } from './About';
import { FullSheetSvg } from './FullSheet';
import { TitleBlock, TB_W, TB_H, drawingNoOf } from './TitleBlock';
import { pages } from '@/lib/fullsheet';
import { Challenge } from './Challenge';
import { Quiz } from './Quiz';
import { day, EMPTY, BADGES, LEVELS, levelOf, progress, save as saveGame, type Game } from '@/lib/game';
import { sfx, isMuted, setMuted } from '@/lib/sfx';
import { added, catLine } from '@/lib/explain';
import { parseQuestion } from '@/lib/parser';
import { PRESETS, randomQuestion } from '@/lib/presets';
import { kindOf, validate, solve as solveLine } from '@/lib/solver';
import { lineToSolution } from '@/lib/adapt';
import { SHEETS, ALL as ALLQ, matchCatalog, variantOf, type Q } from '@/lib/catalog';
import { VIDEOS, ytUrl, questionVideos } from '@/lib/videos';
import { sheetLayout } from '@/lib/sheet';
import { readImage, imageToDataUrl } from '@/lib/ocr';
import { askAI, missingOf } from '@/lib/ai';
import { sheetToPdf } from '@/lib/pdf';
import { pencilsOf, colOf } from '@/lib/pencil';
import { listSheets, saveSheet, deleteSheet, renameSheet, type Saved } from '@/lib/store';
import { loadLocal, saveLocal, pullProgress, pushProgress, loadProfileLocal, saveProfileLocal, pullProfile, pushProfile, sendFeedback, getLeaderboard, deleteAccount, clearDevice, type BoardRow } from '@/lib/sync';
import { sameProgress } from '@/lib/progress';
import type { LineInput, Solution } from '@/lib/types';

type Screen = 'scan' | 'trophies' | 'full' | 'about' | 'sheets' | 'confirm' | 'steps' | 'sheet' | 'mistakes' | 'saved';
type NumKey = 'L' | 'theta' | 'phi' | 'ha' | 'da';

const DEFAULT: LineInput = { L: 70, theta: 0, phi: 30, ha: 20, da: 15, n1: 'A', n2: 'B' };
const KIND_LABEL = { hp: 'Line parallel to HP, inclined to VP', vp: 'Line parallel to VP, inclined to HP', both: 'Line inclined to both HP and VP' };
const R = (v: number) => Math.round(v * 100) / 100;

function Logo({ level }: { level: number }) {
  return <Cat mood="idle" size={40} level={level} />;
}

function SheetSvg({ sol, svgRef, name, roll, institution }: { sol: Solution; svgRef: React.RefObject<SVGSVGElement | null>; name: string; roll: string; institution: string }) {
  const lay = sheetLayout(sol);
  const map = (x: number, y: number): [number, number] => [lay.ox + x * lay.s, lay.oy - y * lay.s];
  const title = sol.header[1] ? `${sol.header[0]}: ${sol.header[1]}` : sol.header[0];
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" width="420" height="297" style={{ width: '100%', height: 'auto', display: 'block', background: '#fff' }} fontFamily="Arial, sans-serif" role="img" aria-label="A3 drawing sheet">
      <rect width="420" height="297" fill="#fff" />
      <rect x="20" y="10" width="390" height="277" fill="none" stroke="#1B2340" strokeWidth="0.8" />
      <Prims items={sol.final} map={map} u={0.26} fs={3.6} dz={1} />
      <TitleBlock x={410 - TB_W} y={287 - TB_H} info={{ institution, drawingNo: drawingNoOf(sol.id), title, scale: lay.label.replace(':', ' : '), name, roll }} />
    </svg>
  );
}

export default function Workspace() {
  const [screen, setScreen] = useState<Screen>('scan');
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState('');
  const [inp, setInp] = useState<LineInput>(DEFAULT);
  const [warn, setWarn] = useState<string[]>([]);
  const [sol, setSol] = useState<Solution | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState('');
  const [aiUsed, setAiUsed] = useState(false);
  const [msg, setMsg] = useState('');
  const [saved, setSaved] = useState<Saved[]>([]);
  const sheetRef = useRef<SVGSVGElement>(null);
  const [qid, setQid] = useState('');
  const [tab, setTab] = useState<'lesson' | 'steps' | 'turn'>('lesson');
  const [game, setGame] = useState<Game>(EMPTY);
  const [toast, setToast] = useState<{ t: string; k: number } | null>(null);
  const [qtext, setQtext] = useState<string | null>(null);
  const [mute, setMute] = useState(false);
  useEffect(() => { setMute(isMuted()); }, []);
  function award(xp: number, why: string, kind?: 'tap' | 'quiz' | 'variant') {
    setGame((g) => {
      const n = { ...g, xp: g.xp + xp, tapOk: g.tapOk + (kind === 'tap' ? 1 : 0), quizOk: g.quizOk + (kind === 'quiz' ? 1 : 0), variants: g.variants + (kind === 'variant' ? 1 : 0) };
      if (levelOf(n.xp) > levelOf(g.xp)) setTimeout(() => { sfx('win'); setToast({ t: `Level up! You are a ${LEVELS[levelOf(n.xp) - 1]} 🎉`, k: Date.now() }); }, 700);
      saveGame(n);
      return n;
    });
    setToast({ t: `+${xp} XP · ${why}`, k: Date.now() });
  }
  const level = levelOf(game.xp);
  const [menu, setMenu] = useState(false);
  const [pg, setPg] = useState(0);
  const [pname, setPname] = useState('');
  const [proll, setProll] = useState('');
  const [inst, setInst] = useState('AKIT TANAKPUR — ED LAB');
  useEffect(() => { try { const v = localStorage.getItem('edcat.inst'); if (v !== null) setInst(v); } catch { /* ignore */ } }, []);
  useEffect(() => { try { localStorage.setItem('edcat.inst', inst); } catch { /* ignore */ } }, [inst]);
  const [nick, setNick] = useState('');
  const [onBoard, setOnBoard] = useState(false);
  const [board, setBoard] = useState<BoardRow[] | null | 'off'>(null);
  const [delAsk, setDelAsk] = useState('');
  const [delErr, setDelErr] = useState('');
  const { signOut } = useClerk();
  const daily = useMemo(() => dailyQuestion(), []);
  const fullRef = useRef<SVGSVGElement>(null);
  const [paper, setPaper] = useState<'A1' | 'A3'>('A1');
  const allPages = useMemo(() => pages(), []);
  const [done, setDone] = useState<string[]>([]);
  const [vid, setVid] = useState(false);
  const [fb, setFb] = useState(false);
  const [fbKind, setFbKind] = useState<'wrong-step' | 'unclear' | 'idea' | 'bug'>('wrong-step');
  const [fbMsg, setFbMsg] = useState('');
  const [fbState, setFbState] = useState<'idle' | 'sending' | 'sent' | 'off' | 'error'>('idle');
  const [matched, setMatched] = useState('');
  const touch = useRef<number | null>(null);

  // Progress: device copy first (instant), then merge with the account copy so a new phone picks up where the student left off.
  const [sync, setSync] = useState<'local' | 'saving' | 'synced' | 'offline'>('local');
  const ready = useRef(false);
  useEffect(() => {
    let dead = false;
    const local = loadLocal();
    setDone(local.done);
    setGame(local.game);
    const prof = loadProfileLocal();
    setPname(prof.name);
    setProll(prof.roll);
    setNick(prof.nick);
    setOnBoard(prof.onBoard);
    (async () => {
      const merged = await pullProgress(local);
      if (dead) return;
      if (merged) {
        setDone(merged.done);
        setGame(merged.game);
        saveLocal(merged);
        if (!sameProgress(merged, local)) setToast({ t: 'Your progress is synced ☁️', k: Date.now() });
        setSync((await pushProgress(merged)) ? 'synced' : 'offline');
      } else {
        setSync('offline');
      }
      const rp = await pullProfile();
      if (!dead && rp && (rp.name || rp.roll || rp.nick)) { setPname(rp.name); setProll(rp.roll); setNick(rp.nick); setOnBoard(rp.onBoard); saveProfileLocal(rp); }
      ready.current = true;
    })();
    return () => { dead = true; };
  }, []);

  // Save to the account 1.5 s after the last change (and always keep the device copy).
  useEffect(() => {
    if (!ready.current) return;
    saveLocal({ done, game });
    setSync('saving');
    const t = setTimeout(async () => setSync((await pushProgress({ done, game })) ? 'synced' : 'offline'), 1500);
    return () => clearTimeout(t);
  }, [done, game]);

  useEffect(() => {
    if (!ready.current) return;
    const p = { name: pname, roll: proll, nick, onBoard };
    saveProfileLocal(p);
    const t = setTimeout(() => { void pushProfile(p); }, 1500);
    return () => clearTimeout(t);
  }, [pname, proll, nick, onBoard]);

  function markDone(id: string) {
    setDone((d) => (d.includes(id) ? d : [...d, id]));
  }

  function finish() {
    if (qid === daily.id && game.daily !== day()) {
      setGame((g) => ({ ...g, daily: day() }));
      setTimeout(() => award(DAILY_XP, 'Daily challenge done 🗓️'), 900);
    }
    if (sol?.id.endsWith('-v')) { award(15, 'New numbers solved', 'variant'); sfx('win'); return; }
    if (qid && !done.includes(qid)) { markDone(qid); award(30, 'Question finished'); sfx('win'); }
  }

  function openQ(q: Q, note = '') {
    setQid(q.id);
    setQtext(null);
    setTab('lesson');
    setSol(q.build());
    setStep(0);
    setPlaying(false);
    setMsg('');
    setMatched(note);
    setScreen('steps');
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    if (!playing || !sol) return;
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= sol.steps.length - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 2400);
    return () => clearInterval(t);
  }, [playing, sol]);

  function show(t: string, input: Partial<LineInput>, missing: string[], ai: boolean) {
    setInp({ ...DEFAULT, ...input, L: input.L ?? NaN, theta: input.theta ?? NaN, phi: input.phi ?? NaN, ha: input.ha ?? NaN, da: input.da ?? NaN });
    setWarn(missing);
    setText(t);
    setErr('');
    setAiUsed(ai);
    setScreen('confirm');
  }

  function loadText(t: string) {
    const { input, missing } = parseQuestion(t);
    show(t, input, missing, false);
  }

  // Rules first. Only if some value is still missing, ask Gemini to read the question (rules win where they found a value).
  async function readAndLoad(t: string, file?: File) {
    const m = matchCatalog(t);
    if (m) { openQ(m.q, `We found this in your sheets: ${m.q.code} · ${m.q.title}.`); return; }
    const { input: ruled, missing } = parseQuestion(t);
    let input = ruled, ai = false;
    if (missing.length > 0) {
      setBusy('Double-checking with AI…');
      const image = file ? await imageToDataUrl(file).catch(() => undefined) : undefined;
      const r = t.trim() || image ? await askAI(t, image) : null;
      if (r) { input = { ...r, ...ruled }; ai = Object.keys(r).length > 0; }
    }
    if (Object.keys(input).length === 0) throw new Error('empty');
    show(t, input, missingOf(input), ai);
  }

  async function onPhoto(f?: File | null) {
    if (!f) return;
    setErr('');
    setBusy('Reading your photo… (first time takes a few seconds)');
    let t = '';
    try { t = (await readImage(f)).trim(); } catch { /* AI fallback below may still read the photo */ }
    try {
      await readAndLoad(t, f);
    } catch {
      setErr('We could not read that photo. Try better light, hold it straight, or tap “Type it”.');
    } finally {
      setBusy('');
    }
  }

  // The solver is exact maths with no secrets, so it runs right here on the phone: instant, and it works offline.
  function solveNow() {
    setErr('');
    const bad = validate(inp);
    if (bad) { setErr(bad); return; }
    try {
      const solution = lineToSolution(solveLine({ ...inp, n1: inp.n1?.toUpperCase() || 'A', n2: inp.n2?.toUpperCase() || 'B' }));
      setQid('');
      setTab('lesson');
      setMatched('');
      setSol(solution);
      setStep(0);
      setPlaying(false);
      setMsg('');
      setScreen('steps');
    } catch (e) {
      setErr((e as Error).message || 'Could not solve this one. Please check the numbers.');
    }
  }

  async function openSaved() {
    setScreen('saved');
    setSaved(await listSheets());
  }

  async function save() {
    if (!sol) return;
    if (!sol.lineInput) return;
    const where = await saveSheet(sol.title, sol.lineInput);
    setMsg(where === 'cloud' ? 'Saved to your account.' : where === 'full' ? 'Your account is full (100 sheets). Delete an old one in My sheets.' : 'Saved on this phone.');
  }

  async function download() {
    if (!sheetRef.current || !sol) return;
    setMsg('Making PDF…');
    try {
      await sheetToPdf(sheetRef.current, `ED-${sol.id}`);
      setMsg('PDF downloaded. Print it at A3 or use it to copy the sheet.');
    } catch {
      setMsg('Could not make the PDF. Try again.');
    }
  }

  const Num = ({ k, label }: { k: NumKey; label: string }) => (
    <label className="field">
      <span>{label}</span>
      <input inputMode="decimal" value={Number.isNaN(inp[k]) ? '' : inp[k]} onChange={(e) => setInp({ ...inp, [k]: e.target.value === '' ? NaN : Number(e.target.value) })} />
    </label>
  );

  const Back = ({ to }: { to: Screen }) => (
    <button className="back" aria-label="Back" onClick={() => { setPlaying(false); setScreen(to); }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2340" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
    </button>
  );

  const n = sol?.steps.length ?? 0;
  const st = sol?.steps[step];
  const curQ = ALLQ.find((q) => q.id === qid);
  const vids = curQ ? questionVideos(curQ) : VIDEOS.inclined;
  const go = (d: number) => { setPlaying(false); setStep((x) => Math.max(0, Math.min(n - 1, x + d))); };
  const totalQ = ALLQ.length;

  return (
    <div className="shell">
    <Sidebar open={menu} onClose={() => setMenu(false)} done={done} qid={qid} screen={screen} level={level} flowAt={screen === 'scan' ? 0 : screen === 'confirm' ? 1 : screen === 'steps' ? 2 : screen === 'sheet' || screen === 'mistakes' ? 3 : -1}
      onNav={(nv: Nav) => { if (nv === 'saved') openSaved(); else setScreen(nv); window.scrollTo({ top: 0 }); }} onOpenQ={(q) => openQ(q)} />
    <div className="app">
      {toast && <div key={toast.k} className="toast" onAnimationEnd={() => setToast(null)}>{toast.t}</div>}
      <header className="top">
        <div className="brand"><button className="hamb" aria-label="Open menu" onClick={() => setMenu(true)}><span /><span /><span /></button><Logo level={level} /><span>ED Cat</span></div>
        <div className="hright"><button className="xp" onClick={() => setScreen('trophies')} aria-label="Level and trophies">Lv {level} · {game.xp} XP</button><button className="mute" aria-label={mute ? 'Unmute sounds' : 'Mute sounds'} onClick={() => { setMuted(!mute); setMute(!mute); }}>{mute ? '🔇' : '🔊'}</button><span className={`sync ${sync}`} role="status" title={sync === 'synced' ? 'Progress saved to your account' : sync === 'saving' ? 'Saving…' : sync === 'offline' ? 'Saved on this phone only (account storage unavailable)' : 'Loading…'}>{sync === 'synced' ? '☁️' : sync === 'saving' ? '⏳' : sync === 'offline' ? '📱' : '·'}</span><UserButton /></div>
      </header>

      <main className="body">
        {screen === 'scan' && (
          <>
            <CatSays mood="happy" k="hero">Meow! I am Pixel, level {level}. Show me your ED question and I will draw it with you, one step at a time. 🐾</CatSays>
            <button className="card homexp" onClick={() => setScreen('trophies')}><b>Level {level} · {LEVELS[level - 1]}</b><span>{game.xp} XP · {game.streak} day streak 🔥 · {done.length}/{totalQ} done</span><div className="meter"><i style={{ width: `${progress(game.xp).pct}%` }} /></div></button>
            <button className={`card daily ${game.daily === day() ? 'done' : ''}`} onClick={() => openQ(daily, game.daily === day() ? 'You already finished today’s challenge. Practice makes perfect!' : `Today’s challenge: finish it for +${DAILY_XP} bonus XP.`)}>
              <span className="dicon" aria-hidden="true">{game.daily === day() ? '✅' : '🗓️'}</span>
              <span className="dtext"><b>Today’s challenge</b><small>{daily.code} · {daily.title}</small></span>
              <span className="dxp">{game.daily === day() ? 'Done' : `+${DAILY_XP} XP`}</span>
            </button>
            <h1>Snap the question.<br /><span className="acc">Get every step.</span></h1>
            <div className="finder">
              {busy ? (
                <div className="busy"><div className="walk"><Cat mood="think" size={84} /></div>{busy}</div>
              ) : typing ? (
                <textarea className="paper" autoFocus placeholder="Type or paste your question, e.g. A line AB, 70 mm long, is parallel to the HP and inclined at 30° to the VP…" value={text} onChange={(e) => setText(e.target.value)} />
              ) : (
                <div className="paper"><b className="mono">Q3.</b> A line AB, <b>70 mm</b> long, is parallel to the HP and inclined at <b>30°</b> to the VP. End A is <b>20 mm</b> above the HP and <b>15 mm</b> in front of the VP. Draw its projections.</div>
              )}
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
            </div>
            {err && <div className="note warn">{err}</div>}
            <div className="row">
              <label className="btn primary grow">
                Take photo
                <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
              <button className="btn ghost" onClick={() => setTyping((t) => !t)}>{typing ? 'Cancel' : 'Type it'}</button>
            </div>
            {typing ? (
              <button className="btn primary full" disabled={text.trim().length < 10} onClick={async () => { setBusy('Reading…'); try { await readAndLoad(text); } catch { setErr('We could not find any numbers in that. Please check the question.'); } finally { setBusy(''); } }}>Read my question</button>
            ) : (
              <label className="btn ghost full">
                Choose from gallery
                <input type="file" accept="image/*" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
            )}
            <button className="btn dark full" onClick={() => setScreen('sheets')}>Open Sheets 1 to 3 →</button>
            <h3>Or try a ready question</h3>
            <div className="list">
              {PRESETS.map((p) => (
                <button key={p.id} className="item" onClick={() => loadText(p.text)}>{p.title}<span>→</span></button>
              ))}
            </div>
          </>
        )}

        {screen === 'sheets' && (
          <>
            <h1 className="sm">Your sheets</h1>
            <div className="pagecat"><Cat mood="point" size={74} level={level} /><div className="bubble">Pick any question. I will draw it for you, line by line, and tell you the pencil to use. 🐾</div></div>
            <div className="card prog2"><b>{done.length} of {totalQ} done</b><div className="meter"><i style={{ width: `${(100 * done.length) / totalQ}%` }} /></div></div>
            {SHEETS.map((sh) => (
              <section key={sh.id} className="sheetgrp">
                <h3>{sh.title}</h3>
                {sh.parts.map((pt) => (
                  <div key={pt.title} className="list">
                    <div className="part">{pt.title}</div>
                    {pt.qs.map((q) => (
                      <button key={q.id} className="item q" onClick={() => openQ(q)}>
                        <span className={done.includes(q.id) ? 'tick on' : 'tick'}>{done.includes(q.id) ? '✓' : q.code.slice(0, 3)}</span>
                        <span className="qt"><b>{q.code} · {q.title}</b><small>{q.statement.length > 90 ? q.statement.slice(0, 88) + '…' : q.statement}</small></span>
                        <span>→</span>
                      </button>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </>
        )}

        {screen === 'about' && <About />}

        {screen === 'trophies' && (
          <>
            <div className="aboutcat"><Cat mood="happy" size={96} level={level} /><div><h1 className="sm">Level {level}: {LEVELS[level - 1]}</h1><p>{game.xp} XP · {game.streak} day streak 🔥</p></div></div>
            <div className="card prog2"><b>{level >= 6 ? 'Top level reached!' : `${progress(game.xp).next - game.xp} XP to level ${level + 1}`}</b><div className="meter"><i style={{ width: `${progress(game.xp).pct}%` }} /></div></div>
            <div className="card info"><h3>How to earn XP</h3><ul className="added"><li><span>Finish a question</span><b>+30</b></li><li><span>New numbers solved</span><b>+15</b></li><li><span>Right quiz answer</span><b>+10</b></li><li><span>Point placed in Your turn</span><b>+5</b></li></ul></div>
            <h3>Badges</h3>
            <div className="badges">
              {BADGES.map((b) => { const on = b.test(game, done); return (<div key={b.id} className={`badge ${on ? 'on' : ''}`}><span>{on ? b.icon : '🔒'}</span><b>{b.name}</b><small>{b.desc}</small></div>); })}
            </div>
            <div className="card info"><h3>Cat wardrobe</h3><p className="small">Level 2 glasses · Level 3 graduation cap · Level 4 scarf · Level 5 crown.</p></div>

            <h3>Leaderboard</h3>
            <div className="card info board">
              <p className="small">Optional. Only your nickname and XP are shown, never your real name.</p>
              <label className="field"><span>Nickname (letters and numbers)</span><input value={nick} maxLength={24} onChange={(e) => setNick(e.target.value.replace(/[^\p{L}\p{N} _-]/gu, ''))} placeholder="e.g. SharpPaw22" /></label>
              <label className="switch"><input type="checkbox" checked={onBoard} disabled={!nick.trim()} onChange={(e) => setOnBoard(e.target.checked)} /> Show me on the leaderboard</label>
              <button className="btn ghost full" onClick={async () => { setBoard(null); const r = await getLeaderboard(); setBoard(r ?? 'off'); }}>{board ? 'Refresh leaderboard' : 'Show leaderboard'}</button>
              {board === 'off' && <div className="note">The leaderboard is not switched on for this app yet.</div>}
              {Array.isArray(board) && (board.length === 0 ? <div className="note">Nobody is on the board yet. Be the first!</div> : (
                <ol className="lb">{board.map((r) => <li key={r.rank} className={r.me ? 'me' : ''}><span>{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</span><b>{r.nick}{r.me ? ' (you)' : ''}</b><i>{r.xp} XP</i></li>)}</ol>
              ))}
            </div>

            <h3>My data</h3>
            <div className="card info">
              <p className="small">Download everything ED Cat keeps about you, or delete your account for good.</p>
              <a className="btn ghost full" href="/api/account" download>⬇️ Download my data</a>
              {delAsk === '' ? <button className="btn ghost full danger" onClick={() => { setDelAsk(' '); setDelErr(''); }}>Delete my account</button> : (
                <form className="delbox" onSubmit={async (e) => { e.preventDefault(); setDelErr(''); const err = await deleteAccount(); if (err) { setDelErr(err); return; } clearDevice(); await signOut({ redirectUrl: '/' }); }}>
                  <label className="field"><span>Type DELETE to remove your progress, sheets and account</span><input value={delAsk.trim()} onChange={(e) => setDelAsk(e.target.value || ' ')} autoCapitalize="characters" /></label>
                  {delErr && <div className="note">{delErr}</div>}
                  <div className="row2"><button type="button" className="btn ghost" onClick={() => setDelAsk('')}>Cancel</button><button className="btn primary" disabled={delAsk.trim() !== 'DELETE'}>Delete forever</button></div>
                </form>
              )}
            </div>
          </>
        )}

        {screen === 'full' && (
          <>
            <h1 className="sm">Full drawing sheets</h1>
            <div className="pagecat"><Cat mood="happy" size={74} level={level} /><div className="bubble">Here is your whole sheet on A1 or A3 paper. Every drawing uses one standard scale, written in the title block.</div></div>
            <div className="tabs"><button className={paper === 'A1' ? 'on' : ''} onClick={() => setPaper('A1')}>A1 sheet</button><button className={paper === 'A3' ? 'on' : ''} onClick={() => setPaper('A3')}>A3 sheet</button></div>
            <div className="tabs scroll">
              {allPages.map((p, i) => <button key={i} className={pg === i ? 'on' : ''} onClick={() => setPg(i)}>{p.title.split(' · ')[0]}{allPages.filter((x) => x.sheetId === p.sheetId).length > 1 ? ` · ${p.part.split(' · ')[0]}` : ''}</button>)}
            </div>
            <div className="card sheet paper3"><FullSheetSvg paper={paper} page={allPages[pg]} svgRef={fullRef} name={pname} roll={proll} institution={inst} /></div>
            <div className="grid2">
              <label className="field"><span>Your name</span><input value={pname} maxLength={60} onChange={(e) => setPname(e.target.value)} /></label>
              <label className="field"><span>Roll no.</span><input value={proll} maxLength={30} onChange={(e) => setProll(e.target.value)} /></label>
            </div>
            <label className="field"><span>Institution (title block)</span><input value={inst} maxLength={60} onChange={(e) => setInst(e.target.value)} /></label>
            <div className="note">Every question on this page is drawn to the scale in the title block (2 : 1 means twice full size). Dimensions always show the true size. Tap Download to get the PDF.</div>
            <button className="btn primary full big" onClick={async () => { if (!fullRef.current) return; try { await sheetToPdf(fullRef.current, `ED-${allPages[pg].sheetId}-page${pg + 1}-${paper}`, paper); } catch { /* ignore */ } }}>Download this page as PDF</button>
          </>
        )}

        {screen === 'confirm' && (
          <>
            <div className="bar"><Back to="scan" /><div><div className="eyebrow">Check before we solve</div><h2>Did we read it right?</h2></div></div>
            <div className="card quote">{text}</div>
            {aiUsed && <div className="note">AI helped read some values. Please check each number against your question.</div>}
            {warn.length > 0 && <div className="note warn">We could not find: {warn.join(', ')}. Please fill them in below.</div>}
            <div className="grid2">
              <Num k="L" label="Length (mm)" />
              <Num k="theta" label="Angle with HP θ (°)" />
              <Num k="phi" label="Angle with VP φ (°)" />
              <Num k="ha" label="End A above HP (mm)" />
              <Num k="da" label="End A in front of VP (mm)" />
              <div className="field">
                <span>Line name</span>
                <div className="names">
                  <input maxLength={1} value={inp.n1 ?? ''} onChange={(e) => setInp({ ...inp, n1: e.target.value.toUpperCase() })} />
                  <input maxLength={1} value={inp.n2 ?? ''} onChange={(e) => setInp({ ...inp, n2: e.target.value.toUpperCase() })} />
                </div>
              </div>
            </div>
            {!Number.isNaN(inp.theta) && !Number.isNaN(inp.phi) && <div className="note">{KIND_LABEL[kindOf(inp)]}. First angle projection, A3 sheet.</div>}
            {err && <div className="note warn">{err}</div>}
            <button className="btn primary full big" onClick={solveNow}>Show me the steps →</button>
          </>
        )}

        {screen === 'steps' && sol && st && (
          <>
            <div className="bar"><Back to={qid ? 'sheets' : 'confirm'} /><div className="grow"><div className="eyebrow">{sol.title}</div><h2>Step {step + 1} of {n}</h2></div></div>
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'lesson'} className={tab === 'lesson' ? 'on' : ''} onClick={() => setTab('lesson')}>🎬 Animated lesson</button>
              <button role="tab" aria-selected={tab === 'turn'} className={tab === 'turn' ? 'on' : ''} onClick={() => setTab('turn')}>🎯 Your turn</button>
              <button role="tab" aria-selected={tab === 'steps'} className={tab === 'steps' ? 'on' : ''} onClick={() => setTab('steps')}>📋 Steps</button>
            </div>
            {matched && <div className="note">{matched}</div>}
            <button className="reportbtn" onClick={() => { setFbMsg(''); setFbKind('wrong-step'); setFbState('idle'); setFb(true); }}>🚩 Spotted a mistake or something unclear in this step?</button>
            {tab === 'lesson' && (
              <>
                {curQ?.topic === 'lettering'
                  ? <><div className="card qcard"><span className="qtag">The question</span>{qtext ?? curQ.statement}</div><div className="card stage"><DrawingSvg sol={sol} upto={sol.steps.length - 1} /></div></>
                  : <Player sol={sol} question={qtext ?? curQ?.statement ?? text} />}
                {curQ && <YtCard q={curQ} />}
                {curQ?.p && <button className="btn ghost full" onClick={() => { const v = variantOf(curQ); if (v) { setSol(v.sol); setQtext(v.statement); setStep(0); sfx('pop'); } }}>🎲 Try new numbers</button>}
                <button className="btn primary full" onClick={() => { finish(); setScreen('sheet'); }}>See final sheet →</button>
              </>
            )}
            {tab === 'turn' && <Challenge sol={sol} award={award} />}
            {tab === 'steps' && (<>
            {curQ && <div className="card qcard"><span className="qtag">The question</span>{qtext ?? curQ.statement}</div>}
            <div className="prog">{sol.steps.map((_, i) => <i key={i} className={i < step ? 'done' : i === step ? 'cur' : ''} />)}</div>
            <div className="card draw" onTouchStart={(e) => { touch.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touch.current === null) return; const d = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); }}>
              <DrawingSvg sol={sol} upto={step} />
              <div className="hint">Swipe left or right to change step</div>
            </div>
            <CatSays mood={step === n - 1 ? 'happy' : step % 2 ? 'point' : 'think'} k={`${sol.id}-${step}`}>
              <b>{catLine(step, n)}</b>{st.why}
            </CatSays>
            <div className="card" key={`c${step}`}>
              <h3 className="st">{st.title}</h3>
              <div className="tags"><span>🖊 {st.tool}</span>{pencilsOf(st.prims).map((g) => <span key={g} className="pgrade" style={{ background: colOf(g) }}>{g} pencil</span>)}</div>
            </div>
            <div className="card info">
              <h3>🐾 What I added</h3>
              <ul className="added">
                {added(st.prims).map((x, i) => (<li key={i}><span>{x.what}</span>{x.len && <b>{x.len}</b>}</li>))}
              </ul>
            </div>
            {st.calc && <div className="card info calcbox"><h3>🧮 Length / calculation</h3><div className="calcline">{st.calc}</div></div>}
            {step === 0 && sol.plan && (
              <div className="card info plan"><h3>🧠 How we crack this question</h3><ol>{sol.plan.map((x, i) => <li key={i}>{x}</li>)}</ol></div>
            )}
            <button className="btn ghost full" onClick={() => setVid(true)}>▶ Watch videos for this topic</button>
            <div className="row">
              <button className="btn ghost grow" disabled={step === 0} onClick={() => { setPlaying(false); setStep(step - 1); }}>Back</button>
              <button className="btn dark sq" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚' : '▶'}</button>
              {step < n - 1 ? (
                <button className="btn primary grow2" onClick={() => { setPlaying(false); setStep(step + 1); }}>Next step</button>
              ) : (
                <button className="btn primary grow2" onClick={() => { finish(); setScreen('sheet'); }}>See final sheet</button>
              )}
            </div>
            </>)}
          </>
        )}

        {screen === 'sheet' && sol && (
          <>
            <div className="bar"><Back to="steps" /><div><div className="eyebrow ok">All {n} steps done</div><h2>Your final sheet</h2></div></div>
            <div className="confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 8) * 0.15}s`, background: ['#F4A340', '#0B7A75', '#E0607E', '#C2410C'][i % 4] }} />)}</div>
            <CatSays mood="happy" k="done">Purr-fect! All {n} steps done. Download the PDF and copy it onto your A3 sheet. 🎉</CatSays>
            {sol.plan && <div className="card info plan"><h3>🧠 How we cracked it</h3><ol>{sol.plan.map((x, i) => <li key={i}>{x}</li>)}</ol></div>}
            <details className="card info tbedit"><summary>✏️ Title block: name, roll no., institution</summary>
            <div className="grid2">
              <label className="field"><span>Your name</span><input value={pname} maxLength={60} onChange={(e) => setPname(e.target.value)} /></label>
              <label className="field"><span>Roll no.</span><input value={proll} maxLength={30} onChange={(e) => setProll(e.target.value)} /></label>
            </div>
            <label className="field"><span>Institution (title block)</span><input value={inst} maxLength={60} onChange={(e) => setInst(e.target.value)} /></label>
            </details>
            <div className="card sheet"><SheetSvg sol={sol} svgRef={sheetRef} name={pname} roll={proll} institution={inst} /></div>
            {sol.results.map((r, i) => (
              <div key={i} className="card calc2"><span>{r.label}</span><b>{r.value}</b></div>
            ))}
            <div className="card info"><h3>✍️ Working to write on your sheet</h3>
              <ol className="working">{sol.steps.filter((x) => x.calc).map((x, i) => <li key={i}><span>{x.title}</span><b>{x.calc}</b></li>)}</ol></div>
            <Quiz key={sol.id + step} sol={sol} award={award} />
            {msg && <div className="note">{msg}</div>}
            <div className="row">
              {sol.lineInput && <button className="btn ghost grow" onClick={save}>Save</button>}
              <button className="btn primary grow2" onClick={download}>Download PDF</button>
            </div>
            <button className="btn ghost full" onClick={() => setScreen('mistakes')}>Avoid these mistakes →</button>
          </>
        )}

        {screen === 'mistakes' && sol && (
          <>
            <div className="bar"><Back to="sheet" /><div><div className="eyebrow">Marks lost here most</div><h2>Avoid these {sol.mistakes.length}</h2></div></div>
            {sol.mistakes.map((m, i) => (
              <div key={i} className="card mis"><span className="num">{i + 1}</span><div><b>{m.title}.</b> {m.body}</div></div>
            ))}
            <button className="btn primary full big" onClick={() => loadText(randomQuestion())}>Practice with new numbers</button>
          </>
        )}

        {screen === 'saved' && (
          <>
            <h1 className="sm">My sheets</h1>
            <div className="pagecat"><Cat mood="think" size={74} level={level} /><div className="bubble">Your saved sheets live here. Open one to see it again or download the PDF.</div></div>
            {saved.length === 0 && <div className="note">Nothing saved yet. Solve a question and tap Save on the final sheet.</div>}
            <div className="list">
              {saved.map((s) => (
                <div key={s.id} className="item row">
                  <button className="open" onClick={() => { const i = s.input; loadText(`A line ${i.n1 ?? 'A'}${i.n2 ?? 'B'}, ${i.L} mm long, ${i.theta === 0 ? 'is parallel to the HP' : `is inclined at ${i.theta}° to the HP`} ${i.phi === 0 ? 'and parallel to the VP' : `and inclined at ${i.phi}° to the VP`}. End ${i.n1 ?? 'A'} is ${i.ha ? `${i.ha} mm above the HP` : 'in the HP'} and ${i.da ? `${i.da} mm in front of the VP` : 'in the VP'}.`); }}>
                    {s.title}<span>{new Date(s.created_at).toLocaleDateString()}</span>
                  </button>
                  <button className="mini" aria-label={`Rename ${s.title}`} onClick={async () => { const t = window.prompt('New name for this sheet', s.title)?.trim(); if (t && t !== s.title) { if (await renameSheet(s.id, t.slice(0, 120))) setSaved((a) => a.map((x) => (x.id === s.id ? { ...x, title: t.slice(0, 120) } : x))); else setMsg('Could not rename right now.'); } }}>✏️</button>
                  <button className="mini" aria-label={`Delete ${s.title}`} onClick={async () => { if (window.confirm(`Delete “${s.title}”?`)) { if (await deleteSheet(s.id)) setSaved((a) => a.filter((x) => x.id !== s.id)); else setMsg('Could not delete right now.'); } }}>🗑️</button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {fb && (
        <div className="modal" onClick={() => setFb(false)}>
          <form className="sheetm" role="dialog" aria-modal="true" aria-label="Report a problem" onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
            e.preventDefault();
            setFbState('sending');
            const r = await sendFeedback({ kind: fbKind, message: fbMsg, questionId: qid || undefined, step });
            setFbState(r === 'sent' ? 'sent' : r === 'off' ? 'off' : 'error');
          }}>
            <h3>Tell us what looks wrong</h3>
            {fbState === 'sent' ? <div className="note">Thank you! Your lecturer team will check it. 🐾</div> : (
              <>
                <label className="field"><span>What kind of problem?</span>
                  <select value={fbKind} onChange={(e) => setFbKind(e.target.value as typeof fbKind)}>
                    <option value="wrong-step">This step looks wrong</option>
                    <option value="unclear">I do not understand this</option>
                    <option value="bug">The app is broken</option>
                    <option value="idea">I have an idea</option>
                  </select>
                </label>
                <label className="field"><span>Tell us more (step {step + 1}{qid ? `, ${qid}` : ''})</span>
                  <textarea rows={4} maxLength={1000} required minLength={3} value={fbMsg} onChange={(e) => setFbMsg(e.target.value)} />
                </label>
                {fbState === 'off' && <div className="note">Feedback is not switched on for this app yet.</div>}
                {fbState === 'error' && <div className="note">Could not send. Please try again in a minute.</div>}
                <button className="btn full" type="submit" disabled={fbState === 'sending' || fbMsg.trim().length < 3}>{fbState === 'sending' ? 'Sending…' : 'Send'}</button>
              </>
            )}
            <button type="button" className="btn ghost full" onClick={() => setFb(false)}>Close</button>
          </form>
        </div>
      )}

      {vid && (
        <div className="modal" onClick={() => setVid(false)}>
          <div className="sheetm" onClick={(e) => e.stopPropagation()}>
            <h3>Videos</h3>
            {vids.map((v) => (
              v.id ? <div key={v.label} className="vwrap"><iframe title={v.label} src={`https://www.youtube-nocookie.com/embed/${v.id}`} allow="encrypted-media; picture-in-picture" allowFullScreen /></div>
                   : <a key={v.label} className="item" href={ytUrl(v)} target="_blank" rel="noreferrer">{v.label}<span>YouTube ↗</span></a>
            ))}
            <button className="btn ghost full" onClick={() => setVid(false)}>Close</button>
          </div>
        </div>
      )}

      <nav className="nav">
        <button className={screen === 'scan' || screen === 'confirm' ? 'on' : ''} onClick={() => setScreen('scan')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>Scan
        </button>
        <button className={screen === 'sheets' ? 'on' : ''} onClick={() => setScreen('sheets')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 9h6M9 13h6M9 17h3" /></svg>Sheets
        </button>
        <button className={screen === 'steps' || screen === 'sheet' || screen === 'mistakes' ? 'on' : ''} disabled={!sol} onClick={() => setScreen('steps')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h7a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4zM20 5h-6" /></svg>Steps
        </button>
        <button className={screen === 'saved' ? 'on' : ''} onClick={openSaved}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 10h16" /></svg>My sheets
        </button>
        <button onClick={() => loadText(randomQuestion())}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1z" /></svg>Practice
        </button>
      </nav>
    </div>
    </div>
  );
}
