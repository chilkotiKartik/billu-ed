export interface LineInput {
  L: number; // true length, mm
  theta: number; // inclination with HP, degrees
  phi: number; // inclination with VP, degrees
  ha: number; // end A above HP, mm
  da: number; // end A in front of VP, mm
  n1?: string; // name of end 1 (default A)
  n2?: string; // name of end 2 (default B)
}

export type Kind = 'hp' | 'vp' | 'both';

// thin = construction/reference, fine = BIS type B (thin continuous), thick = type A (outline)
// hidden = type E/F, centre = type G, locus = type K, dash/proj = construction helpers
export type LineStyle = 'thin' | 'thick' | 'dash' | 'proj' | 'fine' | 'hidden' | 'centre' | 'locus';

// All coordinates are in mm. Origin is on XY. y is UP (front view above XY).
export type Prim =
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; w: LineStyle; f?: boolean }
  | { t: 'pt'; x: number; y: number; label: string; dx?: number; dy?: number }
  | { t: 'arc'; cx: number; cy: number; r: number; a0: number; a1: number; w?: LineStyle }
  | { t: 'circle'; cx: number; cy: number; r: number; w?: LineStyle }
  | { t: 'arrow'; x1: number; y1: number; x2: number; y2: number; n?: boolean }
  | { t: 'text'; x: number; y: number; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; n?: boolean; mm?: number } // mm: real letter height, scales with the drawing
  | { t: 'dim'; x1: number; y1: number; x2: number; y2: number; label: string; off?: number };

export interface Step {
  title: string;
  tool: string;
  why: string;
  calc?: string;
  prims: Prim[];
}

/** What every question produces; the UI only knows this shape. */
export interface Solution {
  id: string;
  title: string;
  steps: Step[];
  final: Prim[];
  results: { label: string; value: string }[];
  header: string[]; // up to 3 lines for the A3 title block
  mistakes: { title: string; body: string }[];
  plan?: string[]; // "how we crack the question"
  lineInput?: LineInput; // set for custom line questions (can be saved)
}

/** Raw result of the line solver. */
export interface LineSolution {
  input: LineInput;
  kind: Kind;
  n1: string;
  n2: string;
  xyLen: number;
  aF: [number, number];
  bF: [number, number];
  aT: [number, number];
  bT: [number, number];
  L: number;
  Lf: number;
  Lt: number;
  h: number;
  d: number;
  dx: number;
  steps: Step[];
  final: Prim[];
}
