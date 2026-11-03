import { ALL } from './catalog';
export interface Game { xp: number; streak: number; last: string; tapOk: number; quizOk: number; variants: number }
const KEY = 'edcat.game';
export const EMPTY: Game = { xp: 0, streak: 0, last: '', tapOk: 0, quizOk: 0, variants: 0 };
export const LEVELS = ['Kitten', 'Scribbler', 'Sharp Paw', 'Drafter', 'Master Cat', 'Legend'];
export const levelOf = (xp: number) => Math.min(6, 1 + Math.floor(Math.sqrt(xp / 40)));
export function progress(xp: number) {
  const l = levelOf(xp);
  if (l >= 6) return { pct: 100, next: xp };
  const a = 40 * (l - 1) ** 2, b = 40 * l ** 2;
  return { pct: Math.round((100 * (xp - a)) / (b - a)), next: b };
}
const day = () => new Date().toLocaleDateString('en-CA');
export function load(): Game {
  try {
    const g = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') } as Game;
    const t = day();
    if (g.last !== t) {
      const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA');
      g.streak = g.last === y ? g.streak + 1 : 1;
      g.last = t;
      save(g);
    }
    return g;
  } catch { return { ...EMPTY }; }
}
export function save(g: Game) { try { localStorage.setItem(KEY, JSON.stringify(g)); } catch { /* ignore */ } }

export interface Badge { id: string; icon: string; name: string; desc: string; test: (g: Game, done: string[]) => boolean }
const all = (ids: (d: string) => boolean) => (done: string[]) => done.some(ids);
export const BADGES: Badge[] = [
  { id: 'first', icon: '🐾', name: 'First paw print', desc: 'Finish your first question', test: (_, d) => d.length >= 1 },
  { id: 'lines', icon: '📏', name: 'Line Legend', desc: 'Finish all of Sheet 1 and the lines of Sheet 2', test: (_, d) => ['s1', 's2-2-A1', 's2-2-A2', 's2-2-A3', 's2-2-B1', 's2-2-B2', 's2-2-B3'].every((x) => d.includes(x)) },
  { id: 'points', icon: '📍', name: 'Point Pro', desc: 'Finish both point questions', test: (_, d) => d.includes('s2-1-q1') && d.includes('s2-1-q7') },
  { id: 'incl', icon: '📐', name: 'Angle Ace', desc: 'Finish every Sheet 3 question', test: (_, d) => ['s3-C1', 's3-C2', 's3-C3', 's3-q2', 's3-q3', 's3-q4', 's3-q5', 's3-q6'].every((x) => d.includes(x)) },
  { id: 'eye', icon: '🎯', name: 'Sharp Eye', desc: 'Place 10 points correctly in Your turn', test: (g) => g.tapOk >= 10 },
  { id: 'quiz', icon: '🎓', name: 'Quiz Whiz', desc: 'Answer 10 cat quiz questions right', test: (g) => g.quizOk >= 10 },
  { id: 'fire', icon: '🔥', name: 'On fire', desc: 'Study 3 days in a row', test: (g) => g.streak >= 3 },
  { id: 'dice', icon: '🎲', name: 'New numbers', desc: 'Finish 3 questions with new numbers', test: (g) => g.variants >= 3 },
  { id: 'all', icon: '👑', name: 'Completionist', desc: 'Finish every question', test: (_, d) => d.length >= ALL.length },
];
export const _all = all;
