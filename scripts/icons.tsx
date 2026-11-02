import './react-global';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'fs';
import { Cat } from '../src/components/Cat';
const svg = renderToStaticMarkup(<Cat mood="idle" size={400} />).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" x="56" y="50" ');
writeFileSync(process.argv[2], `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#FFE9C7"/>${svg}</svg>`);
