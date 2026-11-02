import { solve, kindOf } from '../src/lib/solver';
import { parseQuestion } from '../src/lib/parser';
import { PRESETS, randomQuestion } from '../src/lib/presets';
import { cleanAI } from '../src/lib/gemini';
import { ALL, matchCatalog } from '../src/lib/catalog';
import { makeQuiz } from '../src/lib/quiz';
import { variantOf } from '../src/lib/catalog';
import { bbox } from '../src/lib/geom';
import type { LineInput } from '../src/lib/types';

let fails = 0;
const ok = (c: boolean, m: string) => { if (!c) { fails++; console.error('FAIL', m); } };
const near = (a: number, b: number) => Math.abs(a - b) < 0.01;

// 1. Worked example from the plan: L=70, parallel HP, 30° to VP, A 20 above / 15 in front
{
  const s = solve({ L: 70, theta: 0, phi: 30, ha: 20, da: 15, n1: 'A', n2: 'B' });
  ok(near(s.Lf, 60.62), `Lf ${s.Lf}`);
  ok(near(s.bT[1], -50), `b below XY ${s.bT[1]}`);
  ok(near(s.bF[1], 20), 'b′ stays 20 above XY');
  ok(s.kind === 'hp', 'kind hp');
}

// 2. Geometry invariants for many random valid lines (true length, apparent lengths, true angles)
for (let i = 0; i < 500; i++) {
  const t = Math.floor(Math.random() * 91), p = Math.floor(Math.random() * (91 - t));
  const inp: LineInput = { L: 20 + Math.random() * 150, theta: t, phi: p, ha: Math.random() * 40, da: Math.random() * 40 };
  const s = solve(inp);
  const fx = s.bF[0] - s.aF[0], fy = s.bF[1] - s.aF[1], ty = s.bT[1] - s.aT[1];
  ok(near(Math.hypot(fx, fy), s.Lf), `FV length ${JSON.stringify(inp)}`);
  ok(near(Math.hypot(s.bT[0] - s.aT[0], ty), s.Lt), `TV length ${JSON.stringify(inp)}`);
  ok(near(Math.hypot(fx, fy, ty), inp.L), `3D length ${JSON.stringify(inp)}`);
  ok(near((Math.asin(Math.min(1, fy / inp.L)) * 180) / Math.PI, t), `theta ${JSON.stringify(inp)}`);
  ok(near((Math.asin(Math.min(1, -ty / inp.L)) * 180) / Math.PI, p), `phi ${JSON.stringify(inp)}`);
  ok(s.steps.length >= 5 && s.steps.every((x) => x.prims.length > 0), 'steps present');
}

// 3. Impossible line is rejected
let threw = false;
try { solve({ L: 50, theta: 60, phi: 50, ha: 0, da: 0 }); } catch { threw = true; }
ok(threw, 'θ+φ>90 rejected');

// 4. Parser reads every preset correctly
const expect: Record<string, Partial<LineInput>> = {
  p1: { L: 70, theta: 0, phi: 30, ha: 20, da: 15, n1: 'A', n2: 'B' },
  p2: { L: 80, theta: 45, phi: 0, ha: 15, da: 25, n1: 'P', n2: 'Q' },
  p3: { L: 75, theta: 30, phi: 40, ha: 15, da: 20 },
  p4: { L: 60, theta: 0, phi: 45, ha: 0, da: 20, n1: 'C', n2: 'D' },
  p5: { L: 90, theta: 30, phi: 0, ha: 10, da: 0, n1: 'E', n2: 'F' },
  p6: { L: 100, theta: 45, phi: 30, ha: 10, da: 15 },
};
for (const p of PRESETS) {
  const { input, missing } = parseQuestion(p.text);
  ok(missing.length === 0, `${p.id} missing ${missing}`);
  for (const [k, v] of Object.entries(expect[p.id])) ok((input as Record<string, unknown>)[k] === v, `${p.id}.${k} = ${(input as Record<string, unknown>)[k]} want ${v}`);
}

