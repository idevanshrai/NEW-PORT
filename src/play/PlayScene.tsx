import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOCKS, textures, type BlockType } from './textures';
import { buildWorld, type BiomeId, type Island, type World } from './world';
import { avatarMaterials } from './avatar';
import { cam, hasManualInput, hud, input, player, quality, requests } from './controls';
import { setWaterLevel, sfx, stopWater } from './sound';
import type { Reaction } from './reactions';
import type { Block } from './world';

/* ─────────────────────────────────────────────────────────────────────────
 * The play-mode 3D world. Everything is drawn from primitives and textures
 * generated in textures.ts: blocks, the avatar, the drone, particles.
 * ───────────────────────────────────────────────────────────────────────── */

const pointer = { x: 0, y: 0 };

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** shortest-path interpolation between two angles */
function lerpAngle(a: number, b: number, k: number) {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * k;
}

/** seeded random so particles/stars are laid out the same every time */
function seeded(seed: number) {
  let v = seed;
  return () => {
    v = (v * 16807) % 2147483647;
    return (v - 1) / 2147483646;
  };
}

/** All blocks of one type → one InstancedMesh (fast even with ~15k blocks). */
function BlockLayer({
  type,
  blocks,
  onMesh,
}: {
  type: BlockType;
  blocks: Island['blocks'];
  onMesh: (type: BlockType, mesh: THREE.InstancedMesh) => void;
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => onMesh(type, ref.current), [onMesh, type]);
  const materials = useMemo(() => {
    const t = textures();
    const def = BLOCKS[type];
    const mk = (name: keyof ReturnType<typeof textures>) =>
      new THREE.MeshLambertMaterial({
        map: t[name],
        emissive: def.glow ? new THREE.Color('#ffffff') : new THREE.Color('#000000'),
        emissiveMap: def.glow ? t[name] : null,
        emissiveIntensity: def.glow ? 0.85 : 0,
      });
    const side = mk(def.side);
    return [side, side, mk(def.top), mk(def.bottom), side, side];
  }, [type]);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const c = new THREE.Color();
    blocks.forEach((b, i) => {
      p.set(b.x, b.y, b.z);
      s.setScalar(b.s ?? 1);
      m.compose(p, q, s);
      ref.current.setMatrixAt(i, m);
      // tiny per-block brightness variation so surfaces don't look flat/tiled
      const h = Math.sin(b.x * 12.9898 + b.y * 78.233 + b.z * 37.719) * 43758.5453;
      const v = 0.9 + (h - Math.floor(h)) * 0.12;
      ref.current.setColorAt(i, c.setRGB(v, v, v));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [blocks]);

  const small = blocks.every((b) => (b.s ?? 1) < 0.5);
  return <instancedMesh ref={ref} args={[geo, materials, blocks.length]} castShadow={!small} receiveShadow />;
}

/* ── the avatar: an original blocky Devansh (skin drawn in avatar.ts) ──── */
function Box({ p, s, c, e }: { p: [number, number, number]; s: [number, number, number]; c: string; e?: boolean }) {
  return (
    <mesh position={p} castShadow>
      <boxGeometry args={s} />
      {e ? <meshBasicMaterial color={c} /> : <meshLambertMaterial color={c} />}
    </mesh>
  );
}

function Avatar() {
  const M = useMemo(() => avatarMaterials(), []);
  const geo = useMemo(
    () => ({
      head: new THREE.BoxGeometry(0.5, 0.5, 0.5),
      torso: new THREE.BoxGeometry(0.5, 0.75, 0.25),
      limb: new THREE.BoxGeometry(0.25, 0.75, 0.25),
      lid: new THREE.BoxGeometry(0.13, 0.068, 0.004),
    }),
    [],
  );
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const lids = useRef<THREE.Group>(null!);
  const idleSince = useRef(0);
  const phase = useRef(0);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const moving = player.speed > 0.08;
    if (moving || !player.grounded) idleSince.current = t;
    const idle = t - idleSince.current;
    phase.current += dt * 11 * Math.max(player.speed, 0.0001);

    root.current.visible = !cam.fpp;
    root.current.position.copy(player.pos);
    // walking: face where you're going; standing a while: turn towards the camera (and the cursor)
    const want = idle > 1.2 ? cam.yaw + pointer.x * 0.3 : player.yaw;
    root.current.rotation.y = lerpAngle(root.current.rotation.y, want, 1 - Math.exp(-dt * (moving ? 16 : 3)));

    const stride = Math.sin(phase.current) * 0.75 * player.speed;
    const air = !player.grounded;
    legL.current.rotation.x = air ? -0.5 : stride;
    legR.current.rotation.x = air ? 0.3 : -stride;
    const waveT = t - player.arrivedAt - 0.5;
    const waving = waveT > 0 && waveT < 1.7 && !moving;
    armL.current.rotation.x = air ? -2.4 : moving ? -stride * 0.8 : Math.sin(t * 1.6) * 0.06;
    armL.current.rotation.z = air ? 0.3 : 0.05;
    const swing = t - player.swingAt < 0.25 ? Math.sin(((t - player.swingAt) / 0.25) * Math.PI) : 0;
    armR.current.rotation.x = swing ? -1.6 * swing - 0.4 : air ? -2.4 : waving ? -2.7 + Math.sin(t * 13) * 0.08 : moving ? stride * 0.8 : -Math.sin(t * 1.6) * 0.06;
    armR.current.rotation.z = air ? -0.3 : waving ? -0.25 + Math.sin(t * 11) * 0.3 : -0.05;

    // breathing, or a little bounce in the step
    body.current.position.y = moving ? Math.abs(Math.sin(phase.current)) * 0.05 * player.speed : Math.sin(t * 2) * 0.012;

    // head follows the cursor once standing still
    const look = idle > 1.2;
    head.current.rotation.y += ((look ? pointer.x * 0.6 : 0) - head.current.rotation.y) * 0.1;
    head.current.rotation.x += ((look ? -pointer.y * 0.3 : 0) - head.current.rotation.x) * 0.1;

    lids.current.visible = t % 3.7 < 0.13;
  });

  return (
    <group ref={root} scale={0.95}>
      <group ref={body}>
        {/* legs pivot at the hip */}
        <group ref={legL} position={[-0.125, 0.75, 0]}>
          <mesh geometry={geo.limb} material={M.leg} position={[0, -0.375, 0]} castShadow />
        </group>
        <group ref={legR} position={[0.125, 0.75, 0]}>
          <mesh geometry={geo.limb} material={M.leg} position={[0, -0.375, 0]} castShadow />
        </group>
        <mesh geometry={geo.torso} material={M.torso} position={[0, 1.125, 0]} castShadow />
        {/* arms pivot at the shoulder */}
        <group ref={armL} position={[-0.375, 1.5, 0]}>
          <mesh geometry={geo.limb} material={M.arm} position={[0, -0.375, 0]} castShadow />
        </group>
        <group ref={armR} position={[0.375, 1.5, 0]}>
          <mesh geometry={geo.limb} material={M.arm} position={[0, -0.375, 0]} castShadow />
        </group>
        {/* head pivots at the neck */}
        <group ref={head} position={[0, 1.5, 0]}>
          <mesh geometry={geo.head} material={M.head} position={[0, 0.25, 0]} castShadow />
          <group ref={lids} visible={false}>
            <mesh geometry={geo.lid} material={M.lid} position={[-0.125, 0.219, 0.2515]} />
            <mesh geometry={geo.lid} material={M.lid} position={[0.125, 0.219, 0.2515]} />
          </group>
        </group>
      </group>
    </group>
  );
}

