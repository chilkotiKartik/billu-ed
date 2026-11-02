import type { LineInput } from './types';

// Gemini is used ONLY to read a question into numbers. It never solves or draws anything.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const PROMPT = `You read first-year Engineering Drawing questions about the projection of ONE straight line (first angle).
Extract only the values that are stated. Do NOT solve anything. Use null when a value is not stated.
Fields: L = true length in mm; theta = inclination of the line with the HP in degrees; phi = inclination with the VP in degrees;
ha = distance of end A above the HP in mm; da = distance of end A in front of the VP in mm; n1, n2 = the two letters naming the line (e.g. A and B).
Rules: "parallel to the HP" means theta = 0. "parallel to the VP" means phi = 0. "in the HP" or "on the HP" means ha = 0. "in the VP" or "on the VP" means da = 0.
The text may contain OCR errors (e.g. "rnm" for "mm", a degree sign read as 0 or o); use common sense to correct them.`;

export const GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    L: { type: 'NUMBER', nullable: true },
    theta: { type: 'NUMBER', nullable: true },
    phi: { type: 'NUMBER', nullable: true },
    ha: { type: 'NUMBER', nullable: true },
    da: { type: 'NUMBER', nullable: true },
    n1: { type: 'STRING', nullable: true },
    n2: { type: 'STRING', nullable: true },
  },
};

/** Keeps only sane values from whatever the model returned. */
export function cleanAI(raw: unknown): Partial<LineInput> {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: Partial<LineInput> = {};
  for (const k of ['L', 'theta', 'phi', 'ha', 'da'] as const) {
    const v = o[k];
    if (typeof v === 'number' && isFinite(v) && v >= 0 && v <= 400) out[k] = v;
  }
  for (const k of ['n1', 'n2'] as const) {
    const v = o[k];
    if (typeof v === 'string' && /^[A-Za-z]$/.test(v.trim())) out[k] = v.trim().toUpperCase();
  }
  return out;
}

export const geminiEnabled = () => !!process.env.GEMINI_API_KEY;

export async function askGemini(text: string, image?: string): Promise<Partial<LineInput>> {
  const parts: unknown[] = [{ text: PROMPT + (text ? `\n\nQuestion text:\n${text}` : '') }];
  const m = image?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: GEMINI_SCHEMA, temperature: 0 },
    }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  const j = await r.json();
  const t = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  return cleanAI(JSON.parse(t));
}