// 5. Parser survives messy OCR text (extra spaces, "H.P.", "degrees", "mm" split)
{
  const { input, missing } = parseQuestion('Q.5  A  line  PQ  65 m m long is  inclined at 30 degrees to the H.P. and 45 degrees to the V.P.\nEnd P is 10 mm above H.P. and 20mm in front of V.P.');
  ok(missing.length === 0 && input.L === 65 && input.theta === 30 && input.phi === 45 && input.ha === 10 && input.da === 20, `messy: ${JSON.stringify(input)} ${missing}`);
}

// 6. Random practice questions round-trip through parser + solver
for (let i = 0; i < 300; i++) {
  const q = randomQuestion();
  const { input, missing } = parseQuestion(q);
  ok(missing.length === 0, `random missing: ${q}`);
  try { solve({ ...(input as LineInput) }); } catch (e) { ok(false, `random solve ${q} ${(e as Error).message}`); }
  ok(kindOf({ theta: input.theta!, phi: input.phi! }) !== undefined, 'kind');
}

// 7. AI output is cleaned: junk and out-of-range values are dropped
{
  const c = cleanAI({ L: 70, theta: null, phi: 30, ha: -5, da: 15, n1: 'a', n2: 'xyz', extra: 1 });
  ok(c.L === 70 && c.phi === 30 && c.da === 15 && c.theta === undefined && c.ha === undefined && c.n1 === 'A' && c.n2 === undefined, `cleanAI ${JSON.stringify(c)}`);
  ok(Object.keys(cleanAI('garbage')).length === 0, 'cleanAI garbage');
}


// 5. Whole catalogue builds; every step draws something; numbers match hand calculations
for (const q of ALL) {
  const so = q.build();
  ok(so.steps.length >= 3 && so.steps.every((x) => x.prims.length > 0 && x.why.length > 10), `steps ${q.id}`);
  ok(so.final.length > 0 && so.results.length > 0 && so.mistakes.length > 0, `parts ${q.id}`);
  const bb = bbox(so.final);
  ok(Number.isFinite(bb.w) && Number.isFinite(bb.h), `bbox ${q.id}`);
  const m = matchCatalog(q.statement);
  ok(!!m && m.q.id === q.id, `match ${q.id} -> ${m?.q.id}`);
}
const res = (id: string) => ALL.find((q) => q.id === id)!.build().results.map((r) => r.value).join(' | ');
ok(res('s3-q2').includes('14.48'), 'Q2 ' + res('s3-q2'));
ok(res('s3-q3').includes('33.75'), 'Q3 ' + res('s3-q3'));
ok(res('s3-q4').includes('42.83'), 'Q4 ' + res('s3-q4'));
ok(res('s3-q5').includes('75.06'), 'Q5 ' + res('s3-q5'));
ok(res('s3-q6').includes('36.87') && res('s3-q6').includes('125'), 'Q6 ' + res('s3-q6'));
ok(res('s2-1-q7').includes('34.64'), 'Q7 ' + res('s2-1-q7'));
ok(matchCatalog('A line AB, 70 mm long, is parallel to the HP and inclined at 30° to the VP. End A is 20 mm above the HP and 15 mm in front of the VP.') === null, 'custom not matched');

// 6. Every question has a quiz with exactly one right answer; line questions give valid new-number variants
for (const q of ALL) {
  const qs = makeQuiz(q.build());
  ok(qs.length >= 1, `quiz ${q.id}`);
  for (const x of qs) ok(x.options.length >= 3 && new Set(x.options).size === x.options.length && x.options[x.answer] !== undefined, `quiz options ${q.id}: ${x.prompt}`);
  if (q.p) for (let i = 0; i < 20; i++) { const v = variantOf(q); ok(!!v && v.sol.steps.length >= 4 && v.statement.length > 20, `variant ${q.id}`); }
}

console.log(fails ? `${fails} FAILED` : 'All self-tests passed');
process.exit(fails ? 1 : 0);
