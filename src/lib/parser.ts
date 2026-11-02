import type { LineInput } from './types';

export interface Parsed {
  input: Partial<LineInput>;
  missing: string[];
}

const NUM = '(\\d+(?:\\.\\d+)?)';

/** Rule-based reader for "projection of lines" questions. No AI: plain regex over OCR or typed text. */
export function parseQuestion(raw: string): Parsed {
  const nm = raw.match(/line\s+([A-Z])\s?([A-Z])\b/);
  const s = raw
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/h\s?\.\s?p\.?/g, 'hp')
    .replace(/v\s?\.\s?p\.?/g, 'vp')
    .replace(/horizontal plane/g, 'hp')
    .replace(/vertical plane/g, 'vp')
    .replace(/[º˚]/g, '°')
    .replace(/\b(rnm|mrn)\b/g, 'mm')
    .replace(/(\d)\s*m\s*m\b/g, '$1 mm');

  const out: Partial<LineInput> = {};
  if (nm) { out.n1 = nm[1]; out.n2 = nm[2]; }

  // angles: "<n>° to (the) HP|VP"
  const angRe = new RegExp(NUM + '\\s*(?:°|degrees?|deg|o|\\*)?\\s*(?:to|with)\\s*(?:the\\s*)?(hp|vp)\\b', 'g');
  for (const m of s.matchAll(angRe)) {
    if (m[2] === 'hp') out.theta = parseFloat(m[1]);
    else out.phi = parseFloat(m[1]);
  }
  for (const m of s.matchAll(/parallel to (?:the )?(hp|vp)/g)) {
    if (m[1] === 'hp') out.theta = 0;
    else out.phi = 0;
  }

  // length
  const longM = s.match(new RegExp(NUM + '\\s*mm\\s*long'));
  if (longM) out.L = parseFloat(longM[1]);
  else {
    const all = [...s.matchAll(new RegExp(NUM + '\\s*mm\\b(?!\\s*(?:above|from|over|in front|infront|before|high|away|behind|below))', 'g'))];
    if (all.length) out.L = parseFloat(all[0][1]);
  }

  // end A position
  const haM = s.match(new RegExp(NUM + '\\s*mm\\s*(?:high\\s*)?(?:above|from|over)(?: of)? (?:the )?hp'));
  if (haM) out.ha = parseFloat(haM[1]);
  else if (/\b(?:in|on)\s+(?:the\s+)?hp\b/.test(s)) out.ha = 0;
  const daM = s.match(new RegExp(NUM + '\\s*mm\\s*(?:in front of|infront of|before|from)(?: of)? (?:the )?vp'));
  if (daM) out.da = parseFloat(daM[1]);
  else if (/\b(?:in|on)\s+(?:the\s+)?vp\b/.test(s)) out.da = 0;

  const missing: string[] = [];
  if (out.L === undefined) missing.push('length');
  if (out.theta === undefined) missing.push('angle with HP');
  if (out.phi === undefined) missing.push('angle with VP');
  if (out.ha === undefined) missing.push('height above HP');
  if (out.da === undefined) missing.push('distance in front of VP');
  return { input: out, missing };
}