/* ── movement: input → velocity → collide with the block world ─────────── */
const SPEED = 5.2; // blocks per second
const GRAVITY = 28;
const JUMP = 8.5;
const RADIUS = 0.3;
const REACH = 3; // how close you need to be to a landmark

function PlayerController({
  world,
  onIsland,
  onNear,
  onArrive,
  onReact,
}: {
  world: World;
  onIsland: (i: number) => void;
  onNear: (i: number | null) => void;
  onArrive: (i: number) => void;
  onReact: (r: Reaction) => void;
}) {
  const last = useRef<{ island: number; near: number | null }>({ island: -1, near: null });
  const quirks = useRef({ edge: 0, jumps: [] as number[], sprint: 0, idle: 0 });
  const stuck = useRef({ t: 0, d: Infinity });
  const strideLeft = useRef(1.7);
  // auto-walk route: across the bridges between here and the target island, then to its landmark
  const route = useRef<{ for: object | null; pts: THREE.Vector2[] }>({ for: null, pts: [] });
  const plan = (from: number, to: number) => {
    const { bridges, islands } = world;
    const pts: THREE.Vector2[] = [];
    const v = ([x, z]: [number, number]) => new THREE.Vector2(x, z);
    if (from >= 0 && from < to) for (let i = from; i < to; i++) pts.push(v(bridges[i].a), v(bridges[i].b));
    if (from > to) for (let i = from - 1; i >= to; i--) pts.push(v(bridges[i].b), v(bridges[i].a));
    const [lx, , lz] = islands[to].landmark;
    pts.push(new THREE.Vector2(lx, lz));
    return pts;
  };

  useEffect(() => {
    player.pos.set(...world.islands[0].spawn);
    player.vy = 0;
    player.target = null;
  }, [world]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const { islands, walkTop } = world;
    const p = player.pos;

    // fast travel from the hotbar
    if (requests.travel >= 0) {
      const isl = islands[requests.travel];
      requests.travel = -1;
      p.set(...isl.spawn);
      player.vy = 0;
      player.target = null;
      player.arrivedAt = t;
      player.yaw = Math.atan2(isl.landmark[0] - p.x, isl.landmark[2] - p.z);
      cam.yaw = 0; // face along the island chain again
    }

    // which way to go: forward is where the camera looks (yaw 0 = along -z)
    const fwd = (input.up ? 1 : 0) - (input.down ? 1 : 0) + input.joyY;
    const side = (input.right ? 1 : 0) - (input.left ? 1 : 0) + input.joyX;
    const sy = Math.sin(cam.yaw);
    const cy = Math.cos(cam.yaw);
    let dx = side * cy - fwd * sy;
    let dz = -side * sy - fwd * cy;
    if (player.target && !hasManualInput()) {
      if (route.current.for !== player.target) {
        route.current = { for: player.target, pts: plan(last.current.island, player.target.island) };
        stuck.current = { t, d: Infinity };
      }
      const pts = route.current.pts;
      // waypoints along the way are passed through; only the last one (the landmark) is "arrived at"
      while (pts.length > 1 && Math.hypot(pts[0].x - p.x, pts[0].y - p.z) < 0.7) {
        pts.shift();
        stuck.current = { t, d: Infinity };
      }
      const tx = pts[0].x - p.x;
      const tz = pts[0].y - p.z;
      const d = Math.hypot(tx, tz);
      if (pts.length === 1 && d < REACH - 0.6) {
        onArrive(player.target.island);
        player.target = null;
        dx = dz = 0;
      } else {
        dx = tx / d;
        dz = tz / d;
        // walked into something for a while: just go there
        if (d < stuck.current.d - 0.05) stuck.current = { t, d };
        else if (t - stuck.current.t > 2) {
          requests.travel = player.target.island;
          onArrive(player.target.island);
          player.target = null;
        }
      }
    } else stuck.current = { t, d: Infinity };

    const len = Math.hypot(dx, dz);
    if (len > 1) {
      dx /= len;
      dz /= len;
    }
    const mag = Math.min(1, len);
    player.speed += (mag - player.speed) * (1 - Math.exp(-dt * 10));
    if (mag > 0.05) player.yaw = lerpAngle(player.yaw, Math.atan2(dx, dz), 1 - Math.exp(-dt * 14));

    // horizontal: one axis at a time so you slide along walls; step up at most one block
    const sprinting = input.sprint && mag > 0.3;
    const step = SPEED * (sprinting ? 1.65 : 1) * mag * dt;
    player.sprinting = sprinting;
    // footsteps, one per stride while on the ground
    if (player.grounded && step > 0) {
      strideLeft.current -= step;
      if (strideLeft.current <= 0) {
        strideLeft.current = 1.7;
        sfx('step');
      }
    }
    const canGo = (x: number, z: number) => {
      const h = walkTop(x, z);
      return h !== null && h - p.y <= 1.05;
    };
    let blocked = false;
    const tryMove = (px: number, pz: number) => {
      if (canGo(px, pz)) return true;
      // a two-block step: hop up it (auto-jump), like walking into a ledge in a block game
      const h = walkTop(px, pz);
      if (h !== null && h - p.y <= 2.05) blocked = true;
      if (h === null && hasManualInput()) pushingEdge = true;
      return false;
    };
    let pushingEdge = false;
    if (dx && tryMove(p.x + dx * step + Math.sign(dx) * RADIUS, p.z)) p.x += dx * step;
    if (dz && tryMove(p.x, p.z + dz * step + Math.sign(dz) * RADIUS)) p.z += dz * step;

    // vertical: gravity, jumping, easing up onto a higher block
    const floor = walkTop(p.x, p.z) ?? p.y;
    if ((input.jump || blocked) && player.grounded) {
      player.vy = JUMP;
      player.grounded = false;
      if (input.jump) {
        const q = quirks.current;
        q.jumps = [...q.jumps.filter((j) => t - j < 5), t];
        if (q.jumps.length >= 10) {
          onReact('parkour');
          q.jumps = [];
        }
      }
    }

    // walking into the edge of the world, sprinting forever, standing still, peering over the edge
    const q = quirks.current;
    q.edge = pushingEdge ? q.edge + dt : Math.max(0, q.edge - dt);
    if (q.edge > 0.5) {
      onReact('edge');
      q.edge = 0;
    }
    q.sprint = sprinting ? q.sprint + dt : 0;
    if (q.sprint > 20) {
      onReact('speedrun');
      q.sprint = 0;
    }
    q.idle = hasManualInput() || player.target || hud.panelOpen ? 0 : q.idle + dt;
    if (q.idle > 45) {
      onReact('idle');
      q.idle = 0;
    }
    if (cam.pitch < -1.0 && walkTop(p.x - Math.sin(cam.yaw) * 1.6, p.z - Math.cos(cam.yaw) * 1.6) === null) onReact('lookdown');
    player.vy -= GRAVITY * dt;
    p.y += player.vy * dt;
    if (p.y <= floor) {
      p.y = floor - p.y > 0.05 ? p.y + (floor - p.y) * Math.min(1, dt * 18) + dt * 2 : floor;
      if (p.y > floor) p.y = floor;
      player.vy = 0;
      player.grounded = true;
    } else player.grounded = p.y - floor < 0.02;
    if (p.y < -40) p.set(...islands[Math.max(0, last.current.island)].spawn); // never lost in the void

    // what's around you
    let island = last.current.island;
    for (let i = 0; i < islands.length; i++) {
      const [cx, , cz] = islands[i].biome.center;
      if (Math.hypot(p.x - cx, p.z - cz) < islands[i].biome.radius + 1) island = i;
    }
    let near: number | null = null;
    islands.forEach((isl, i) => {
      const [lx, ly, lz] = isl.landmark;
      if (Math.hypot(p.x - lx, p.z - lz) < REACH && Math.abs(p.y - ly) < 2.5) near = i;
    });
    if (island !== last.current.island) onIsland(island);
    if (near !== last.current.near) onNear(near);
    hud.near = near;
    last.current = { island, near };

    // HUD compass: point at the next island you haven't seen
    if (hud.compass && hud.compassTarget >= 0) {
      const [lx, , lz] = islands[hud.compassTarget].landmark;
      hud.compass.style.transform = `rotate(${Math.atan2(lx - p.x, -(lz - p.z))}rad)`;
    }
  });

  return null;
}

