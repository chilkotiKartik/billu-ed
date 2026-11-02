import Link from 'next/link';
import { Cat } from './Cat';

export function AuthShell({ mode, children }: { mode: 'in' | 'up'; children: React.ReactNode }) {
  return (
    <main className="auth">
      <aside className="authL">
        <Link href="/" className="brand lbrand"><Cat size={44} /> ED Cat</Link>
        <div className="authcat"><Cat mood="happy" size={190} level={3} /></div>
        <h2>{mode === 'up' ? 'Join the class cat 🐾' : 'Welcome back!'}</h2>
        <ul>
          <li>✏️ Live pencil, ruler and compass lessons</li>
          <li>📐 All 18 sheet questions, solved step by step</li>
          <li>🏆 XP, levels and badges as you learn</li>
          <li>📄 Download your finished sheet as a PDF</li>
        </ul>
      </aside>
      <section className="authR">
        <Link href="/" className="authback">← Home</Link>
        {children}
      </section>
    </main>
  );
}
