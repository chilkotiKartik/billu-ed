import Link from 'next/link';
import { Cat } from '@/components/Cat';

export default function NotFound() {
  return (
    <main className="errpage">
      <Cat mood="think" size={110} level={2} />
      <h1 className="sm">Page not found</h1>
      <p>The cat looked everywhere but this page is not here.</p>
      <Link className="btn dark" href="/">Go home</Link>
    </main>
  );
}
