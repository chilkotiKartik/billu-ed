import { Prims } from './Prims';
import { layoutPage, PAPER, type Page, type Paper } from '@/lib/fullsheet';

const INK = '#1B2340';

/** A real-looking A3 sheet: margins, every question labelled and drawn to one scale, and a title block. */
export function FullSheetSvg({ page, svgRef, name = '', roll = '', paper = 'A3' }: { paper?: Paper; page: Page; svgRef?: React.RefObject<SVGSVGElement>; name?: string; roll?: string }) {
  const { placed, scale } = layoutPage(page, paper);
  const [W, H] = PAPER[paper], k = paper === 'A1' ? 1.6 : 1;
  const sc = scale === 1 ? '1 : 1' : `1 : ${+(1 / scale).toFixed(2)}`;
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ width: '100%', height: 'auto', display: 'block', background: '#fff' }} fontFamily="Arial, sans-serif" role="img" aria-label={`${page.title}, ${page.part}`}>
      <rect width={W} height={H} fill="#fff" />
      <rect x="20" y="10" width={W - 30} height={H - 20} fill="none" stroke={INK} strokeWidth={0.8 * k} />
      <g transform={`translate(${W - 420},${H - 297})`}>
      <g stroke={INK} strokeWidth="0.4" fill="none">
        <rect x="190" y="257" width="220" height="30" />
        <line x1="190" y1="267" x2="410" y2="267" /><line x1="190" y1="277" x2="410" y2="277" />
        <line x1="300" y1="257" x2="300" y2="287" /><line x1="355" y1="257" x2="355" y2="287" />
      </g>
      <g fill={INK} fontSize="3.2">
        <text x="192" y="263" fontWeight="700">{page.title.toUpperCase()} · {paper}</text>
        <text x="192" y="273">{page.part}</text>
        <text x="192" y="283">NAME: {name}</text>
        <text x="302" y="263">SCALE  {sc}</text>
        <text x="302" y="273">FIRST ANGLE</text>
        <text x="302" y="283">ROLL NO: {roll}</text>
        <text x="357" y="263">DIMS IN mm</text>
        <text x="357" y="273">DATE:</text>
        <text x="357" y="283">SIGN:</text>
      </g></g>
      {placed.map((p, i) => {
        const w = p.bb.w * p.s, h = p.bb.h * p.s;
        const x0 = p.x + (p.w - w) / 2, y0 = p.y + 12 + (p.h - 18 - h) / 2;
        const map = (x: number, y: number): [number, number] => [x0 + (x - p.bb.minx) * p.s, y0 + (p.bb.maxy - y) * p.s];
        return (
          <g key={i}>
            <text x={p.x + 2} y={p.y + 6 * k} fontSize={4.2 * k} fontWeight="700" fill={INK}>{p.q.code}</text>
            <text x={p.x + 2 + (p.q.code.length * 2.8 + 3) * k} y={p.y + 6 * k} fontSize={3.2 * k} fill="#4B5167">{p.q.title}</text>
            <Prims items={p.sol.final} map={map} u={0.26 * k} fs={3.4 * k} dz={1} />
          </g>
        );
      })}
    </svg>
  );
}
