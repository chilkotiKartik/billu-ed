/** Public address of the app (used for link previews, sitemap and robots). Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edrawing.me').replace(/\/$/, '');
