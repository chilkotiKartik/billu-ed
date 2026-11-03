'use client';
import { useEffect, useState } from 'react';
import { questionVideos, ytUrl } from '@/lib/videos';
import pinned from '@/lib/pinned.json';

interface Item { id: string; title: string; channel: string; thumb: string; secs?: number; views?: number }
interface Q { id?: string; code: string; title: string; statement: string; topic: string }

const mins = (s?: number) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '');
const cache: Record<string, Item[]> = {};

async function search(query: string): Promise<{ items: Item[]; reason?: string }> {
  if (cache[query]) return { items: cache[query] };
  try {
    const r = await fetch(`/api/videos?q=${encodeURIComponent(query)}`);
    const j = await r.json();
    if (j.items?.length) cache[query] = j.items;
    return { items: j.items || [], reason: j.reason };
  } catch { return { items: [], reason: 'network' }; }
}

/** Lecture videos for THIS question: pinned picks first, then live YouTube search (needs YOUTUBE_API_KEY), then plain search links. */
export function YtCard({ q }: { q: Q }) {
  const links = questionVideos(q);
  const pins: Item[] = ((pinned as Record<string, { id: string; title: string; channel: string }[]>)[q.id || ''] || (pinned as Record<string, { id: string; title: string; channel: string }[]>)[q.topic] || []).map((p) => ({ ...p, thumb: `https://i.ytimg.com/vi/${p.id}/mqdefault.jpg` }));
  const [tab, setTab] = useState<'q' | 'topic'>('q');
  const [items, setItems] = useState<Item[]>(pins);
  const [state, setState] = useState<'load' | 'ok' | 'none'>(pins.length ? 'ok' : 'load');
  const [playing, setPlaying] = useState<Item | null>(null);

  useEffect(() => {
    let live = true; setPlaying(null);
    if (tab === 'q' && pins.length) { setItems(pins); setState('ok'); return; }
    setState('load');
    const query = tab === 'q' ? links[0].query : (links[2]?.query ?? links[1].query);
    search(`${query} lecture`).then((r) => { if (!live) return; setItems(r.items); setState(r.items.length ? 'ok' : 'none'); });
    return () => { live = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, q.statement, tab]);

  const searchLink = tab === 'q' ? links[0] : (links[2] ?? links[1]);
  return (
    <div className="card ytcard">
      <h3>▶ Lecture videos</h3>
      <div className="tabs ytabs"><button className={tab === 'q' ? 'on' : ''} onClick={() => setTab('q')}>This question</button><button className={tab === 'topic' ? 'on' : ''} onClick={() => setTab('topic')}>Topic lecture</button></div>

      {playing && (
        <div className="ytplayer">
          <div className="vwrap"><iframe title={playing.title} src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0&modestbranding=1`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
          <div className="ytnow"><b>{playing.title}</b><span>{playing.channel}</span><a className="btn ghost" href={`https://www.youtube.com/watch?v=${playing.id}`} target="_blank" rel="noreferrer">Open in YouTube ↗</a><button className="btn ghost" onClick={() => setPlaying(null)}>✕ Close video</button></div>
        </div>
      )}

      {state === 'load' && <div className="ytskel"><i /><i /><i /></div>}
      {state === 'ok' && (
        <div className="ytlist">
          {items.slice(0, 4).map((v) => (
            <button key={v.id} className={`ytitem ${playing?.id === v.id ? 'now' : ''}`} onClick={() => setPlaying(v)}>
              <span className="ytthumb"><img src={v.thumb} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} /><span className="ytplay2">▶</span>{v.secs ? <em>{mins(v.secs)}</em> : null}</span>
              <span className="yttxt"><b>{v.title || 'Lecture video'}</b><small>{v.channel}{v.views ? ` · ${v.views >= 1000 ? Math.round(v.views / 1000) + 'K' : v.views} views` : ''}</small></span>
            </button>
          ))}
        </div>
      )}
      {state === 'none' && (
        <div className="ytfallback">
          <p className="small">Lecture videos will play right here once the YouTube key is added. For now, open the search on YouTube:</p>
          <a href={ytUrl(searchLink)} target="_blank" rel="noreferrer" className="ytitem"><span className="ytplay">▶</span><span className="yttxt"><b>{searchLink.label}</b><small>Opens YouTube · {searchLink.query.slice(0, 70)}…</small></span></a>
        </div>
      )}
      {state === 'ok' && <a className="ytmore" href={ytUrl(searchLink)} target="_blank" rel="noreferrer">See more on YouTube ↗</a>}
    </div>
  );
}
