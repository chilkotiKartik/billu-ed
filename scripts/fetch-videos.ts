// One-time: pick the best lecture videos for every question and save them, so students never use your API quota.
//   YOUTUBE_API_KEY=xxx npx tsx scripts/fetch-videos.ts
import { writeFileSync } from 'node:fs';
import { ALL } from '../src/lib/catalog';
import { questionVideos } from '../src/lib/videos';

const key = process.env.YOUTUBE_API_KEY;
if (!key) { console.error('Set YOUTUBE_API_KEY first.'); process.exit(1); }
const out: Record<string, { id: string; title: string; channel: string }[]> = {};
(async () => {
  for (const q of ALL) {
    const query = questionVideos(q)[0].query;
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${new URLSearchParams({ part: 'snippet', type: 'video', maxResults: '3', q: query, videoEmbeddable: 'true', safeSearch: 'strict', key })}`);
    const j = await r.json();
    out[q.id] = (j.items || []).map((x: { id: { videoId: string }; snippet: { title: string; channelTitle: string } }) => ({ id: x.id.videoId, title: x.snippet.title, channel: x.snippet.channelTitle }));
    console.log(q.id, out[q.id].length, 'videos');
  }
  writeFileSync('src/lib/pinned.json', JSON.stringify(out, null, 2));
  console.log('Saved src/lib/pinned.json. Open it and delete any video you do not like.');
})();
