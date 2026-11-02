export type Mood = 'idle' | 'happy' | 'think' | 'point';

/** Our mascot: Pixel the tabby. Pure SVG + CSS, so it is crisp on every phone and needs no download. */
export function Cat({ mood = 'idle', size = 96, level = 1 }: { mood?: Mood; size?: number; level?: number }) {
  const happy = mood === 'happy';
  return (
    <svg className={`cat cat-${mood}`} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Pixel the cat">
      <g className="cat-tail"><path d="M86 104c20 2 28-14 20-28" fill="none" stroke="#E58A22" strokeWidth="9" strokeLinecap="round" /><path d="M104 80c-1-3-1-6 0-8" fill="none" stroke="#7A4417" strokeWidth="9" strokeLinecap="round" /></g>
      <ellipse cx="60" cy="96" rx="31" ry="22" fill="#F4A340" />
      <ellipse cx="60" cy="102" rx="17" ry="14" fill="#FFE9C7" />
      <path d="M40 84l5 5M80 84l-5 5M60 78v6" stroke="#C9751B" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="46" cy="114" rx="9" ry="5.5" fill="#FFE9C7" stroke="#E58A22" strokeWidth="1.5" />
      <g className="cat-paw"><ellipse cx="76" cy="114" rx="9" ry="5.5" fill="#FFE9C7" stroke="#E58A22" strokeWidth="1.5" /></g>
      <polygon points="30,38 34,10 56,28" fill="#F4A340" /><polygon points="35,32 37,18 48,28" fill="#F7A8B8" />
      <g className="cat-ear"><polygon points="90,38 86,10 64,28" fill="#F4A340" /><polygon points="85,32 83,18 72,28" fill="#F7A8B8" /></g>
      <circle cx="60" cy="54" r="31" fill="#F4A340" />
      <path d="M52 27l2 9M60 25v10M68 27l-2 9" stroke="#C9751B" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="68" rx="17" ry="12" fill="#FFE9C7" />
      {happy ? (
        <g fill="none" stroke="#2B1B12" strokeWidth="3.2" strokeLinecap="round"><path d="M40 54q6-8 12 0" /><path d="M68 54q6-8 12 0" /></g>
      ) : (
        <g className="cat-eyes">
          <ellipse cx="46" cy="53" rx="6" ry="7.5" fill="#2B1B12" /><circle cx="48" cy={mood === 'think' ? 49 : 51} r="2.4" fill="#fff" />
          <ellipse cx="74" cy="53" rx="6" ry="7.5" fill="#2B1B12" /><circle cx="76" cy={mood === 'think' ? 49 : 51} r="2.4" fill="#fff" />
        </g>
      )}
      <ellipse cx="36" cy="66" rx="5" ry="3" fill="#F7A8B8" opacity=".7" /><ellipse cx="84" cy="66" rx="5" ry="3" fill="#F7A8B8" opacity=".7" />
      <path d="M56 63h8l-4 5z" fill="#E0607E" />
      <path d={happy ? 'M60 68q-8 11-15 2M60 68q8 11 15 2' : 'M60 68q-5 6-10 3M60 68q5 6 10 3'} fill="none" stroke="#2B1B12" strokeWidth="2.2" strokeLinecap="round" />
      {level >= 4 && <path d="M36 82Q60 94 84 82L84 90Q60 102 36 90Z" fill="#E0607E" stroke="#B83A5A" strokeWidth="1.2" />}
      {level >= 2 && <g fill="rgba(255,255,255,.35)" stroke="#2B1B12" strokeWidth="2"><circle cx="46" cy="53" r="9.5" /><circle cx="74" cy="53" r="9.5" /><path d="M55.5 52h9" fill="none" /></g>}
      {level >= 3 && level < 5 && <g><polygon points="28,28 60,13 92,28 60,40" fill="#2B2F45" /><rect x="46" y="32" width="28" height="8" fill="#3A3F5C" /><path d="M90 28l4 16" stroke="#F7C948" strokeWidth="2.5" /><circle cx="94" cy="45" r="3" fill="#F7C948" /></g>}
      {level >= 5 && <path d="M38 28L42 8l9 12 9-16 9 16 9-12 4 20Z" fill="#F7C948" stroke="#C9951B" strokeWidth="1.6" strokeLinejoin="round" />}
      <g stroke="#6B4A2B" strokeWidth="1.4" strokeLinecap="round"><path d="M22 62l16 2M22 70l16-1M98 62l-16 2M98 70l-16-1" /></g>
    </svg>
  );
}

/** Cat + speech bubble. Changing `k` replays the pop-in so the cat "says" each new thing. */
export function CatSays({ mood, k, children }: { mood: Mood; k: string | number; children: React.ReactNode }) {
  return (
    <div className="catrow">
      <div className="catbox"><Cat mood={mood} size={88} /></div>
      <div key={k} className="bubble">{children}</div>
    </div>
  );
}
