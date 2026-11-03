import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata = { title: 'Privacy · ED Cat' };

export default function Privacy() {
  return (
    <>
    <main className="legal">
      <Link href="/">← Home</Link>
      <h1>Privacy</h1>
      <p>ED Cat is a study helper for Engineering Drawing students. We keep only what the app needs to work.</p>
      <h2>What we store</h2>
      <ul>
        <li><b>Account:</b> sign-in is handled by Clerk (email or Google). We only see your user id.</li>
        <li><b>Your study data:</b> finished questions, XP, streak, the name and roll number you type for the sheet title block, and sheets you choose to save.</li>
        <li><b>Feedback:</b> messages you send with the “Spotted a mistake” button.</li>
      </ul>
      <h2>What leaves your phone</h2>
      <ul>
        <li>Photos are read on your device with OCR. A small copy is sent to Google Gemini only if the on-device reader could not find every number and the feature is switched on.</li>
        <li>Video lectures play from YouTube (privacy-enhanced mode).</li>
        <li>Anonymous page-speed and visit counts (Vercel Analytics, no cookies, no personal data).</li>
        <li>The leaderboard is off unless you switch it on; it shows only the nickname you choose and your XP.</li>
      </ul>
      <h2>Your control</h2>
      <p>You can delete any saved sheet inside the app. In <b>Trophies → My data</b> you can download everything we keep about you, or delete your account and all your data for good.</p>
      <p>We do not sell data or show ads.</p>
    </main>
    <SiteFooter />
    </>
  );
}
