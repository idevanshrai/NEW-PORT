import * as THREE from 'three';

/**
 * Every block texture on the play page is generated here, pixel by pixel, from
 * a seeded random generator and our own palette — no game assets are used.
 * Each texture is 16×16 and rendered with nearest-neighbour filtering so it
 * stays crisp and blocky.
 */

const S = 16;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

type Paint = (x: number, y: number, r: () => number) => string | null;

function make(seed: number, paint: Paint) {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const r = rng(seed);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const col = paint(x, y, r);
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const pick = (r: () => number, cols: string[]) => cols[Math.floor(r() * cols.length)];

// ── palettes (ours) ───────────────────────────────────────────────────────
const MOSS = ['#5d9a3a', '#67a843', '#528a33', '#72b34c', '#4f8230'];
const SOIL = ['#7a5536', '#6d4a2f', '#835c3b', '#61422a', '#8a6444'];
const ROCK = ['#8d8d92', '#7f7f85', '#98989c', '#737378', '#a3a3a7'];
const SAND = ['#e2d29c', '#d9c78f', '#e9dbab', '#cfbd85'];
const SNOW = ['#f3f6fa', '#e8eef5', '#ffffff', '#dde6f0'];
const BARK = ['#5e4228', '#6b4b2e', '#523a23', '#735236'];
const LEAF = ['#3f7d2b', '#4a8c33', '#366f25', '#559a3b', '#2f6320'];
const PINK = ['#f2a7c3', '#eb95b6', '#f7bcd2', '#e183a8', '#fbd0df'];
const PLANK = ['#b0834f', '#a67a48', '#bb8c57', '#9c7143'];
const DEEP = ['#2c3140', '#262a37', '#323848', '#20242f'];

export type TexName =
  | 'grassTop' | 'grassSide' | 'dirt' | 'stone' | 'sand' | 'snow' | 'snowSide'
  | 'log' | 'logTop' | 'leaves' | 'blossom' | 'planks' | 'rack' | 'rackTop'
  | 'crystal' | 'violet' | 'crate' | 'deep' | 'lantern' | 'cactus' | 'mail';

let cache: Record<TexName, THREE.CanvasTexture> | null = null;

export function textures() {
  if (cache) return cache;
  cache = {
    grassTop: make(1, (_x, _y, r) => pick(r, MOSS)),
    dirt: make(2, (_x, _y, r) => pick(r, SOIL)),
    grassSide: make(3, (_x, y, r) => {
      const fringe = 2 + Math.floor(r() * 3);
      return y < fringe ? pick(r, MOSS) : pick(r, SOIL);
    }),
    stone: make(4, (x, y, r) => ((x * 7 + y * 3) % 11 === 0 ? '#6a6a70' : pick(r, ROCK))),
    sand: make(5, (_x, _y, r) => pick(r, SAND)),
    snow: make(6, (_x, _y, r) => pick(r, SNOW)),
    snowSide: make(7, (_x, y, r) => (y < 3 + Math.floor(r() * 2) ? pick(r, SNOW) : pick(r, ROCK))),
    log: make(8, (x, _y, r) => (x % 4 === 0 ? '#45301c' : pick(r, BARK))),
    logTop: make(9, (x, y) => {
      const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
      return d > 6.5 ? '#5e4228' : Math.floor(d) % 2 ? '#b98f5e' : '#a57b4c';
    }),
    leaves: make(10, (_x, _y, r) => (r() < 0.12 ? '#244f18' : pick(r, LEAF))),
    blossom: make(11, (_x, _y, r) => (r() < 0.1 ? '#c86a92' : pick(r, PINK))),
    planks: make(12, (x, y, r) => (y % 4 === 3 ? '#7d5a33' : (x + Math.floor(y / 4) * 5) % 16 === 0 ? '#86613a' : pick(r, PLANK))),
    // a server rack — dark panel with drive bays and LEDs (lime = ours)
    rack: make(13, (x, y, r) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) return '#15161a';
      if (y % 3 === 0) return '#1d1f25';
      if (x === 12 && r() < 0.7) return r() < 0.5 ? '#c8ff2e' : '#39e1ff';
      if (x > 2 && x < 10) return '#2a2d35';
      return '#23252c';
    }),
    rackTop: make(14, (x, y) => ((x + y) % 4 === 0 ? '#2b2e36' : '#1c1e23')),
    crystal: make(15, (x, y, r) => {
      const d = Math.abs(x - 7.5) + Math.abs(y - 7.5);
      return d < 5 ? (r() < 0.5 ? '#9ff6ff' : '#5fe3f5') : r() < 0.3 ? '#2ec4dc' : pick(r, DEEP);
    }),
    violet: make(16, (x, y, r) => {
      const d = Math.abs(x - 7.5) + Math.abs(y - 7.5);
      return d < 6 ? (r() < 0.5 ? '#c9a4ff' : '#a878f2') : pick(r, ['#3a2c5a', '#44336b', '#2f2449']);
    }),
    crate: make(17, (x, y, r) => {
      if (x < 2 || x > 13 || y < 2 || y > 13) return '#6b4a2a';
      if (x === y || x === 15 - y) return '#7a5631';
      return pick(r, PLANK);
    }),
    deep: make(18, (_x, _y, r) => (r() < 0.05 ? '#3f8fa0' : pick(r, DEEP))),
    lantern: make(19, (x, y) => (x < 2 || x > 13 || y < 2 || y > 13 ? '#3b3b40' : (x + y) % 5 === 0 ? '#ffd68a' : '#ffb347')),
    cactus: make(20, (x, _y, r) => (x % 5 === 0 ? '#2f6b2c' : r() < 0.08 ? '#e8f0c8' : pick(r, ['#4c9a44', '#3f8a3a', '#56a84d']))),
    mail: make(21, (x, y) => (y === 4 && x > 2 && x < 13 ? '#f2f2f2' : x < 1 || x > 14 || y < 1 || y > 14 ? '#8a1f1f' : '#c0392b')),
  };
  return cache;
}

