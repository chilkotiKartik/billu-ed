import Link from 'next/link';
import { SiteFooter, AUTHOR } from '@/components/SiteFooter';

export const metadata = { title: 'Copyright & credits · ED Cat', description: `ED Cat is designed and built by ${AUTHOR}.` };

export default function Copyright() {
  return (
    <>
      <main className="legal">
        <Link href="/">← Home</Link>
        <h1>Copyright &amp; credits</h1>
        <p className="credit">ED Cat is designed and built by <b>{AUTHOR}</b>.</p>

        <h2>Copyright</h2>
        <p>© 2026 {AUTHOR}. The ED Cat app, its design, the cat character, the animated lessons, the step-by-step explanations, the drawings and the source code are the work of the author and are protected by copyright. All rights reserved.</p>

        <h2>What you may do</h2>
        <ul>
          <li>Use the app for your own studies, for free.</li>
          <li>Download the PDF sheets and copy the drawings onto your own drawing sheets for class submission.</li>
          <li>Share the link <b>edrawing.me</b> with classmates and teachers.</li>
        </ul>

        <h2>What you may not do</h2>
        <ul>
          <li>Copy, re-publish or sell the app, its lessons, drawings or code, or present them as your own, without written permission from the author.</li>
          <li>Remove the credits or the ED Cat name from downloaded sheets that you share publicly.</li>
        </ul>

        <h2>Credits</h2>
        <ul>
          <li><b>Drawing conventions:</b> first-angle projection and line types follow BIS SP 46 (Engineering Drawing Practice for Schools and Colleges). Questions follow the first-year Engineering Drawing syllabus.</li>
          <li><b>Lecture videos:</b> belong to their creators on YouTube and play through YouTube&apos;s own player.</li>
          <li><b>Fonts:</b> IBM Plex Sans and IBM Plex Mono (SIL Open Font License).</li>
          <li><b>Built with:</b> Next.js, React, Clerk (sign-in), Supabase (database), Tesseract.js (on-device text reading) and jsPDF. Hosted on Vercel.</li>
        </ul>

        <h2>Contact</h2>
        <p>Questions, permission requests or a mistake in a drawing? Use the <b>“Spotted a mistake?”</b> button on any step inside the app, or contact {AUTHOR}.</p>
      </main>
      <SiteFooter />
    </>
  );
}
