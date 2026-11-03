'use client';
import { useEffect } from 'react';
import { Cat } from '@/components/Cat';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="errpage" role="alert">
      <Cat mood="think" size={110} level={2} />
      <h1 className="sm">Oops, the cat tripped on a wire</h1>
      <p>Something went wrong on this screen. Your progress is safe.</p>
      <button className="btn dark" onClick={reset}>Try again</button>
      <a className="btn ghost" href="/app">Back to my sheets</a>
    </main>
  );
}