/* ── landmarks: a glowing block on a pedestal, one per island ──────────── */
function Landmark({ island, index }: { island: Island; index: number }) {
  const item = useRef<THREE.Mesh>(null!);
  const [x, y, z] = island.landmark;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    item.current.position.y = y + 1.35 + Math.sin(t * 2 + index) * 0.12;
    item.current.rotation.y = t * 1.2 + index;
  });
  const go = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (document.pointerLockElement) return; // aiming with the crosshair: clicks break / open instead
    player.target = { island: index, pos: new THREE.Vector3(x, y, z) };
  };
  return (
    <group
      onClick={go}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <mesh position={[x, y + 0.3, z]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshLambertMaterial color="#6b4f2e" />
      </mesh>
      <mesh ref={item} position={[x, y + 1.35, z]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshBasicMaterial color="#c8ff2e" />
      </mesh>
      {/* a faint beam so you can spot it from the next island */}
      <mesh position={[x, y + 4.5, z]}>
        <boxGeometry args={[0.18, 7, 0.18]} />
        <meshBasicMaterial color="#c8ff2e" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}


/* ── aiming: outline the block under the crosshair; hold to mine decorations ── */
const AIM_REACH = 6;
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
/** seconds of mining to break each kind of block */
const HARDNESS: Partial<Record<BlockType, number>> = {
  leaves: 0.3, blossom: 0.3, lantern: 0.35, cactus: 0.5, mail: 0.5, crystal: 0.7, violet: 0.7, planks: 0.7, crate: 0.7, log: 0.85, rack: 0.9,
};
const DEBRIS_COLORS: Partial<Record<BlockType, string>> = {
  leaves: '#3f8a2e', log: '#6b4a2a', blossom: '#f2a2c4', crystal: '#7fe9f7', violet: '#b08cf5', crate: '#9a6e3c',
  rack: '#2a2d35', cactus: '#4c9a44', planks: '#a77f4b', lantern: '#ffb347', mail: '#c0392b',
};
const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/** Step through the block grid along a ray (blocks fill x±0.5); first full block hit, or null. */
function raycastBlocks(o: THREE.Vector3, d: THREE.Vector3, max: number, blockAt: World['blockAt']) {
  let x = Math.floor(o.x + 0.5), y = Math.floor(o.y + 0.5), z = Math.floor(o.z + 0.5);
  const sx = Math.sign(d.x), sy = Math.sign(d.y), sz = Math.sign(d.z);
  const next = (c: number, s: number, oc: number, dc: number) => (dc === 0 ? Infinity : (c + s * 0.5 - oc) / dc);
  let tx = next(x, sx || 1, o.x, d.x), ty = next(y, sy || 1, o.y, d.y), tz = next(z, sz || 1, o.z, d.z);
  const dx = d.x ? Math.abs(1 / d.x) : Infinity, dy = d.y ? Math.abs(1 / d.y) : Infinity, dz = d.z ? Math.abs(1 / d.z) : Infinity;
  let t = 0;
  while (t <= max) {
    const b = blockAt(x, y, z);
    if (b) return b;
    if (tx < ty && tx < tz) { x += sx; t = tx; tx += dx; }
    else if (ty < tz) { y += sy; t = ty; ty += dy; }
    else { z += sz; t = tz; tz += dz; }
  }
  return null;
}

/** five crack stages, drawn as growing dark fractures on a transparent 16×16 tile */
let crackCache: THREE.CanvasTexture[] | null = null;
function crackTextures() {
  if (crackCache) return crackCache;
  const r = seeded(77);
  const pts: [number, number][] = [];
  for (let line = 0; line < 6; line++) {
    let x = 8, y = 8;
    const ang = (line / 6) * Math.PI * 2 + r();
    for (let k = 0; k < 9; k++) {
      x += Math.cos(ang) + (r() - 0.5);
      y += Math.sin(ang) + (r() - 0.5);
      pts.push([Math.round(x), Math.round(y)]);
    }
  }
  pts.sort((a, b) => Math.hypot(a[0] - 8, a[1] - 8) - Math.hypot(b[0] - 8, b[1] - 8)); // cracks grow outward
  crackCache = [1, 2, 3, 4, 5].map((stage) => {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const g = c.getContext('2d')!;
    g.fillStyle = 'rgba(20,16,12,0.85)';
    pts.slice(0, Math.ceil((pts.length * stage) / 5)).forEach(([x, y]) => g.fillRect(x, y, 1, 1));
    const t = new THREE.CanvasTexture(c);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    return t;
  });
  return crackCache;
}

const dropMats = new Map<BlockType, THREE.MeshLambertMaterial>();
const dropMaterial = (t: BlockType) => {
  if (!dropMats.has(t)) dropMats.set(t, new THREE.MeshLambertMaterial({ map: textures()[BLOCKS[t].side] }));
  return dropMats.get(t)!;
};
type DropItem = { id: number; t: BlockType; x: number; y: number; z: number };
let dropSeq = 0;

/** a mined block: a little spinning cube that bobs, then flies to you */
function Drop({ d, onDone }: { d: DropItem; onDone: (d: DropItem) => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  const s = useRef({ pos: new THREE.Vector3(d.x, d.y, d.z), target: new THREE.Vector3(), age: 0, done: false });
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const st = s.current;
    st.age += dt;
    if (st.age > 0.7) {
      const target = st.target.set(player.pos.x, player.pos.y + 0.9, player.pos.z);
      st.pos.lerp(target, 1 - Math.exp(-dt * 10));
      if (!st.done && st.pos.distanceTo(target) < 0.6) {
        st.done = true;
        onDone(d);
      }
    } else st.pos.y = d.y + Math.sin(st.age * 7) * 0.08;
    ref.current.position.copy(st.pos);
    ref.current.rotation.y = st.age * 3;
  });
  return (
    <mesh ref={ref} material={dropMaterial(d.t)} castShadow>
      <boxGeometry args={[0.28, 0.28, 0.28]} />
    </mesh>
  );
}

function Aim({ world, hideBlock, onBreak, onUse, onReact, onPickup }: {
  world: World;
  hideBlock: (b: Block) => void;
  onBreak: (b: Block) => void;
  onUse: () => void;
  onReact: (r: Reaction) => void;
  onPickup: (t: BlockType) => void;
}) {
  const box = useRef<THREE.LineSegments>(null!);
  const crack = useRef<THREE.Mesh>(null!);
  const crackMat = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    [],
  );
  const debris = useRef<THREE.InstancedMesh>(null!);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.02)), []);
  // debris pieces and the block being mined: plain mutable data, so refs rather than memoised state
  const parts = useRef(Array.from({ length: 30 }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0 })));
  const mining = useRef<{ b: Block | null; t: number; tick: number }>({ b: null, t: 0, tick: 0 });
  const scratch = useMemo(() => ({ dir: new THREE.Vector3(), m: new THREE.Matrix4(), c: new THREE.Color() }), []);
  const cursor = useRef(0);
  const touch = useMemo(() => isTouch(), []);
  const [drops, setDrops] = useState<DropItem[]>([]);
  const collect = useCallback(
    (d: DropItem) => {
      setDrops((list) => list.filter((x) => x.id !== d.id));
      sfx('pop');
      onPickup(d.t);
    },
    [onPickup],
  );

  useEffect(() => {
    for (let i = 0; i < 30; i++) {
      debris.current.setMatrixAt(i, ZERO);
      debris.current.setColorAt(i, scratch.c.set('#ffffff'));
    }
  }, [scratch]);

  useFrame(({ camera, clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    const p = player.pos;
    let ray: Block | null = null;
    let hit: Block | null = null;
    if (document.pointerLockElement || cam.fpp || touch) {
      camera.getWorldDirection(scratch.dir);
      ray = raycastBlocks(camera.position, scratch.dir, (cam.fpp ? 0 : cam.dist) + AIM_REACH + 4, world.blockAt);
      hit = ray && Math.hypot(ray.x - p.x, ray.y - (p.y + 1.6), ray.z - p.z) <= AIM_REACH ? ray : null;
    }
    box.current.visible = !!hit;
    if (hit) box.current.position.set(Math.round(hit.x), Math.round(hit.y), Math.round(hit.z));

    // a click: open the landmark in reach, or a funny line if there's nothing useful to hit
    if (requests.use) {
      requests.use = false;
      player.swingAt = t;
      if (!hit?.d) {
        if (hud.near !== null) onUse();
        else if (hit) onReact('terrain');
        else if (ray) onReact('reach');
      }
    }

    // holding: mine the decoration under the crosshair, cracks growing until it breaks
    const m = mining.current;
    if (input.mine && hit?.d) {
      if (m.b !== hit) mining.current = { b: hit, t: 0, tick: 0 };
      const mm = mining.current;
      mm.t += dt;
      mm.tick -= dt;
      if (mm.tick <= 0) {
        mm.tick = 0.25;
        player.swingAt = t;
        sfx('hit');
      }
      const dur = HARDNESS[hit.t] ?? 0.6;
      crack.current.visible = true;
      crack.current.position.set(Math.round(hit.x), Math.round(hit.y), Math.round(hit.z));
      const stage = crackTextures()[Math.min(4, Math.floor((mm.t / dur) * 5))];
      if (crackMat.map !== stage) {
        crackMat.needsUpdate = !crackMat.map; // recompile only when the material first gets a map
        crackMat.map = stage;
      }
      if (mm.t >= dur) {
        world.removeBlock(hit);
        hideBlock(hit);
        sfx('break');
        scratch.c.set(DEBRIS_COLORS[hit.t] ?? '#9a9a9a');
        for (let n = 0; n < 10; n++) {
          const i = cursor.current++ % 30;
          const q = parts.current[i];
          q.p.set(hit.x + (Math.random() - 0.5) * 0.6, hit.y + (Math.random() - 0.5) * 0.6, hit.z + (Math.random() - 0.5) * 0.6);
          q.v.set((Math.random() - 0.5) * 3, 2 + Math.random() * 2.5, (Math.random() - 0.5) * 3);
          q.life = 0.7 + Math.random() * 0.3;
          debris.current.setColorAt(i, scratch.c);
        }
        if (debris.current.instanceColor) debris.current.instanceColor.needsUpdate = true;
        const b = hit;
        setDrops((list) => [...list.slice(-11), { id: ++dropSeq, t: b.t, x: b.x, y: b.y, z: b.z }]);
        onBreak(hit);
        mining.current = { b: null, t: 0, tick: 0 };
        crack.current.visible = false;
      }
    } else {
      if (m.b) mining.current = { b: null, t: 0, tick: 0 };
      crack.current.visible = false;
    }

    let alive = false;
    parts.current.forEach((q, i) => {
      if (q.life <= 0) return debris.current.setMatrixAt(i, ZERO);
      alive = true;
      q.life -= dt;
      q.v.y -= 14 * dt;
      q.p.addScaledVector(q.v, dt);
      const s = 0.14 * Math.max(0, q.life);
      scratch.m.makeScale(s, s, s).setPosition(q.p);
      debris.current.setMatrixAt(i, scratch.m);
    });
    if (alive) debris.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <lineSegments ref={box} geometry={edges} visible={false}>
        <lineBasicMaterial color="#000000" transparent opacity={0.65} />
      </lineSegments>
      <mesh ref={crack} material={crackMat} visible={false}>
        <boxGeometry args={[1.015, 1.015, 1.015]} />
      </mesh>
      <instancedMesh ref={debris} args={[undefined, undefined, 30]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial />
      </instancedMesh>
      {drops.map((d) => (
        <Drop key={d.id} d={d} onDone={collect} />
      ))}
    </>
  );
}

/* ── first person: your arm in the corner, swinging when you hit ─────────── */
function Hand() {
  const mats = useMemo(
    () =>
      // self-lit (no dark shading this close to the camera), drawn on top so it never clips into blocks
      avatarMaterials().arm.map((m) => new THREE.MeshBasicMaterial({ map: m.map, color: m.map ? '#e6e6e6' : m.color, depthTest: false })),
    [],
  );
  const ref = useRef<THREE.Mesh>(null!);
  const s = useMemo(() => ({ off: new THREE.Vector3(), q: new THREE.Quaternion(), e: new THREE.Euler() }), []);
  useFrame(({ camera, clock }) => {
    ref.current.visible = cam.fpp;
    if (!cam.fpp) return;
    const t = clock.elapsedTime;
    const since = t - player.swingAt;
    const swing = since < 0.25 ? Math.sin((since / 0.25) * Math.PI) : 0;
    const bob = player.grounded ? Math.sin(t * (player.sprinting ? 15 : 11)) * 0.025 * player.speed : 0;
    s.off.set(0.3 - swing * 0.08, -0.3 + bob + swing * 0.08, -0.5 - swing * 0.1).applyQuaternion(camera.quaternion);
    ref.current.position.copy(camera.position).add(s.off);
    s.e.set(1.25 - swing * 0.7, 0.35 + swing * 0.3, 0.15);
    ref.current.quaternion.copy(camera.quaternion).multiply(s.q.setFromEuler(s.e));
  });
  return (
    <mesh ref={ref} material={mats} renderOrder={999} frustumCulled={false}>
      <boxGeometry args={[0.11, 0.42, 0.11]} />
    </mesh>
  );
}

/* ── a sea of blocky clouds far below the islands ───────────────────────── */
const SEA_Y = -30;
function CloudSea({ night }: { night: boolean }) {
  const layers = useMemo(
    () =>
      [
        { y: SEA_Y, n: 320, opacity: 0.95, seed: 3 },
        { y: SEA_Y - 9, n: 140, opacity: 0.55, seed: 7 },
      ].map((l) => {
        const r = seeded(l.seed);
        const slabs = Array.from({ length: l.n }, () => ({
          x: -80 + r() * 380,
          z: -90 + r() * 180,
          w: 6 + r() * 10,
          d: 4 + r() * 8,
          h: 1.2 + r() * 0.8,
          v: 0.35 + r() * 0.3,
        }));
        const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: l.opacity });
        return { ...l, slabs, mat };
      }),
    [],
  );
  const refs = useRef<THREE.InstancedMesh[]>([]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const day = useMemo(() => new THREE.Color('#ffffff'), []);
  const dusk = useMemo(() => new THREE.Color('#56607e'), []);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    layers.forEach((l, li) => {
      const mesh = refs.current[li];
      if (!mesh) return;
      l.mat.color.lerp(night ? dusk : day, 1 - Math.exp(-dt * 2));
      const count = quality.shadows ? l.n : Math.floor(l.n / 2);
      mesh.count = count;
      for (let i = 0; i < count; i++) {
        const c = l.slabs[i];
        c.x += c.v * dt;
        if (c.x > 300) c.x = -80;
        m.makeScale(c.w, c.h, c.d).setPosition(c.x, l.y, c.z);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  });
  return (
    <>
      {layers.map((l, i) => (
        <instancedMesh
          key={l.seed}
          ref={(el) => void (el && (refs.current[i] = el))}
          args={[undefined, l.mat, l.n]}
          frustumCulled={false}
        >
          <boxGeometry args={[1, 1, 1]} />
        </instancedMesh>
      ))}
    </>
  );
}

/* ── waterfalls spilling off the island edges into the clouds ───────────── */
function waterTexture(seed: number) {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 32;
  const g = c.getContext('2d')!;
  const r = seeded(seed);
  for (let y = 0; y < 32; y++)
    for (let x = 0; x < 16; x++) {
      g.fillStyle = r() < 0.08 ? '#d6ecff' : ['#2f86c9', '#3a93d6', '#2a7bbd', '#5aa9e6'][Math.floor(r() * 4)];
      g.fillRect(x, y, 1, 1);
    }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Waterfalls({ islands }: { islands: Island[] }) {
  const falls = useMemo(() => islands.flatMap((isl) => isl.falls), [islands]);
  const items = useMemo(
    () =>
      falls.map((f, i) => {
        const h = f.y + 0.5 - SEA_Y;
        const curtain = waterTexture(40 + i);
        curtain.repeat.set(1, h / 2);
        const pool = waterTexture(80 + i);
        return {
          f,
          h,
          curtainMat: new THREE.MeshLambertMaterial({ map: curtain, transparent: true, opacity: 0.88, side: THREE.DoubleSide }),
          poolMat: new THREE.MeshLambertMaterial({ map: pool, transparent: true, opacity: 0.9 }),
        };
      }),
    [falls],
  );
  const splash = useRef<THREE.InstancedMesh>(null!);
  const PER = 6;
  const seeds = useMemo(() => {
    const r = seeded(31);
    return Array.from({ length: falls.length * PER }, () => ({ o: r(), x: (r() - 0.5) * 1.6, z: (r() - 0.5) * 1.2 }));
  }, [falls]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const level = useRef(0);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    items.forEach((it) => {
      it.curtainMat.map!.offset.y += dt * 1.6; // falling
      it.poolMat.map!.offset.y += dt * 0.5 * it.f.dz; // flowing to the edge
    });
    // splashes where the water meets the clouds
    seeds.forEach((s, i) => {
      const f = falls[Math.floor(i / PER)];
      const life = (t * 0.8 + s.o) % 1;
      const sz = quality.shadows ? 0.5 * (1 - life) : 0;
      m.makeScale(sz, sz, sz).setPosition(f.x + s.x * (1 + life), SEA_Y + 0.8 + life * 1.8, f.z + f.dz * 0.95 + s.z);
      splash.current.setMatrixAt(i, m);
    });
    splash.current.instanceMatrix.needsUpdate = true;
    // the rush gets louder as you get close
    level.current -= dt;
    if (level.current <= 0) {
      level.current = 0.25;
      const p = player.pos;
      const d = Math.min(...falls.map((f) => Math.hypot(f.x - p.x, (f.y - p.y) * 0.5, f.z + f.dz - p.z)));
      setWaterLevel(Math.max(0, 1 - d / 16));
    }
  });
  // silence it while the tab is hidden (frames stop, so the level can't update), and stop it for good on exit
  useEffect(() => {
    const onVis = () => document.hidden && setWaterLevel(0);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stopWater();
    };
  }, []);

  return (
    <>
      {items.map(({ f, h, curtainMat, poolMat }, i) => (
        <group key={i}>
          {/* water flowing over the top block */}
          <mesh position={[f.x, f.y + 0.52, f.z]} rotation-x={-Math.PI / 2} material={poolMat}>
            <planeGeometry args={[1, 1]} />
          </mesh>
          {/* the falling column of water, just outside the edge (solid, so it reads from any angle) */}
          <mesh position={[f.x, f.y + 0.5 - h / 2, f.z + f.dz * 0.95]} material={curtainMat}>
            <boxGeometry args={[0.98, h, 0.9]} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={splash} args={[undefined, undefined, falls.length * PER]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#e8f4ff" transparent opacity={0.85} />
      </instancedMesh>
    </>
  );
}

/* ── signs: a wooden board by each landmark with a short teaser ──────────── */
const SIGNS: Record<BiomeId, string[]> = {
  profile: ['Devansh Rai', 'Software developer', 'Open the block →'],
  skills: ['Skill Tree', 'What he works with', 'and how deep'],
  projects: ['Projects', 'The chest holds them', 'click to look inside'],
  journey: ['The Journey', 'Robots in 2017', 'to agentic AI today'],
  achievements: ['Achievements', 'Awards, wins and', 'secrets you found'],
  certs: ['Certificates', 'Signed and stamped', 'open to read'],
  now: ['Right now', 'This month he is…', 'open to find out'],
  contact: ['Say hello', 'The mailbox sends', 'him an email'],
};

function Sign({ island }: { island: Island }) {
  // the board's text, drawn into a canvas texture (redrawn once the pixel font has loaded)
  const sign = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const draw = () => {
      const g = c.getContext('2d')!;
      g.fillStyle = '#a57b4c';
      g.fillRect(0, 0, 256, 128);
      g.fillStyle = '#93693e';
      for (let y = 0; y < 128; y += 16) g.fillRect(0, y + 14, 256, 2); // plank seams
      g.strokeStyle = '#5e4228';
      g.lineWidth = 8;
      g.strokeRect(4, 4, 248, 120);
      g.fillStyle = '#2b1d0e';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      SIGNS[island.biome.id].forEach((line, i) => {
        g.font = `${i === 0 ? 600 : 400} ${i === 0 ? 26 : 20}px "Pixelify Sans", monospace`;
        g.fillText(line, 128, 32 + i * 32);
      });
      tex.needsUpdate = true;
    };
    draw();
    return { tex, draw };
  }, [island]);
  useEffect(() => {
    document.fonts?.load('20px "Pixelify Sans"').then(sign.draw).catch(() => {});
  }, [sign]);
  const [x, y, z] = island.landmark;
  return (
    <group position={[x + 1.5, y, z - 0.2]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshLambertMaterial color="#5e4228" />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[1.5, 0.75, 0.08]} />
        {[0, 1, 2, 3, 5].map((i) => (
          <meshLambertMaterial key={i} attach={`material-${i}`} color="#7d5a33" />
        ))}
        <meshLambertMaterial attach="material-4" map={sign.tex} />
      </mesh>
    </group>
  );
}

/* ── if the device can't keep up, drop shadows and render at 1× ─────────── */
function QualityGuard() {
  const setDpr = useThree((s) => s.setDpr);
  const s = useRef({ start: -1, frames: 0, done: false });
  useFrame(() => {
    const q = s.current;
    if (q.done) return;
    const now = performance.now();
    if (q.start < 0) q.start = now + 1500; // skip shader compilation on the first frames
    if (now < q.start) return;
    q.frames++;
    if (now - q.start > 2500) {
      q.done = true;
      if (q.frames / ((now - q.start) / 1000) < 40) {
        quality.shadows = false;
        setDpr(1);
      }
    }
  });
  return null;
}

/* ── the companion: a little robot drone (a nod to the robotics days) ───── */
function Drone() {
  const g = useRef<THREE.Group>(null!);
  const rotors = useRef<THREE.Group>(null!);
  // starts at the player on the first frame (after the spawn is set), not wherever the last visit ended
  const pos = useRef<THREE.Vector3 | null>(null);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const { x, y, z } = player.pos;
    target.set(x + 1.1 + pointer.x * 0.9, y + 2.3 + Math.sin(t * 2.2) * 0.12 + pointer.y * 0.4, z + 0.6);
    pos.current ??= target.clone();
    pos.current.lerp(target, 1 - Math.exp(-dt * 3));
    g.current.position.copy(pos.current);
    g.current.rotation.z = (target.x - pos.current.x) * -0.4;
    g.current.rotation.y = pointer.x * 0.6 - 0.3;
    rotors.current.children.forEach((r, i) => (r.rotation.y = t * 30 + i));
  });

  return (
    <group ref={g} scale={0.9}>
      <Box p={[0, 0, 0]} s={[0.42, 0.2, 0.42]} c="#cfd3da" />
      <Box p={[0, -0.02, 0.215]} s={[0.16, 0.1, 0.02]} c="#c8ff2e" e />
      <Box p={[0, 0.14, 0]} s={[0.12, 0.08, 0.12]} c="#7a7f89" />
      {[[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x / 2, 0.05, z / 2]} s={[0.05, 0.04, 0.05]} c="#7a7f89" />
      ))}
      <group ref={rotors}>
        {[[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].map(([x, z]) => (
          <group key={`r${x}${z}`} position={[x, 0.1, z]}>
            <Box p={[0, 0, 0]} s={[0.34, 0.015, 0.05]} c="#2b2d33" />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ── particles: embers, snow, petals, sparkles ──────────────────────────── */
const PARTICLES = 90;
function Particles({ island }: { island: Island }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const data = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: PARTICLES }, () => ({
      x: (r() - 0.5) * 22,
      y: r() * 10,
      z: (r() - 0.5) * 14,
      v: 0.3 + r() * 0.7,
      p: r() * 6.28,
    }));
  }, []);
  const id = island.biome.id;
  const style = {
    journey: { color: '#ffffff', dir: -1, size: 0.09 },
    now: { color: '#f7a9c6', dir: -1, size: 0.1 },
    achievements: { color: '#6ff0ff', dir: 1, size: 0.06 },
    projects: { color: '#c9a4ff', dir: 1, size: 0.05 },
    skills: { color: '#c8ff2e', dir: 1, size: 0.035 },
    certs: { color: '#fff1c9', dir: 1, size: 0.04 },
    contact: { color: '#ffe0b8', dir: 1, size: 0.04 },
    profile: { color: '#fffbd0', dir: 1, size: 0.045 },
  }[id];
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: style.color, transparent: true, opacity: 0.85 }), [style.color]);

  const scratch = useMemo(() => ({ m: new THREE.Matrix4(), s: new THREE.Vector3() }), []);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const { m } = scratch;
    const size = scratch.s.setScalar(style.size);
    const [cx, cy, cz] = island.avatarPos;
    data.forEach((d, i) => {
      d.y += d.v * dt * style.dir * 0.6;
      if (d.y > 10) d.y = 0;
      if (d.y < 0) d.y = 10;
      const x = cx - 3 + d.x + Math.sin(t * 0.8 + d.p) * 0.4;
      const z = cz + d.z;
      m.makeRotationY(t + d.p);
      m.setPosition(x, cy - 2 + d.y, z);
      m.scale(size);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[undefined, mat, PARTICLES]}><boxGeometry args={[1, 1, 1]} /></instancedMesh>;
}

