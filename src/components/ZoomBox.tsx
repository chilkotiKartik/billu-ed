'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Shows a whole drawing sheet. On phones a full A1/A3 sheet squeezed to 390 px makes every diagram tiny,
 * so it opens zoomed in (medium-large) and scrolls; − / + / Fit change the zoom. The SVG stays vector, so it is sharp at any zoom.
 */
export function ZoomBox({ children, phoneZoom = 2.2, focus = [0.5, 0.45], label = 'sheet' }: { children: React.ReactNode; phoneZoom?: number; focus?: [number, number]; label?: string }) {
  const [z, setZ] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  // phones open zoomed in, centred on the drawing (focus = where the drawings are, as a fraction of the sheet)
  const pending = useRef<[number, number] | null>(null);
  useEffect(() => { if (window.innerWidth < 700) { pending.current = focus; setZ(phoneZoom); } }, [phoneZoom]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const el = box.current, f = pending.current;
    if (!el || !f) return;
    pending.current = null;
    el.scrollLeft = f[0] * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = f[1] * el.scrollHeight - el.clientHeight / 2;
  }, [z]);
  const zoomTo = (n: number) => {
    const el = box.current; const nz = Math.min(5, Math.max(1, Math.round(n * 10) / 10));
    if (!el) { setZ(nz); return; }
    const cx = (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth, cy = (el.scrollTop + el.clientHeight / 2) / el.scrollHeight;
    setZ(nz);
    requestAnimationFrame(() => { el.scrollLeft = cx * el.scrollWidth - el.clientWidth / 2; el.scrollTop = cy * el.scrollHeight - el.clientHeight / 2; });
  };
  return (
    <div className="zoombox">
      <div className="zbar" role="toolbar" aria-label={`Zoom ${label}`}>
        <button onClick={() => zoomTo(z - 0.5)} disabled={z <= 1} aria-label="Zoom out">−</button>
        <span>{z === 1 ? 'Whole sheet' : `${Math.round(z * 100)}%`}</span>
        <button onClick={() => zoomTo(z + 0.5)} disabled={z >= 5} aria-label="Zoom in">+</button>
        <button className="fit" onClick={() => zoomTo(z === 1 ? phoneZoom : 1)}>{z === 1 ? '🔍 Zoom in' : 'Fit'}</button>
      </div>
      <div className="zscroll" ref={box} style={{ maxHeight: z > 1 ? '70vh' : undefined }}>
        <div style={{ width: `${z * 100}%` }}>{children}</div>
      </div>
    </div>
  );
}
