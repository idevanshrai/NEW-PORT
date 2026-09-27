import type { BlockType } from './textures';

/**
 * The play world: eight floating islands, one per hotbar slot. Each island is
 * generated from a seeded height map, then decorated for its theme. Nothing
 * here is random at runtime — the same world appears on every visit.
 */

export type Block = { t: BlockType; x: number; y: number; z: number; s?: number };

export type BiomeId = 'profile' | 'skills' | 'projects' | 'journey' | 'achievements' | 'certs' | 'now' | 'contact';

export interface Biome {
  id: BiomeId;
  slot: number;
  title: string; // panel title
  place: string; // shown in the HUD corner
  center: [number, number, number];
  radius: number;
  surface: BlockType;
  under: BlockType;
  sky: string;
  fog: string;
  ambient: number;
  avatar: [number, number]; // x/z offset from centre where the avatar stands
}

export const BIOMES: Biome[] = [
  { id: 'profile', slot: 1, title: 'Player Profile', place: 'Meadow', center: [0, 0, 0], radius: 11, surface: 'grass', under: 'dirt', sky: '#8ec5ff', fog: '#b9dcff', ambient: 1, avatar: [2, 2] },
  { id: 'skills', slot: 2, title: 'Skill Tree', place: 'Server Room', center: [46, 3, -10], radius: 9, surface: 'planks', under: 'stone', sky: '#1b2233', fog: '#1b2233', ambient: 0.45, avatar: [1, 2] },
  { id: 'projects', slot: 3, title: 'Chest — Projects', place: 'Crystal Mine', center: [92, -2, 0], radius: 10, surface: 'stone', under: 'stone', sky: '#2a2230', fog: '#2a2230', ambient: 0.55, avatar: [2, 2] },
  { id: 'journey', slot: 4, title: 'Crafting — The Journey', place: 'Frost Peak', center: [138, 7, -8], radius: 10, surface: 'snow', under: 'stone', sky: '#a9c7ea', fog: '#d6e4f5', ambient: 0.95, avatar: [1, 2] },
  { id: 'achievements', slot: 5, title: 'Advancements', place: 'Glow Caverns', center: [184, -3, 2], radius: 10, surface: 'deep', under: 'deep', sky: '#07101c', fog: '#07101c', ambient: 0.35, avatar: [2, 2] },
  { id: 'certs', slot: 6, title: 'Certificates', place: 'Dune Archive', center: [230, 1, -6], radius: 10, surface: 'sand', under: 'sand', sky: '#f0c987', fog: '#f5dcae', ambient: 1, avatar: [1, 2] },
  { id: 'now', slot: 7, title: 'Right Now', place: 'Blossom Hill', center: [276, 4, 0], radius: 10, surface: 'grass', under: 'dirt', sky: '#f6c7d8', fog: '#fbe0ea', ambient: 1, avatar: [2, 2] },
  { id: 'contact', slot: 8, title: 'Send a Message', place: 'Sunset Shore', center: [322, 0, -8], radius: 11, surface: 'sand', under: 'sand', sky: '#ff9e6d', fog: '#ffc19c', ambient: 0.9, avatar: [1, 2] },
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** smooth-ish 2D noise from a few sines — cheap and deterministic */
const noise = (x: number, z: number, k: number) =>
  Math.sin(x * 0.45 + k) * 0.5 + Math.sin(z * 0.38 + k * 1.7) * 0.5 + Math.sin((x + z) * 0.21 + k * 0.3) * 0.6;

export interface Island {
  biome: Biome;
  blocks: Block[];
  top: (x: number, z: number) => number; // world surface height at local x/z
  avatarPos: [number, number, number];
  lights: { pos: [number, number, number]; color: string }[];
  fire?: [number, number, number];
}

export function buildWorld(): Island[] {
  return BIOMES.map((b, i) => buildIsland(b, i + 3));
}

function buildIsland(b: Biome, seed: number): Island {
  const r = rng(seed * 97);
  const [cx, cy, cz] = b.center;
  const R = b.radius;
  const blocks: Block[] = [];
  const heights = new Map<string, number>();
  const flat = b.id === 'skills' || b.id === 'certs' || b.id === 'contact';

  // terrain: a rough disc, thicker in the middle, tapering underneath
  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      const edge = R - 1.2 + noise(x, z, seed) * 1.1;
      const d = Math.hypot(x, z);
      if (d > edge) continue;
      const h = flat ? 0 : Math.round(noise(x * 0.7, z * 0.7, seed * 2) * 1.2 + (1 - d / R) * 1.5);
      heights.set(`${x},${z}`, h);
      const depth = Math.max(1, Math.round((1 - d / edge) * 7 + r() * 2));
      for (let k = 0; k <= depth; k++) {
        const y = cy + h - k;
        const t: BlockType = k === 0 ? b.surface : k < 3 ? b.under : b.id === 'achievements' ? 'deep' : 'stone';
        // hollow inside: only keep blocks that could be visible
        const inner = k > 0 && k < depth && d < edge - 1.5;
        if (inner && k > 1) continue;
        blocks.push({ t, x: cx + x, y, z: cz + z });
      }
      // a few hanging bits under the island
      if (d < edge - 2 && r() < 0.05) blocks.push({ t: 'stone', x: cx + x, y: cy + h - depth - 1, z: cz + z });
    }

  const top = (x: number, z: number) => cy + (heights.get(`${Math.round(x)},${Math.round(z)}`) ?? 0);
  const [ax, az] = b.avatar;
  const avatarPos: [number, number, number] = [cx + ax, top(ax, az) + 0.5, cz + az];
  const lights: Island['lights'] = [];
  let fire: Island['fire'];

  // keep the avatar's spot and the camera's line of sight (in front of / left of the avatar) free
  const inView = (x: number, z: number) => z > az - 2.5 && x > ax - 11 && x < ax + 3.5;
  const clear = (x: number, z: number) => Math.hypot(x - ax, z - az) > 2.6 && !inView(x, z) && heights.has(`${x},${z}`);
  const put = (t: BlockType, x: number, y: number, z: number, s?: number) => blocks.push({ t, x: cx + x, y, z: cz + z, s });
  const spot = (tries = 40): [number, number] | null => {
    for (let n = 0; n < tries; n++) {
      const x = Math.round((r() * 2 - 1) * (R - 3));
      const z = Math.round((r() * 2 - 1) * (R - 3));
      if (clear(x, z)) return [x, z];
    }
    return null;
  };
  const tree = (leaf: BlockType, x: number, z: number, h = 4) => {
    const y0 = top(x, z) + 1;
    for (let k = 0; k < h; k++) put('log', x, y0 + k, z);
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let dy = 0; dy <= 2; dy++) {
          const far = Math.abs(dx) + Math.abs(dz) + dy;
          if (far > 4 || (dy === 2 && far > 2) || (dx === 0 && dz === 0 && dy < 2)) continue;
          if (r() < 0.08) continue;
          put(leaf, x + dx, y0 + h - 2 + dy, z + dz);
        }
  };

  // little grass tufts on green islands
  if (b.surface === 'grass')
    for (let n = 0; n < 70; n++) {
      const s = spot(6);
      if (s) put('leaves', s[0] + (r() - 0.5) * 0.6, top(s[0], s[1]) + 0.58, s[1] + (r() - 0.5) * 0.6, 0.16 + r() * 0.08);
    }

  switch (b.id) {
    case 'profile': {
      for (let n = 0; n < 4; n++) {
        const s = spot();
        if (s) tree('leaves', s[0], s[1], 4 + Math.floor(r() * 2));
      }
      for (let n = 0; n < 26; n++) {
        const s = spot(10);
        if (s) put(r() < 0.5 ? 'blossom' : 'lantern', s[0], top(s[0], s[1]) + 0.65, s[1], 0.28);
      }
      break;
    }
    case 'skills': {
      // two rows of server racks behind the avatar, plus desk lamps
      for (let x = -6; x <= 6; x += 2)
        for (const z of [-4, -6]) {
          const h = 2 + Math.floor(r() * 2);
          for (let k = 1; k <= h; k++) put('rack', x, cy + k, z);
        }
      put('lantern', 5, cy + 1, 3, 0.5);
      lights.push({ pos: [cx, cy + 3, cz - 3], color: '#c8ff2e' });
      lights.push({ pos: [cx + 5, cy + 2, cz + 3], color: '#ffb347' });
      break;
    }
    case 'projects': {
      for (let n = 0; n < 7; n++) {
        const s = spot();
        if (!s) continue;
        const y = top(s[0], s[1]) + 1;
        const h = 1 + Math.floor(r() * 3);
        for (let k = 0; k < h; k++) put(r() < 0.5 ? 'crystal' : 'violet', s[0], y + k, s[1], 0.9 - k * 0.2);
      }
      for (let n = 0; n < 5; n++) put('crate', -3 + n * 1.5, top(0, -3) + 1, -3.5);
      for (let n = 0; n < 3; n++) put('crate', -1.5 + n * 1.5, top(0, -3) + 2, -3.5);
      lights.push({ pos: [cx, cy + 3, cz], color: '#5fe3f5' });
      lights.push({ pos: [cx - 4, cy + 2, cz - 3], color: '#a878f2' });
      break;
    }
    case 'journey': {
      for (let n = 0; n < 3; n++) {
        const s = spot();
        if (s) tree('leaves', s[0], s[1], 5);
      }
      // campfire next to the avatar
      const fx = ax - 2.5, fz = az;
      const fy = top(fx, fz) + 0.65;
      put('log', fx - 0.25, fy, fz, 0.3);
      put('log', fx + 0.25, fy, fz, 0.3);
      put('log', fx, fy, fz - 0.25, 0.3);
      fire = [cx + fx, fy + 0.3, cz + fz];
      lights.push({ pos: [fire[0], fire[1] + 0.6, fire[2]], color: '#ff9a3c' });
      break;
    }
    case 'achievements': {
      for (let n = 0; n < 12; n++) {
        const s = spot();
        if (!s) continue;
        const y = top(s[0], s[1]) + 1;
        const h = 1 + Math.floor(r() * 4);
        for (let k = 0; k < h; k++) put('crystal', s[0], y + k, s[1], 1 - k * 0.18);
      }
      lights.push({ pos: [cx, cy + 4, cz], color: '#39e1ff' });
      lights.push({ pos: [cx + 4, cy + 2, cz - 4], color: '#39e1ff' });
      break;
    }
    case 'certs': {
      // sandstone-ish archive: plank columns and a crate of scrolls
      for (const [x, z] of [[-4, -4], [4, -4], [-4, -7], [4, -7]]) for (let k = 1; k <= 4; k++) put('planks', x, cy + k, z);
      for (let x = -4; x <= 4; x++) put('planks', x, cy + 5, -7);
      for (let x = -4; x <= 4; x++) put('planks', x, cy + 5, -4);
      for (let n = 0; n < 4; n++) {
        const s = spot();
        if (!s) continue;
        const h = 2 + Math.floor(r() * 2);
        for (let k = 1; k <= h; k++) put('cactus', s[0], cy + k, s[1], 0.8);
      }
      put('lantern', -1, cy + 1, -3, 0.5);
      lights.push({ pos: [cx, cy + 3, cz - 2], color: '#ffcf7a' });
      break;
    }
    case 'now': {
      for (let n = 0; n < 5; n++) {
        const s = spot();
        if (s) tree('blossom', s[0], s[1], 4 + Math.floor(r() * 2));
      }
      for (let n = 0; n < 30; n++) {
        const s = spot(10);
        if (s) put('blossom', s[0], top(s[0], s[1]) + 0.55, s[1], 0.12 + r() * 0.1);
      }
      break;
    }
    case 'contact': {
      // a little dock out to the water and a mailbox by the avatar
      for (let z = 3; z <= 12; z++) {
        put('planks', -3, cy, z);
        put('planks', -2, cy, z);
      }
      put('log', -4, cy - 1, 12);
      put('log', -1, cy - 1, 12);
      put('log', 3, cy + 1, 1, 0.35);
      put('mail', 3, cy + 1.6, 1, 0.7);
      const s = spot();
      if (s) tree('leaves', s[0], s[1], 5);
      lights.push({ pos: [cx + 2, cy + 3, cz + 4], color: '#ffb070' });
      break;
    }
  }

  return { biome: b, blocks, top, avatarPos, lights, fire };
}