/** Which texture goes on which face, and how the block glows. */
export type BlockType =
  | 'grass' | 'dirt' | 'stone' | 'sand' | 'snow' | 'log' | 'leaves' | 'blossom' | 'planks'
  | 'rack' | 'crystal' | 'violet' | 'crate' | 'deep' | 'lantern' | 'cactus' | 'mail';

export const BLOCKS: Record<BlockType, { top: TexName; side: TexName; bottom: TexName; glow?: string }> = {
  grass: { top: 'grassTop', side: 'grassSide', bottom: 'dirt' },
  dirt: { top: 'dirt', side: 'dirt', bottom: 'dirt' },
  stone: { top: 'stone', side: 'stone', bottom: 'stone' },
  sand: { top: 'sand', side: 'sand', bottom: 'sand' },
  snow: { top: 'snow', side: 'snowSide', bottom: 'stone' },
  log: { top: 'logTop', side: 'log', bottom: 'logTop' },
  leaves: { top: 'leaves', side: 'leaves', bottom: 'leaves' },
  blossom: { top: 'blossom', side: 'blossom', bottom: 'blossom' },
  planks: { top: 'planks', side: 'planks', bottom: 'planks' },
  rack: { top: 'rackTop', side: 'rack', bottom: 'rackTop', glow: '#1a2a10' },
  crystal: { top: 'crystal', side: 'crystal', bottom: 'crystal', glow: '#0c4a55' },
  violet: { top: 'violet', side: 'violet', bottom: 'violet', glow: '#2c1650' },
  crate: { top: 'crate', side: 'crate', bottom: 'crate' },
  deep: { top: 'deep', side: 'deep', bottom: 'deep' },
  lantern: { top: 'lantern', side: 'lantern', bottom: 'lantern', glow: '#b86a10' },
  cactus: { top: 'cactus', side: 'cactus', bottom: 'cactus' },
  mail: { top: 'mail', side: 'mail', bottom: 'mail' },
};
