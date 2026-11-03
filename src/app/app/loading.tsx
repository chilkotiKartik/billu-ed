import { Cat } from '@/components/Cat';

export default function Loading() {
  return (
    <main className="errpage" aria-busy="true" aria-live="polite">
      <Cat mood="idle" size={90} level={1} />
      <p>Sharpening pencils…</p>
    </main>
  );
}
