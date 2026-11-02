'use client';
import { useMemo, useState } from 'react';
import type { Solution } from '@/lib/types';
import { makeQuiz } from '@/lib/quiz';
import { CatSays } from './Cat';
import { sfx } from '@/lib/sfx';

export function Quiz({ sol, award }: { sol: Solution; award: (xp: number, why: string, kind: 'quiz') => void }) {
  const qs = useMemo(() => makeQuiz(sol), [sol]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [ok, setOk] = useState(0);
  if (!qs.length) return null;
  if (i >= qs.length) {
    return <div className="card info quizc"><CatSays mood={ok === qs.length ? 'happy' : 'point'} k="qd">Quiz done: {ok} of {qs.length} right. {ok === qs.length ? 'Perfect! 🏆' : 'Read the answers once more and try the lesson again.'}</CatSays></div>;
  }
  const q = qs[i];
  return (
    <div className="card info quizc">
      <h3>🎓 Cat quiz {i + 1}/{qs.length}</h3>
      <p className="qp">{q.prompt}</p>
      <div className="opts">
        {q.options.map((o, k) => (
          <button key={k} disabled={pick !== null} className={`opt ${pick === null ? '' : k === q.answer ? 'good' : k === pick ? 'bad' : ''}`}
            onClick={() => { setPick(k); if (k === q.answer) { setOk(ok + 1); sfx('win'); award(10, 'Quiz', 'quiz'); } else sfx('bad'); }}>{o}</button>
        ))}
      </div>
      {pick !== null && (
        <>
          <p className="qwhy">{pick === q.answer ? '✅ Right! +10 XP. ' : '❌ Not quite. '}{q.why}</p>
          <button className="btn primary full" onClick={() => { setI(i + 1); setPick(null); }}>{i + 1 < qs.length ? 'Next question →' : 'See result'}</button>
        </>
      )}
    </div>
  );
}
