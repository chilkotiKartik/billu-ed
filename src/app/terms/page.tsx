import Link from 'next/link';

export const metadata = { title: 'Terms · ED Cat' };

export default function Terms() {
  return (
    <main className="legal">
      <Link href="/">← Home</Link>
      <h1>Terms of use</h1>
      <p>ED Cat is a learning aid. Always check the steps against your textbook and your lecturer’s instructions before submitting a sheet.</p>
      <h2>Fair use</h2>
      <ul>
        <li>Use the app for your own studying. Do not try to overload or break it.</li>
        <li>Keep your account to yourself.</li>
      </ul>
      <h2>No warranty</h2>
      <p>We work hard to keep the drawings correct, but the app is provided as is. Report anything that looks wrong with the in-app button.</p>
    </main>
  );
}