function Campfire({ at }: { at: [number, number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const N = 26;
  const seeds = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: N }, () => ({ o: r(), x: (r() - 0.5) * 0.4, z: (r() - 0.5) * 0.4 }));
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff9a3c', transparent: true, opacity: 0.9 }), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      const life = (t * 0.9 + s.o) % 1;
      const sz = 0.16 * (1 - life);
      m.makeScale(sz, sz, sz);
      m.setPosition(at[0] + s.x * (1 - life), at[1] + life * 1.4, at[2] + s.z * (1 - life));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, mat, N]}><boxGeometry args={[1, 1, 1]} /></instancedMesh>;
}

function Clouds() {
  const ref = useRef<THREE.Group>(null!);
  const clouds = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({ x: i * 18 - 20, y: 22 + (i % 3) * 3, z: -30 - (i % 4) * 12, w: 6 + (i % 5) * 2, d: 3 + (i % 3) * 2 })),
    [],
  );
  useFrame((_, dt) => {
    ref.current.children.forEach((c) => {
      c.position.x += dt * 0.8;
      if (c.position.x > 380) c.position.x = -40;
    });
  });
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <boxGeometry args={[c.w, 1, c.d]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Stars({ visible }: { visible: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(900);
    const r = seeded(99);
    for (let i = 0; i < 300; i++) {
      p[i * 3] = r() * 500 - 80;
      p[i * 3 + 1] = 30 + r() * 80;
      p[i * 3 + 2] = -60 - r() * 80;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} visible={visible}>
      <pointsMaterial color="#ffffff" size={0.6} sizeAttenuation />
    </points>
  );
}

/* ── sky: a big gradient dome + a square sun / moon ────────────────────── */
const skyUniforms = {
  top: { value: new THREE.Color('#5aa0ff') },
  bottom: { value: new THREE.Color('#cfe6ff') },
};
function SkyDome({ night }: { night: boolean }) {
  const dome = useRef<THREE.Mesh>(null!);
  const sun = useRef<THREE.Mesh>(null!);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.35,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, h),1.0); }',
      }),
    [],
  );
  useFrame(({ camera }) => {
    dome.current.position.copy(camera.position);
    sun.current.position.set(camera.position.x + 60, camera.position.y + 55, camera.position.z - 140);
    sun.current.lookAt(camera.position);
  });
  return (
    <>
      <mesh ref={dome} material={mat} renderOrder={-1}>
        <sphereGeometry args={[250, 24, 16]} />
      </mesh>
      <mesh ref={sun}>
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial color={night ? '#e8eefc' : '#fff4c2'} fog={false} />
      </mesh>
    </>
  );
}

