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

/** a short filtered noise burst — footsteps and breaking blocks */
function noise(at: number, dur: number, freq: number, vol: number) {
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(ctx.currentTime + at);
}

/** Waterfall rush: one looping noise source, its volume set by how close you are (0..1). */
let water: { gain: GainNode; src: AudioBufferSourceNode; nodes: AudioNode[] } | null = null;

/** Stop and release the waterfall loop (leaving play mode). */
export function stopWater() {
  if (!water) return;
  try {
    water.src.stop();
  } catch {
    /* already stopped */
  }
  water.nodes.forEach((n) => n.disconnect());
  water = null;
}

export function setWaterLevel(level: number) {
  if (!ctx || ctx.state !== 'running') return; // only after a click/key has started audio
  if (!water) {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(f).connect(gain).connect(ctx.destination);
    src.start();
    water = { gain, src, nodes: [src, f, gain] };
  }
  water.gain.gain.setTargetAtTime(muted ? 0 : level * 0.09, ctx.currentTime, 0.3);
}

export function sfx(kind: 'click' | 'select' | 'open' | 'advance' | 'pop' | 'step' | 'break' | 'page' | 'hit') {
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
  if (kind === 'page') noise(0, 0.16, 2600, 0.12);
  if (kind === 'hit') noise(0, 0.05, 1400, 0.1);
  if (kind === 'step') noise(0, 0.07, 700 + Math.random() * 300, 0.12);
  if (kind === 'break') {
    noise(0, 0.12, 1800, 0.3);
    noise(0.05, 0.1, 900, 0.2);
  }
  if (kind === 'advance') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.12, 'square', 0.045));
}
