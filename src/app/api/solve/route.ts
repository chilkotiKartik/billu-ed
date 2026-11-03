import { NextResponse } from 'next/server';
import { solve } from '@/lib/solver';
import { lineToSolution } from '@/lib/adapt';
import { solveSchema } from '@/lib/schemas';
import { body, fail, guard, isBody, isCtx } from '@/lib/server/http';

export async function POST(req: Request) {
  const g = await guard('solve', 60);
  if (!isCtx(g)) return g;
  const b = await body(req, solveSchema, 2_000);
  if (!isBody(b)) return b;
  try {
    const input = { ...b.input, n1: b.input.n1?.toUpperCase(), n2: b.input.n2?.toUpperCase() };
    return NextResponse.json({ solution: lineToSolution(solve(input)) });
  } catch (e) {
    return fail((e as Error).message || 'Could not solve.');
  }
}
