import { ALL, type Q } from './catalog';
import { day } from './game';

export const DAILY_XP = 20;

/** Same question for every student on the same day (rotates through the whole catalog). */
export function dailyQuestion(date = day()): Q {
  let h = 0;
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ALL[h % ALL.length];
}
