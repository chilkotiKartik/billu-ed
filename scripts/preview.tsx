import './react-global';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync, readFileSync } from 'fs';
import { CatSays } from '../src/components/Cat';
import { DrawingSvg } from '../src/components/Prims';
import { added } from '../src/lib/explain';
import { ALL } from '../src/lib/catalog';
const sol = ALL.find((q) => q.id === 's3-q2')!.build();
const st = sol.steps[2];
const html = renderToStaticMarkup(<div className="app"><main className="body">
  <div className="card draw"><DrawingSvg sol={sol} upto={2} /></div>
  <CatSays mood="point" k="x"><b>Look closely. </b>{st.why}</CatSays>
  <div className="card"><h3 className="st">{st.title}</h3></div>
  <div className="card info"><h3>🐾 What I added</h3><ul className="added">{added(st.prims).map((x, i) => <li key={i}><span>{x.what}</span>{x.len && <b>{x.len}</b>}</li>)}</ul></div>
  <div className="card info calcbox"><h3>🧮 Length / calculation</h3><div className="calcline">{st.calc}</div></div>
</main></div>);
writeFileSync(process.argv[2], `<style>${readFileSync('src/app/globals.css','utf8')}</style>${html}`);
