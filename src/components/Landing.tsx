import Link from 'next/link';
import { Cat } from './Cat';
import HeroDemo from './HeroDemo';
import { SHEETS, ALL } from '@/lib/catalog';
import { LEVELS } from '@/lib/game';
import { SiteFooter } from './SiteFooter';

const FEATURES = [
  ['📸', 'Scan, type or pick', 'Photograph a question or type it. The app reads the numbers and asks you to confirm them. No guessing.'],
  ['✏️', 'Live drawing lessons', 'Watch a real pencil, ruler and compass draw every line slowly, with the length shown as it grows.'],
  ['📏', 'Lengths and pencils', 'Every step shows how long each line is, the calculation behind it, and which pencil (H, 2H, 3H, 4H) to use.'],
  ['🧠', 'How we crack it', 'A short plan before the first line: what is given, what to find and which formula to use.'],
  ['🎯', 'Your turn', 'Tap the right points yourself. The cat tells you instantly if you are correct.'],
  ['🔁', 'New-number practice', 'Same question with fresh numbers, so you learn the method and not the answer.'],
  ['📄', 'A1 and A3 sheets', 'All your questions placed on a neat sheet with title block, ready to download as a PDF.'],
  ['🏆', 'XP, levels, badges', 'Earn XP as you finish questions. Your cat gets glasses, a cap, a scarf and a crown.'],
];
// one colour and icon per sheet, for the sheet cards
const SHEET_LOOK: Record<string, { ic: string; c: string; blurb: string }> = {
  s1: { ic: '📏', c: '#F4A340', blurb: 'Every BIS line type on one figure, plus single-stroke lettering.' },
  s2: { ic: '📍', c: '#0B7A75', blurb: 'Points in all four quadrants, then lines parallel and perpendicular to HP and VP.' },
  s3: { ic: '📐', c: '#C2410C', blurb: 'Lines inclined to one plane: true length, angles and the missing views.' },
  s4: { ic: '🧭', c: '#5B5BD6', blurb: 'Lines inclined to both HP and VP with the two-position method.' },
};
const XP_AT = [0, 40, 160, 360, 640];

const STEPS = [
  ['Sign up free', 'Create your account in seconds with your email.'],
  ['Pick your question', 'Scan it, type it, or choose from the sheet list.'],
  ['Watch and learn', 'Follow the animated lesson at your own speed, with the cat explaining.'],
  ['Draw and download', 'Copy it onto your sheet at the scale shown, or download the finished sheet as a PDF.'],
];

export default function Landing({ signedIn }: { signedIn: boolean }) {
  const qs = SHEETS.flatMap((s) => s.parts.flatMap((p) => p.qs.map((q) => ({ s: s.title.split(' · ')[0], code: q.code, title: q.title }))));
  const go = signedIn ? { href: '/app', label: 'Open the app →' } : { href: '/sign-up', label: 'Start free →' };
  return (
    <div className="lp">
      <nav className="lnav">
        <Link href="/" className="brand"><Cat size={40} /> ED Cat</Link>
        <div className="links"><a href="#features">Features</a><a href="#how">How it works</a><a href="#sheets">Sheets</a></div>
        <div className="acts">
          {signedIn ? <Link className="lbtn pri" href="/app">Open app</Link> : (<><Link className="lbtn" href="/sign-in">Log in</Link><Link className="lbtn pri" href="/sign-up">Register</Link></>)}
        </div>
      </nav>

      <header className="lsec hero">
        <div className="fadein">
          <span className="pill">🐾 For first-year B.Tech Engineering Drawing</span>
          <h1>Learn to draw <span className="acc">every sheet</span>, one clear step at a time.</h1>
          <p className="lead">ED Cat shows each line being drawn, tells you its exact length and the pencil to use, and explains why. Points, lines, projections and more, from Sheet 1 to Sheet 4.</p>
          <div className="cta"><Link className="lbtn pri big" href={go.href}>{go.label}</Link>{!signedIn && <Link className="lbtn big" href="/sign-in">I have an account</Link>}</div>
          <div className="trust"><span>✅ Works on your phone</span><span>✅ Install like an app</span><span>✅ {ALL.length} questions covered</span></div>
        </div>
        <div className="fadein" style={{ animationDelay: '.15s' }}><HeroDemo /></div>
      </header>

      <section className="lsec" id="features">
        <h2 className="lh2">Everything the cat teaches you</h2>
        <p className="lsub">Built for the way students actually learn drawing: watch it, understand it, then try it.</p>
        <div className="fgrid">{FEATURES.map(([ic, t, d]) => <div className="fcard" key={t}><span className="ic">{ic}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="lsec how" id="how">
        <h2 className="lh2">How it works</h2>
        <p className="lsub">From question to finished sheet in four steps.</p>
        <div className="hsteps">{STEPS.map(([t, d]) => <div className="hs" key={t}><b>{t}</b><p>{d}</p></div>)}</div>
      </section>

      <section className="lsec" id="sheets">
        <h2 className="lh2">All your sheet questions are inside</h2>
        <p className="lsub">{ALL.length} questions from Sheet 1 to Sheet 4, each with a live lesson, steps, practice and a finished sheet.</p>
        <div className="sgrid">
          {SHEETS.map((sh) => {
            const look = SHEET_LOOK[sh.id] ?? { ic: '📄', c: '#1B2340', blurb: '' };
            const qs = sh.parts.flatMap((p) => p.qs);
            const [num, name] = sh.title.split(' · ');
            return (
              <article className="scard" key={sh.id} style={{ ['--sc' as string]: look.c }}>
                <div className="shead"><span className="sic" aria-hidden="true">{look.ic}</span><div><small>{num} · {qs.length} {qs.length === 1 ? 'question' : 'questions'}</small><h3>{name.charAt(0).toUpperCase() + name.slice(1)}</h3></div></div>
                <p className="sblurb">{look.blurb}</p>
                <ul className="sqs">
                  {qs.slice(0, 4).map((q) => <li key={q.id}><b>{q.code}</b><span>{q.title}</span></li>)}
                  {qs.length > 4 && <li className="more">+ {qs.length - 4} more</li>}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="lsec lvsec">
        <h2 className="lh2">Level up your cat</h2>
        <p className="lsub">Finish questions, ace the quiz and keep your streak to earn XP. Your cat dresses up as you grow.</p>
        <ol className="lvtrack">
          {[1, 2, 3, 4, 5].map((l) => (
            <li key={l}>
              <div className="lvcat"><Cat size={78} level={l} mood={l === 5 ? 'happy' : 'idle'} /></div>
              <b>Lv {l} · {LEVELS[l - 1]}</b>
              <span>{['Your first paw print', '+ smart glasses', '+ graduation cap', '+ cosy scarf', '+ golden crown'][l - 1]}</span>
              <em>{XP_AT[l - 1]} XP</em>
            </li>
          ))}
        </ol>
      </section>

      <section className="lsec cband">
        <Cat mood="happy" size={110} level={3} />
        <h2>Ready to meet your drawing buddy?</h2>
        <p>Free for students. Takes less than a minute to start.</p>
        <Link className="lbtn pri big" href={go.href}>{go.label}</Link>
      </section>
      <SiteFooter />
    </div>
  );
}
