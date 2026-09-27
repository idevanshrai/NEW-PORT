/** Tiny synthesised UI sounds (Web Audio) — no audio files needed. */
let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem('dr:play-sound') === 'off';
  } catch {
    return false;
  }
})();

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem('dr:play-sound', m ? 'off' : 'on');
  } catch {
    /* ignore */
  }
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'square', vol = 0.05) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + at);
  g.gain.setValueAtTime(vol, ctx.currentTime + at);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + at);
  o.stop(ctx.currentTime + at + dur + 0.02);
}

export function sfx(kind: 'click' | 'select' | 'open' | 'advance' | 'pop') {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    return;
  }
  if (kind === 'click') tone(520, 0, 0.05);
  if (kind === 'select') {
    tone(660, 0, 0.05);
    tone(880, 0.05, 0.07);
  }
  if (kind === 'open') tone(300, 0, 0.08, 'triangle', 0.08);
  if (kind === 'pop') tone(1200, 0, 0.04, 'triangle', 0.05);
  if (kind === 'advance') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.12, 'square', 0.045));
}
