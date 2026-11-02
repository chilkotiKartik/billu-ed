import './react-global';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'fs';
import { FullSheetSvg } from '../src/components/FullSheet';
import { pages } from '../src/lib/fullsheet';
pages().forEach((pg, i) => writeFileSync(`${process.argv[2]}/page${i}.svg`, renderToStaticMarkup(<FullSheetSvg page={pg} />).replace('width="420" height="297"', 'width="1260" height="891"')));
