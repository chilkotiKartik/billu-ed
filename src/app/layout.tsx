import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import SW from '@/components/SW';
import './globals.css';

export const metadata: Metadata = {
  title: 'ED Cat',
  description: 'Step-by-step help for Engineering Drawing sheets',
  applicationName: 'ED Cat',
  openGraph: { title: 'ED Cat', description: 'Step-by-step help for Engineering Drawing sheets', type: 'website' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'ED Cat', statusBarStyle: 'default' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
};

export const viewport: Viewport = { themeColor: '#1B2340', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" />
        </head>
        <body suppressHydrationWarning>
          {children}
          <SW />
        </body>
      </html>
    </ClerkProvider>
  );
}
