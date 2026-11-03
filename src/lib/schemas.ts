import { z } from 'zod';

const num = (min: number, max: number) => z.number().finite().min(min).max(max);
const letter = z.string().trim().regex(/^[A-Za-z]$/).optional();

/** Same ranges as `validate()` in solver.ts, so the API can reject bad input before solving. */
export const lineInput = z.object({
  L: num(0.01, 400),
  theta: num(0, 90),
  phi: num(0, 90),
  ha: num(0, 200),
  da: num(0, 200),
  n1: letter,
  n2: letter,
});

export const gameSchema = z.object({
  xp: num(0, 1_000_000),
  streak: num(0, 10_000),
  last: z.string().max(10),
  tapOk: num(0, 100_000),
  quizOk: num(0, 100_000),
  variants: num(0, 100_000),
  daily: z.string().max(10).optional().default(''),
});

export const progressSchema = z.object({
  done: z.array(z.string().max(40)).max(500),
  game: gameSchema,
});

export const profileSchema = z.object({
  name: z.string().trim().max(60),
  roll: z.string().trim().max(30),
  // leaderboard nickname: letters, digits, spaces, _ and - only (no links or symbols)
  nick: z.string().trim().max(24).regex(/^[\p{L}\p{N} _-]*$/u).optional().default(''),
  onBoard: z.boolean().optional().default(false),
});

export const saveSheetSchema = z.object({ title: z.string().trim().min(1).max(120), input: lineInput });
export const renameSheetSchema = z.object({ title: z.string().trim().min(1).max(120) });

export const feedbackSchema = z.object({
  questionId: z.string().max(40).optional(),
  step: z.number().int().min(0).max(100).optional(),
  kind: z.enum(['wrong-step', 'unclear', 'idea', 'bug']),
  message: z.string().trim().min(3).max(1000),
});

export const solveSchema = z.object({ input: lineInput });
export const readSchema = z.object({ text: z.string().max(2000).optional(), image: z.string().max(2_500_000).optional() });

export type ProgressData = z.infer<typeof progressSchema>;
