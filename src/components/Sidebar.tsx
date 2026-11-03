'use client';
import { useState } from 'react';
import { Cat } from './Cat';
import { SHEETS, ALL, type Q } from '@/lib/catalog';

export type Nav = 'scan' | 'trophies' | 'sheets' | 'full' | 'about' | 'saved';

const FLOW = ['Scan', 'Check', 'Steps', 'Sheet'];

export function Sidebar({ open, onClose, done, qid, screen, flowAt, level, onNav, onOpenQ }: {
  open: boolean; onClose: () => void; done: string[]; qid: string; screen: string; flowAt: number; level: number;
  onNav: (n: Nav) => void; onOpenQ: (q: Q) => void;
}) {
  const [shut, setShut] = useState<Record<string, boolean>>({});
  const pct = Math.round((100 * done.length) / ALL.length);
  const link = (n: Nav, icon: string, label: string) => (
    <button className={`sl ${screen === n ? 'on' : ''}`} onClick={() => { onNav(n); onClose(); }}><span>{icon}</span>{label}<i>›</i></button>
  );
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`side ${open ? 'open' : ''}`} aria-label="Menu">
        <div className="sidehead">
          <Cat mood="happy" size={54} level={level} />
          <div><b>ED Cat</b><small>Engineering Drawing helper</small></div>
          <button className="x" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <div className="ring">
          <svg width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="22" fill="none" stroke="#E8E2D2" strokeWidth="6" /><circle cx="27" cy="27" r="22" fill="none" stroke="#0B7A75" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 138.2} 138.2`} transform="rotate(-90 27 27)" style={{ transition: 'stroke-dasharray .6s' }} /></svg>
          <div><b>{done.length} of {ALL.length} done</b><small>{pct}% of your sheets</small></div>
        </div>
        <ol className="flow">
          {FLOW.map((f, i) => (<li key={f} className={i === flowAt ? 'on' : i < flowAt ? 'past' : ''}>{f}{i < FLOW.length - 1 && <em>→</em>}</li>))}
        </ol>
        <nav className="sidenav">
          {link('scan', '📷', 'Scan or type a question')}
          {link('sheets', '📚', 'All questions')}
          {link('full', '📄', 'Full sheets (A1 · A3)')}
          {link('trophies', '🏆', 'Level and trophies')}
          {link('about', '🧠', 'How it works')}
          {link('saved', '💾', 'My saved')}
        </nav>
        <div className="tree">
          {SHEETS.map((sh) => {
            const isShut = shut[sh.id];
            const qs = sh.parts.flatMap((p) => p.qs);
            return (
              <div key={sh.id} className="grp">
                <button className="gh" onClick={() => setShut({ ...shut, [sh.id]: !isShut })} aria-expanded={!isShut}>
                  <i className={isShut ? '' : 'turn'}>▸</i>{sh.title}<small>{qs.filter((q) => done.includes(q.id)).length}/{qs.length}</small>
                </button>
                {!isShut && sh.parts.map((p) => (
                  <div key={p.title}>
                    <div className="ph">{p.title}</div>
                    {p.qs.map((q) => (
                      <button key={q.id} className={`qi ${q.id === qid ? 'on' : ''}`} onClick={() => { onOpenQ(q); onClose(); }}>
                        <span className={`tk ${done.includes(q.id) ? 'on' : ''}`}>{done.includes(q.id) ? '✓' : '→'}</span>
                        <span><b>{q.code}</b> {q.title}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <p className="sidecredit">Made with 🧡 by <b>Kartik Chilkoti</b> · © 2026<br /><a href="/copyright">Copyright &amp; credits</a> · <a href="/privacy">Privacy</a></p>
      </aside>
    </>
  );
}
