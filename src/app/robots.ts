import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: ['/', '/privacy', '/terms', '/sign-in', '/sign-up'], disallow: ['/app', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