/* ── camera + sky: follow the player; the sky takes on the island you're on ── */
function Rig({ island, night, world }: { island: Island; night: boolean; world: World }) {
  // the point the camera orbits (follows the player, swoops on start / fast travel)
  const pivot = useRef(new THREE.Vector3(-20, 20, 30));
  const tmp = useMemo(() => ({ want: new THREE.Vector3(), off: new THREE.Vector3(), probe: new THREE.Vector3() }), []);
  const colors = useMemo(
    () => ({
      want: new THREE.Color(),
      night: new THREE.Color('#05070f'),
      horizonDay: new THREE.Color('#ffffff'),
      horizonNight: new THREE.Color('#1a2238'),
    }),
    [],
  );
  const reduce = useMemo(() => reducedMotion(), []);
  const sky = useRef(new THREE.Color(island.biome.sky));
  const sun = useRef<THREE.DirectionalLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const pts = useRef<THREE.PointLight[]>([]);

  useFrame((state, dt) => {
    const { camera, scene } = state;
    const p = player.pos;
    const t = state.clock.elapsedTime;
    const fpp = cam.fpp;
    // pivot: eye height in first person, shoulder height in third
    tmp.want.set(p.x, p.y + (fpp ? 1.62 : 1.5), p.z);
    const far = pivot.current.distanceTo(tmp.want);
    // far away (start, fast travel): swoop over; nearby: follow tightly. Reduced motion: cut.
    const k = reduce && far > 6 ? 1 : far > 6 ? 1 - Math.exp(-dt * 2.4) : fpp ? 1 : 1 - Math.exp(-dt * 14);
    pivot.current.lerp(tmp.want, k);
    const swoop = Math.min(10, Math.max(0, far - 4) * 0.22);

    const cp = Math.cos(cam.pitch);
    if (fpp) {
      // head-bob while walking
      const bob = player.grounded ? Math.sin(t * (player.sprinting ? 15 : 11)) * 0.045 * player.speed : 0;
      camera.position.set(pivot.current.x, pivot.current.y + bob + swoop, pivot.current.z);
      camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ');
    } else {
      // orbit behind the player; pull in if a block is in the way
      tmp.off.set(Math.sin(cam.yaw) * cp, -Math.sin(cam.pitch), Math.cos(cam.yaw) * cp);
      let d = cam.dist;
      for (let s = 1; s <= 12; s++) {
        const dd = (cam.dist * s) / 12;
        tmp.probe.copy(pivot.current).addScaledVector(tmp.off, dd);
        if (world.blockAt(tmp.probe.x, tmp.probe.y, tmp.probe.z)) {
          d = Math.max(1.2, dd - 0.6);
          break;
        }
      }
      camera.position.copy(pivot.current).addScaledVector(tmp.off, d);
      camera.position.x += document.pointerLockElement ? 0 : pointer.x * 0.4;
      camera.position.y += swoop;
      camera.lookAt(pivot.current);
    }
    // sprinting widens the view a little
    const pc = camera as THREE.PerspectiveCamera;
    const fov = (fpp ? 70 : 50) + (player.sprinting ? 8 : 0);
    if (Math.abs(pc.fov - fov) > 0.05) {
      pc.fov += (fov - pc.fov) * (1 - Math.exp(-dt * 8));
      pc.updateProjectionMatrix();
    }

    const wantSky = colors.want.set(island.biome.sky);
    if (night) wantSky.lerp(colors.night, 0.78);
    sky.current.lerp(wantSky, 1 - Math.exp(-dt * 2.5));
    scene.background = sky.current;
    // gradient: deeper colour overhead, the biome colour near the horizon
    skyUniforms.top.value.copy(sky.current).multiplyScalar(0.72);
    skyUniforms.bottom.value.copy(sky.current).lerp(night ? colors.horizonNight : colors.horizonDay, 0.25);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(skyUniforms.bottom.value);

    const light = island.biome.ambient * (night ? 0.45 : 1);
    hemi.current.intensity += (light * 1.1 - hemi.current.intensity) * 0.05;
    sun.current.intensity += (light * 1.6 - sun.current.intensity) * 0.05;
    sun.current.castShadow = quality.shadows;
    sun.current.position.set(p.x + 12, p.y + 20, p.z + 10);
    sun.current.target.position.copy(p);
    sun.current.target.updateMatrixWorld();

    // the three point lights sit at this island's lamps
    pts.current.forEach((pl, i) => {
      const l = island.lights[i];
      if (!l) return void (pl.intensity = 0);
      pl.position.set(...l.pos);
      pl.color.set(l.color);
      pl.intensity += ((night ? 14 : 8) - pl.intensity) * 0.05;
    });
  });

  return (
    <>
      <fog attach="fog" args={[island.biome.fog, 30, 110]} />
      <hemisphereLight ref={hemi} args={['#ffffff', '#445', 1]} />
      <directionalLight
        ref={sun}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={80}
      />
      {[0, 1, 2].map((i) => (
        <pointLight key={i} ref={(el) => void (el && (pts.current[i] = el))} distance={14} decay={1.5} />
      ))}
    </>
  );
}

