import { Prims } from './Prims';
import { TitleBlock, TB_W, TB_H, drawingNoOf } from './TitleBlock';
import { layoutPage, PAPER, scaleLabel, type Page, type Paper } from '@/lib/fullsheet';

const INK = '#1B2340';

/** A real-looking A3 sheet: margins, every question labelled and drawn to one scale, and a title block. */
export function FullSheetSvg({ page, svgRef, name = '', roll = '', institution = '', paper = 'A3' }: { paper?: Paper; page: Page; svgRef?: React.RefObject<SVGSVGElement | null>; name?: string; roll?: string; institution?: string }) {
  const { placed, scale } = layoutPage(page, paper);
  const [W, H] = PAPER[paper], k = W / 420, tb = W / 420; // tb: title block grows with the paper
  const sc = scaleLabel(scale);
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ width: '100%', height: 'auto', display: 'block', background: '#fff' }} fontFamily="Arial, sans-serif" role="img" aria-label={`${page.title}, ${page.part}`}>
      <rect width={W} height={H} fill="#fff" />
      <rect x="20" y="10" width={W - 30} height={H - 20} fill="none" stroke={INK} strokeWidth={0.8 * k} />
      <TitleBlock x={W - 10 - TB_W * tb} y={H - 10 - TB_H * tb} k={tb} info={{ institution, drawingNo: drawingNoOf(page.sheetId), title: `${page.title.replace(' · ', ': ')} — ${page.part}`, scale: sc, name, roll }} />
      {placed.map((p, i) => {
        const w = p.bb.w * p.s, h = p.bb.h * p.s;
        const x0 = p.x + (p.w - w) / 2, y0 = p.y + 12 * k + (p.h - 18 * k - h) / 2;
        const map = (x: number, y: number): [number, number] => [x0 + (x - p.bb.minx) * p.s, y0 + (p.bb.maxy - y) * p.s];
        return (
          <g key={i}>
            <text x={p.x + 2} y={p.y + 7 * k} fontSize={6 * k} fontWeight="700" fill={INK}>{p.q.code}</text>
            <text x={p.x + 2 + (p.q.code.length * 4 + 4) * k} y={p.y + 7 * k} fontSize={4.6 * k} fill="#4B5167">{p.q.title}</text>
            <Prims items={p.sol.final} map={map} u={0.32 * k} fs={4.4 * k} dz={1} />
          </g>
        );
      })}
    </svg>
  );
}
