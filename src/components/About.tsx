import { Cat } from './Cat';
import { SHEETS } from '@/lib/catalog';

const STAGES = [
  ['1', 'Catalogue entry', 'The question text from your sheet is stored word for word in src/lib/catalog.ts with an id, a code (Q1, A2…) and a topic.'],
  ['2', 'Setup', 'The numbers are turned into inputs: L, θ, φ, height above HP, distance from VP. This is the “setup” line you see under each question below.'],
  ['3', 'Solver', 'Plain formulas, no AI: h = L sin θ, d = L sin φ, front view = L cos φ, top view = L cos θ. Special builders handle points, “find the angle” and the Sheet 1 figure.'],
  ['4', 'Steps', 'The solver writes a list of steps. Each step holds drawing items (lines, arcs, points, dimensions) in real millimetres, a reason, the tool and the calculation.'],
  ['5', 'Renderer', 'One renderer draws every question: the step view, the live animation (pencil, ruler, compass) and the A3 sheet. That is why they always agree.'],
  ['6', 'Matching', 'When you scan or type, the words and all numbers are compared with the catalogue. A match opens the solved sheet, otherwise the line solver is used.'],
];

export function About() {
  return (
    <>
      <div className="aboutcat"><Cat mood="point" size={90} /><div><h1 className="sm">How it works</h1><p>From your question to every line on the sheet.</p></div></div>
      <div className="pipe">
        {STAGES.map(([n, t, d], i) => (
          <div key={n} className="stage2" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="sn">{n}</div>
            <div><b>{t}</b><p>{d}</p></div>
            {i < STAGES.length - 1 && <div className="flowarrow" aria-hidden="true">↓</div>}
          </div>
        ))}
      </div>
      <div className="card info">
        <h3>➕ Add your own question</h3>
        <p className="mono small">{`line('s3-C4', 'C4', 'Title', 'Question text', 30, 45, 15, 20, 'inclined')`}</p>
        <p className="small">Arguments: id, code, title, statement, θ (to HP), φ (to VP), end A above HP, end A in front of VP, topic. Put it in the right part of SHEETS in catalog.ts and it appears in the menu, the animation and the A3 sheet.</p>
      </div>
      <div className="card info aboutcredit"><h3>👋 Made by</h3><p><b>Kartik Chilkoti</b> designed and built ED Cat for Engineering Drawing students. © 2026 · <a href="/copyright">Copyright &amp; credits</a></p></div>
      <h3>How each question was set up</h3>
      {SHEETS.flatMap((s) => s.parts.flatMap((p) => p.qs)).map((q) => (
        <div key={q.id} className="card setup"><b>{q.code} · {q.title}</b><p>{q.setup}</p></div>
      ))}
    </>
  );
}
