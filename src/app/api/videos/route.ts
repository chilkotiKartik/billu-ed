import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export interface YtItem { id: string; title: string; channel: string; thumb: string; secs: number; views: number }

// One YouTube search costs 100 of the 10,000 free daily quota units, so every answer is kept for 7 days.
const cache = new Map<string, { t: number; items: YtItem[] }>();
const hits = new Map<string, number[]>();
const TTL = 7 * 24 * 3600 * 1000;

const secs = (iso: string) => { const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso) || []; return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + +(m[3] || 0); };

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 160);
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ items: [], reason: 'no-key' });

  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 30) return NextResponse.json({ error: 'Too many requests, try again in a minute.' }, { status: 429 });
  hits.set(userId, [...recent, now]);

  const ck = q.toLowerCase();
  const c = cache.get(ck);
  if (c && now - c.t < TTL) return NextResponse.json({ items: c.items, cached: true }, { headers: { 'Cache-Control': 'private, max-age=3600' } });

  try {
    const sp = new URLSearchParams({ part: 'snippet', type: 'video', maxResults: '10', q, videoEmbeddable: 'true', safeSearch: 'strict', relevanceLanguage: 'en', key });
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${sp}`);
    const j = await r.json();
    if (!r.ok) return NextResponse.json({ items: [], reason: j?.error?.errors?.[0]?.reason || 'youtube-error' });
    const ids: string[] = (j.items || []).map((x: { id: { videoId: string } }) => x.id.videoId).filter(Boolean);
    const dr = await fetch(`https://www.googleapis.com/youtube/v3/videos?${new URLSearchParams({ part: 'contentDetails,statistics,status', id: ids.join(','), key })}`);
    const dj = await dr.json();
    const items: YtItem[] = (dj.items || [])
      .filter((v: { status?: { embeddable?: boolean } }) => v.status?.embeddable !== false)
      .map((v: { id: string; snippet?: unknown; contentDetails: { duration: string }; statistics?: { viewCount?: string } }) => {
        const s = (j.items as { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { medium?: { url: string } } } }[]).find((x) => x.id.videoId === v.id)?.snippet;
        return { id: v.id, title: s?.title || '', channel: s?.channelTitle || '', thumb: s?.thumbnails.medium?.url || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`, secs: secs(v.contentDetails.duration), views: +(v.statistics?.viewCount || 0) };
      })
      .filter((v: YtItem) => v.secs >= 120 && v.secs <= 3600)   // lectures, not shorts or very long streams
      .slice(0, 4);
    cache.set(ck, { t: now, items });
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'private, max-age=3600' } });
  } catch {
    return NextResponse.json({ items: [], reason: 'network' });
  }
}
