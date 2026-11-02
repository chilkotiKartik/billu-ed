import './react-global';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'fs';
import { Prims, DrawingSvg } from '../src/components/Prims';
import { sheetLayout } from '../src/lib/sheet';
import { ALL } from '../src/lib/catalog';
const out = process.argv[2];
for (const id of ['s1','s2-1-q1','s2-1-q7','s3-q6','s3-q2','s3-C2','s2-2-B1']) {
  const sol = ALL.find((q) => q.id === id)!.build();
  const lay = sheetLayout(sol);
  const map = (x: number, y: number): [number, number] => [lay.ox + x * lay.s, lay.oy - y * lay.s];
  const sheet = renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" width="1260" height="891"><rect width="420" height="297" fill="#fff"/><Prims items={sol.final} map={map} u={0.26} fs={3.6} dz={1} /></svg>);
  writeFileSync(`${out}/${id}-sheet.svg`, sheet);
  const mid = Math.min(Number(process.env.STEP ?? 3), sol.steps.length - 1);
  writeFileSync(`${out}/${id}-step.svg`, renderToStaticMarkup(<div style={{width:342}}><DrawingSvg sol={sol} upto={mid} /></div>).replace('<div style="width:342px">','').replace(/<\/div>$/,'').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="684" height="600" style="background:#fff" '));
}