function Water({ island }: { island: Island }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const g = c.getContext('2d')!;
    const r = seeded(21);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        g.fillStyle = ['#2f86c9', '#2a7bbd', '#3a93d6', '#2f86c9', '#5aa9e6'][Math.floor(r() * 5)];
        g.fillRect(x, y, 1, 1);
      }
    const t = new THREE.CanvasTexture(c);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(60, 30);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  useFrame((_, dt) => {
    const map = matRef.current?.map;
    if (!map) return;
    map.offset.x += dt * 0.08;
    map.offset.y += dt * 0.03;
  });
  const [x, y, z] = island.biome.center;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, y - 0.55, z + 8]} receiveShadow>
      <planeGeometry args={[60, 30]} />
      <meshLambertMaterial ref={matRef} map={tex} transparent opacity={0.85} />
    </mesh>
  );
}

export default function PlayScene({
  night,
  onReady,
  onIsland,
  onNear,
  onArrive,
  onBreak,
  onReact,
  onPickup,
}: {
  night: boolean;
  onReady?: () => void;
  onIsland: (i: number) => void;
  onNear: (i: number | null) => void;
  onArrive: (i: number) => void;
  onBreak: (b: Block) => void;
  onReact: (r: Reaction) => void;
  onPickup: (t: BlockType) => void;
}) {
  const world = useMemo(() => buildWorld(), []);
  const layers = useMemo(() => {
    const by = new Map<BlockType, Island['blocks']>();
    [...world.islands.flatMap((isl) => isl.blocks), ...world.extra].forEach((b) => by.set(b.t, [...(by.get(b.t) ?? []), b]));
    return [...by.entries()];
  }, [world]);
  const [current, setCurrent] = useState(0);
  const island = world.islands[current];
  const contact = world.islands.find((isl) => isl.biome.id === 'contact')!;
  // which instance of which layer each block is, so a broken one can be hidden
  const meshes = useRef(new Map<BlockType, THREE.InstancedMesh>());
  const onMesh = useCallback((t: BlockType, m: THREE.InstancedMesh) => void meshes.current.set(t, m), []);
  const index = useMemo(() => {
    const m = new Map<Block, { t: BlockType; i: number }>();
    layers.forEach(([t, bl]) => bl.forEach((b, i) => m.set(b, { t, i })));
    return m;
  }, [layers]);
  const hideBlock = useCallback(
    (b: Block) => {
      const e = index.get(b);
      const mesh = e && meshes.current.get(e.t);
      if (!e || !mesh) return;
      mesh.setMatrixAt(e.i, ZERO);
      mesh.instanceMatrix.needsUpdate = true;
    },
    [index],
  );
  const openNearby = useCallback(() => {
    if (hud.near !== null) onArrive(hud.near);
  }, [onArrive]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 50, near: 0.1, far: 400, position: [-20, 30, 40] }}
      gl={{ antialias: false }}
      shadows
      onCreated={() => onReady?.()}
    >
      <PlayerController
        world={world}
        onIsland={(i) => {
          setCurrent(i);
          onIsland(i);
        }}
        onNear={onNear}
        onArrive={onArrive}
        onReact={onReact}
      />
      <QualityGuard />
      <SkyDome night={night} />
      <Rig island={island} night={night} world={world} />
      {layers.map(([t, blocks]) => (
        <BlockLayer key={t} type={t} blocks={blocks} onMesh={onMesh} />
      ))}
      {world.islands.map((isl, i) => (
        <Landmark key={isl.biome.id} island={isl} index={i} />
      ))}
      {world.islands.map((isl) => (
        <Sign key={`sign-${isl.biome.id}`} island={isl} />
      ))}
      <Aim world={world} hideBlock={hideBlock} onBreak={onBreak} onUse={openNearby} onReact={onReact} onPickup={onPickup} />
      <Hand />
      <CloudSea night={night} />
      <Waterfalls islands={world.islands} />
      <Avatar />
      <Drone />
      <Particles island={island} />
      {world.islands.map((w) => w.fire && <Campfire key={w.biome.id} at={w.fire} />)}
      <Water island={contact} />
      <Clouds />
      <Stars visible={night || ['achievements', 'skills', 'projects'].includes(island.biome.id)} />
    </Canvas>
  );
}
