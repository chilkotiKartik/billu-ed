'use client';
import { useEffect, useState } from 'react';

/** A looping, self-playing drawing: XY, projectors, then the two views of a line, with a pencil that follows every stroke. */
export default function HeroDemo() {
  const [k, setK] = useState(0);
  useEffect(() => { const id = setInterval(() => setK((x) => x + 1), 15000); return () => clearInterval(id); }, []);
  const L = (x1: number, y1: number, x2: number, y2: number, d: number, dur: number, extra = '') => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} className={`hd ${extra}`} style={{ strokeDasharray: len, strokeDashoffset: len, animationDelay: `${d}s`, animationDuration: `${dur}s` }} />;
  };
  return (
    <div className="herodemo" key={k}>
      <div className="hdbar"><span className="live">● Drawing live</span><span>A1 sheet · scale 1:1</span></div>
      <svg viewBox="0 0 400 300" role="img" aria-label="Animated drawing of a line and its projections">
        <defs><pattern id="hg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#EADFC4" strokeWidth=".8" /></pattern></defs>
        <rect width="400" height="300" fill="url(#hg)" />
        <g filter="url(#none)">
          {L(24, 150, 376, 150, 0.3, 1.8, 'xy')}
          {L(120, 36, 120, 268, 2.4, 1.2, 'pj')}
          {L(250, 36, 250, 268, 3.8, 1.2, 'pj')}
          {L(120, 76, 250, 104, 5.4, 1.6, 'ob')}
          {L(120, 214, 250, 214, 7.2, 1.2, 'ob')}
          {L(120, 76, 120, 150, 8.6, .8, 'dm')}
          <g className="hdfade" style={{ animationDelay: '9.2s' }}>
            <circle cx="120" cy="76" r="4" fill="#1B2340" /><circle cx="250" cy="104" r="4" fill="#1B2340" /><circle cx="120" cy="214" r="4" fill="#1B2340" /><circle cx="250" cy="214" r="4" fill="#1B2340" />
            <text x="96" y="74" className="hl">a′</text><text x="258" y="102" className="hl">b′</text><text x="96" y="222" className="hl">a</text><text x="258" y="222" className="hl">b</text>
            <text x="22" y="140" className="hx">X</text><text x="364" y="140" className="hx">Y</text>
            <rect x="152" y="62" width="76" height="22" rx="11" fill="#C2410C" /><text x="190" y="77" textAnchor="middle" className="hp">TL = 134 mm</text>
            <rect x="140" y="226" width="90" height="22" rx="11" fill="#0B7A75" /><text x="185" y="241" textAnchor="middle" className="hp">FV = 130 mm</text>
          </g>
        </g>
        <g className="hdpencil"><g transform="rotate(35)"><polygon points="0,0 -5,-15 5,-15" fill="#F3D3A0" /><polygon points="0,0 -1.8,-5 1.8,-5" fill="#2B1B12" /><rect x="-5" y="-54" width="10" height="39" fill="#F4A340" /><rect x="-5" y="-60" width="10" height="6" fill="#C9CED8" /><rect x="-5" y="-67" width="10" height="7" rx="2" fill="#E0607E" /></g></g>
      </svg>
      <div className="hdcap"><b>Step by step.</b> Every line is drawn for you, with lengths, pencils and the reason why.</div>
    </div>
  );
}
