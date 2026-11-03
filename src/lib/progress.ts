import type { Game } from './game';
import type { ProgressData } from './schemas';

export type Progress = { done: string[]; game: Game };

/** Merge two copies of a student's progress without ever losing work (device vs account). */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const done = Array.from(new Set([...a.done, ...b.done]));
  const later = a.game.last >= b.game.last ? a.game : b.game;
  const game: Game = {
    xp: Math.max(a.game.xp, b.game.xp),
    streak: later.streak,
    last: later.last,
    tapOk: Math.max(a.game.tapOk, b.game.tapOk),
    quizOk: Math.max(a.game.quizOk, b.game.quizOk),
    variants: Math.max(a.game.variants, b.game.variants),
  };
  return { done, game };
}

export const sameProgress = (a: Progress, b: Progress) =>
  a.done.length === b.done.length && a.done.every((x) => b.done.includes(x)) &&
  a.game.xp === b.game.xp && a.game.streak === b.game.streak && a.game.last === b.game.last &&
  a.game.tapOk === b.game.tapOk && a.game.quizOk === b.game.quizOk && a.game.variants === b.game.variants;

export const toApi = (p: Progress): ProgressData => ({ done: p.done, game: p.game });
