'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#F5F2EA', color: '#1B2340', display: 'grid', placeItems: 'center', minHeight: '100dvh', margin: 0, textAlign: 'center', padding: 24 }}>
        <div>
          <h1>Something went wrong</h1>
          <p>Your saved progress is safe. Please try again.</p>
          <button onClick={reset} style={{ padding: '12px 22px', borderRadius: 12, border: 0, background: '#1B2340', color: '#fff', fontSize: 16 }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
