import Link from 'next/link';
import { Cat } from './Cat';

export const AUTHOR = 'Kartik Chilkoti';
const YEAR = 2026;

/** Footer used on the landing page and the legal pages. */
export function SiteFooter() {
  return (
    <footer className="sfoot">
      <div className="sfin">
        <div className="sbrand">
          <Link href="/" className="brand"><Cat size={42} level={3} /> ED Cat</Link>
          <p>Step-by-step Engineering Drawing lessons for first-year B.Tech students. First-angle projection, BIS SP 46 conventions.</p>
        </div>
        <nav className="scol" aria-label="App"><b>App</b><a href="/#features">Features</a><a href="/#how">How it works</a><a href="/#sheets">Sheets</a><Link href="/app">Open the app</Link></nav>
        <nav className="scol" aria-label="Legal"><b>Legal</b><Link href="/privacy">Privacy</Link><Link href="/terms">Terms of use</Link><Link href="/copyright">Copyright &amp; credits</Link></nav>
      </div>
      <div className="sbottom">
        <span>© {YEAR} {AUTHOR} · ED Cat. All rights reserved.</span>
        <span className="made">Made with <span aria-label="love" role="img">🧡</span> by <b>{AUTHOR}</b></span>
      </div>
    </footer>
  );
}
