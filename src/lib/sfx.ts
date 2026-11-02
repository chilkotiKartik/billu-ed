let ctx: AudioContext | null = null;
export const isMuted = () => { try { return localStorage.getItem('edcat.mute') === '1'; } catch { return false; } };
export const setMuted = (m: boolean) => { try { localStorage.setItem('edcat.mute', m ? '1' : '0'); } catch { /* ignore */ } };

function tone(f: number, t0: number, d: number, type: OscillatorType = 'sine', vol = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, ctx.currentTime + t0);
  g.gain.setValueAtTime(0.0001, ctx.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + d);
  o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + d + 0.05);
}

/** Small synthesised sounds: no files to download. */
export function sfx(kind: 'pop' | 'win' | 'bad' | 'meow') {
  if (isMuted() || typeof window === 'undefined') return;
  try {
    ctx = ctx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    if (kind === 'pop') tone(660, 0, 0.1, 'triangle');
    if (kind === 'bad') { tone(220, 0, 0.18, 'sawtooth', 0.08); tone(180, 0.15, 0.22, 'sawtooth', 0.08); }
    if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle'));
    if (kind === 'meow') { tone(700, 0, 0.12, 'triangle', 0.1); tone(520, 0.1, 0.22, 'triangle', 0.1); }
  } catch { /* audio not available */ }
}
