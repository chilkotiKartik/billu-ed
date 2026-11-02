import type { Solution } from './types';
import { R } from './draw';

export interface QQ { prompt: string; options: string[]; answer: number; why: string }

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
const shuffle = <T,>(a: T[], r: () => number) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const NUM = /-?\d+(?:\.\d+)?/;
const QUAD = ['first quadrant', 'second quadrant', 'third quadrant', 'fourth quadrant'];

function place(correct: string, wrong: string[], prompt: string, why: string, r: () => number): QQ {
  const opts = shuffle([correct, ...wrong.slice(0, 3)], r);
  return { prompt, options: opts, answer: opts.indexOf(correct), why };
}

/** Questions made from the solution itself, so every question gets a quiz and nothing is typed twice. */
export function makeQuiz(sol: Solution): QQ[] {
  const r = rng(sol.id);
  const out: QQ[] = [];
  const calcOf = (v: string) => sol.steps.find((s) => s.calc && NUM.test(v) && s.calc.includes(v.match(NUM)![0]))?.calc;
  for (const res of sol.results) {
    if (out.length >= 2) break;
    const m = res.value.match(NUM);
    if (m && !/point/.test(res.value)) {
      const n = parseFloat(m[0]);
      const cands = [R(n * 0.5), R(n + 10), R(n * 1.25), res.value.includes('°') ? R(90 - n) : R(n * 2)].filter((x) => x > 0 && x !== n);
      const uniq = [...new Set(cands)].slice(0, 3);
      if (uniq.length < 2) continue;
      out.push(place(res.value, uniq.map((x) => res.value.replace(NUM, String(x))), `${res.label}: which value is correct?`, calcOf(res.value) ?? 'Look at the working on the final sheet.', r));
    } else if (QUAD.includes(res.value)) {
      out.push(place(res.value, QUAD.filter((x) => x !== res.value), `Point ${res.label}: which quadrant is it in?`, 'Above or below HP gives the front view. In front of or behind VP gives the top view.', r));
    }
  }
  if (!out.length) {
    const vals = [...new Set(sol.results.map((x) => x.value))];
    const res = sol.results[0];
    if (res && vals.length >= 3) out.push(place(res.value, vals.filter((v) => v !== res.value), `${res.label}: how is it drawn?`, 'Check the key on the final sheet.', r));
  }
  if (sol.steps.length >= 4) {
    const i = 1 + Math.floor(r() * (sol.steps.length - 3));
    const next = sol.steps[i + 1].title;
    const others = sol.steps.map((s) => s.title).filter((t, k) => k !== i + 1 && t !== sol.steps[i].title);
    out.push(place(next, shuffle(others, r), `You just did “${sol.steps[i].title}”. What comes next?`, sol.steps[i + 1].why, r));
  }
  return out.slice(0, 3);
}
