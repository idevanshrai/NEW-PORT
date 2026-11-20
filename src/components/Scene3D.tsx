import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { findSecret, on, toast, track } from '../lib/bus';

/**
 * Scroll-driven scene: 27 blocks that re-arrange themselves as you move
 * through the page. Each page section (by id) owns one "formation"; between
 * two section centres the blocks interpolate from one formation to the next.
 *
 *  hero        → a 3×3×3 Rubik's cube that keeps scrambling itself, layer by layer
 *  about       → it breaks apart into a loose cloud
 *  experience  → the pieces stack into a tall column (a timeline)
 *  work        → three 3×3 tiles, one per featured project
 *  lab         → a wide, shallow wall of small pieces
 *  github      → a bar chart, like the contribution graph beside it
 *  contact     → back together (still twisting), with the lime block pushed out toward you
 *
 * On top of that:
 *  - the pieces fly outward on a curved path mid-transition and tumble as they go
 *  - scrolling fast blows the whole thing apart; it springs back when you stop
 *  - on desktop the pieces duck away from your cursor
 */

const N = 27;
const ACCENT = 26; // a corner block — the lime one (the Rubik moves carry it around)
const SECTIONS = ['top', 'about', 'experience', 'work', 'lab', 'github', 'contact'] as const;

type Pose = { p: THREE.Vector3; r: THREE.Euler; s: number };
type Formation = Pose[];

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const e = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);

// Deterministic pseudo-random so the layout is the same on every load.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function grid3(i: number) {
  return [(i % 3) - 1, (Math.floor(i / 3) % 3) - 1, Math.floor(i / 9) - 1];
}

// ─── Rubik's cube ────────────────────────────────────────────────────────────
// Each block remembers its grid slot (-1..1 on each axis) and its orientation.
// A "move" turns one layer 90° around x, y or z. We animate the turn, then
// bake the result into the grid slot + orientation, and start the next move.
const GAP = 1.08;
const AXES = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
type Cubie = { g: THREE.Vector3; q: THREE.Quaternion };
type Move = { axis: 0 | 1 | 2; layer: -1 | 0 | 1; dir: 1 | -1; t: number; dur: number; undo?: boolean };

class Rubik {
  cubies: Cubie[];
  move: Move | null = null;
  wait = 0.6;
  last = -1;
  /** every move made since solved — replaying it backwards solves the cube */
  history: Move[] = [];
  queue: Move[] = [];
  solving = false;
  private onSolved: ((moves: number) => void) | null = null;
  setOnSolved(cb: ((moves: number) => void) | null) {
    this.onSolved = cb;
  }
  private solveCount = 0;
  private rnd = rng(42);
  private rq = new THREE.Quaternion();

  constructor() {
    this.cubies = Array.from({ length: N }, (_, i) => {
      const [x, y, z] = grid3(i);
      return { g: new THREE.Vector3(x, y, z), q: new THREE.Quaternion() };
    });
  }

  /** A burst of quick random twists. */
  scramble(n = 8) {
    if (this.solving) return;
    for (let i = 0; i < n; i++) this.queue.push({ ...this.random(), dur: 0.14 });
    this.wait = 0;
  }

  /** Snap every piece home (used when there are too many moves to replay). */
  reset() {
    const n = this.history.length + (this.move ? 1 : 0);
    this.cubies.forEach((c, i) => {
      const [x, y, z] = grid3(i);
      c.g.set(x, y, z);
      c.q.identity();
    });
    this.move = null;
    this.queue = [];
    this.history = [];
    this.wait = 3.5;
    this.onSolved?.(n);
  }

  /**
   * Undo every move since the cube was last solved, quickly.
   * Returns false when the history is too long to replay nicely — the caller
   * then hides a reset() behind an explosion instead.
   */
  solve(): boolean {
    if (this.solving) return true;
    if (this.history.length > 45) return false;
    // include the twist that's mid-animation right now — it lands in history when it finishes
    const moves = this.move ? [...this.history, this.move] : [...this.history];
    if (!moves.length) {
      this.onSolved?.(0);
      return true;
    }
    const dur = Math.min(0.22, Math.max(0.07, 7 / Math.max(1, moves.length)));
    this.queue = moves
      .slice()
      .reverse()
      .map((m) => ({ axis: m.axis, layer: m.layer, dir: (-m.dir) as 1 | -1, t: 0, dur, undo: true }));
    this.solveCount = this.queue.length;
    this.solving = true;
    this.wait = 0;
    return true;
  }

  private next(): Move {
    const q = this.queue.shift();
    if (q) return q;
    return this.random();
  }

  private random(): Move {
    let axis: 0 | 1 | 2;
    do axis = Math.floor(this.rnd() * 3) as 0 | 1 | 2;
    while (axis === this.last); // never twist the same axis twice in a row
    this.last = axis;
    const layer = (Math.floor(this.rnd() * 3) - 1) as -1 | 0 | 1;
    const dir = this.rnd() > 0.5 ? 1 : -1;
    // every few moves, a fast double-flick
    const dur = this.rnd() > 0.8 ? 0.22 : 0.42;
    return { axis, layer, dir, t: 0, dur };
  }

  update(dt: number, speed: number) {
    if (!this.move) {
      this.wait -= dt * speed;
      if (this.wait <= 0) this.move = this.next();
      return;
    }
    this.move.t += (dt * speed) / this.move.dur;
    if (this.move.t >= 1) {
      const { axis, layer, dir, undo } = this.move;
      this.rq.setFromAxisAngle(AXES[axis], (dir * Math.PI) / 2);
      for (const c of this.cubies) {
        if (Math.round(c.g.getComponent(axis)) !== layer) continue;
        c.g.applyQuaternion(this.rq).round();
        c.q.premultiply(this.rq);
      }
      if (undo) this.history.pop();
      else this.history.push(this.move);
      this.move = null;
      this.wait = this.queue.length ? 0 : this.rnd() > 0.7 ? 0.5 : 0.08;
      if (this.solving && !this.queue.length) {
        this.solving = false;
        this.history = [];
        this.wait = 3.5; // hold the solved cube so people can see it
        this.onSolved?.(this.solveCount);
      }
    }
  }

  /** Writes the live pose of block i (mid-twist included) into p / q. */
  pose(i: number, p: THREE.Vector3, q: THREE.Quaternion) {
    const c = this.cubies[i];
    p.copy(c.g).multiplyScalar(GAP);
    q.copy(c.q);
    const m = this.move;
    if (m && Math.round(c.g.getComponent(m.axis)) === m.layer) {
      // ease-in-out-back: overshoots a hair and snaps into place
      const x = m.t;
      const c1 = 1.2, c2 = c1 * 1.525;
      const e =
        x < 0.5
          ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
          : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
      this.rq.setFromAxisAngle(AXES[m.axis], (m.dir * Math.PI * e) / 2);
      p.applyQuaternion(this.rq);
      q.premultiply(this.rq);
    }
  }
}

function buildFormations(): Formation[] {
  const r = rng(7);
  const gap = GAP;

  const cube: Formation = Array.from({ length: N }, (_, i) => {
    const [x, y, z] = grid3(i);
    return { p: v(x * gap, y * gap, z * gap), r: e(), s: 1 };
  });

  const cloud: Formation = Array.from({ length: N }, (_, i) => {
    const [x, y, z] = grid3(i);
    const push = 1.35 + r() * 0.5;
    return {
      p: v(x * push + (r() - 0.5) * 0.5, y * push * 1.3 + (r() - 0.5) * 0.5, z * push * 0.7),
      r: e(r() * Math.PI, r() * Math.PI, r() * Math.PI),
      s: 0.45 + r() * 0.3,
    };
  });

  // 9 levels × 3 blocks, slightly twisted per level
  const column: Formation = Array.from({ length: N }, (_, i) => {
    const level = Math.floor(i / 3);
    const k = i % 3;
    const twist = level * 0.22;
    const x = (k - 1) * 0.72;
    return {
      p: v(Math.cos(twist) * x, (level - 4) * 0.74, Math.sin(twist) * x),
      r: e(0, twist, 0),
      s: 0.66,
    };
  });

  // three 3×3 tiles, fanned out
  const tiles: Formation = Array.from({ length: N }, (_, i) => {
    const t = Math.floor(i / 9);
    const j = i % 9;
    const x = (j % 3) - 1;
    const y = Math.floor(j / 3) - 1;
    const cx = (t - 1) * 0.6;
    const cy = (1 - t) * 2.7;
    const cz = (t - 1) * -1.1;
    return { p: v(cx + x * 0.62, cy + y * 0.62, cz), r: e(0.1, -0.5 + t * 0.2, 0), s: 0.56 };
  });

  // a tall, shallow shelf: 3 wide × 9 high, each piece nudged forward/back
  const wall: Formation = Array.from({ length: N }, (_, i) => {
    const x = (i % 3) - 1;
    const y = Math.floor(i / 3) - 4;
    return { p: v(x * 0.62, y * 0.62, (r() - 0.5) * 0.9), r: e(0, -0.4, 0), s: 0.5 };
  });

  // bar chart: 3 columns wide × 9 rows deep, heights vary like a contribution graph
  const heights = [0.4, 1.1, 0.7, 1.9, 1.3, 2.6, 0.9, 1.6, 2.2];
  const bars: Formation = Array.from({ length: N }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const h = heights[(row + col * 4) % 9];
    return {
      p: v((col - 1) * 0.55, h * 0.5 - 1.4, (row - 4) * 0.55),
      r: e(),
      s: 0.46,
      sy: h / 0.46,
    } as Pose & { sy: number };
  });

  const home: Formation = cube.map((c, i) =>
    i === ACCENT
      ? { p: v(-1.2, 1.4, 2.8), r: e(0.5, 0.7, 0), s: 1.2 }
      : { p: c.p.clone().multiplyScalar(0.94), r: e(), s: 0.92 },
  );

  return [cube, cloud, column, tiles, wall, bars, home];
}

// Per-section placement of the whole group. On desktop the content of the
// middle sections leaves the right ~22% of the screen free (lg:pr-[22vw]);
// the blocks live in that gutter so they never sit on top of text.
//                  top   about  exp   work  lab   github contact
// X is a fraction of the visible half-width (1 = right edge), so it works on any screen shape.
// The gutter is 22vw wide → its centre sits at 0.78 of the half-width.
const GROUP_X =     [0.5,  0.78, 0.78, 0.78, 0.78, 0.78,  0.5];
const GROUP_S =     [1.0,  0.6,  0.8,  0.75, 0.85, 0.8,   1.0];
// Rough world-space width of each formation at scale 1 — used to shrink it into the gutter.
const FORM_W =      [3.4,  4.4,  2.4,  2.8,  2.2,  2.2,   3.4];
const GROUP_ROT_Y = [0.6,  0.2,  0.0,  0.3, -0.3, -0.7,   0.8];
// Phones: no free gutter, so the blocks fade right down between hero and contact.
const MOBILE_OPACITY = [1, 0, 0, 0, 0, 0, 0.18];
// Tablets / small laptops (768–1023px): the text uses the full width there (the
// gutter starts at lg), so the blocks fade out in the middle sections too.
const TABLET_OPACITY = [1, 0, 0, 0, 0, 0, 1];

const smooth = (t: number) => t * t * (3 - 2 * t);

const PAPER = new THREE.Color('#d8d6cc');
const LIME = new THREE.Color('#c8ff2e');
const PARTY = ['#c8ff2e', '#ff4fd8', '#7b61ff', '#29d3ff', '#ffb000', '#d8d6cc'].map((c) => new THREE.Color(c));

export type SceneMode = 'home' | 'broken';

// Scratch objects reused every frame (no allocations in the render loop)
const tmp = {
  m: new THREE.Matrix4(),
  p: new THREE.Vector3(),
  q: new THREE.Quaternion(),
  qa: new THREE.Quaternion(),
  qb: new THREE.Quaternion(),
  s: new THREE.Vector3(),
  pa: new THREE.Vector3(),
  pb: new THREE.Vector3(),
  rq: new THREE.Quaternion(),
  axis: new THREE.Vector3(),
  ray: new THREE.Raycaster(),
  plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
  hit: new THREE.Vector3(),
  ndc: new THREE.Vector2(),
};

// A random but fixed tumble axis per block, used while it travels between formations
const TUMBLE = Array.from({ length: N }, (_, i) => {
  const r = rng(100 + i);
  return new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
});

/** Pointer position in NDC, tracked on window (the canvas itself ignores pointer events). */
function usePointer() {
  const p = useRef({ x: 0, y: 0, active: false });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      p.current.active = e.pointerType === 'mouse';
    };
    const leave = () => (p.current.active = false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);
  return p;
}

function useSectionProgress() {
  const state = useRef({ index: 0, t: 0 });
  useEffect(() => {
    let centres: number[] = [];
    const measure = () => {
      centres = SECTIONS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return NaN;
        const r = el.getBoundingClientRect();
        const centre = r.top + window.scrollY + r.height / 2;
        // the last sections can't scroll to the middle of the screen — clamp so they still finish
        const maxCentre = document.documentElement.scrollHeight - window.innerHeight / 2 - 1;
        return Math.min(centre, maxCentre);
      });
    };
    const update = () => {
      if (!centres.length) measure();
      const c = window.scrollY + window.innerHeight / 2;
      let i = 0;
      while (i < centres.length - 1 && c > centres[i + 1]) i++;
      const a = centres[i];
      const b = centres[i + 1] ?? a;
      const t = b > a ? Math.min(1, Math.max(0, (c - a) / (b - a))) : 0;
      state.current = { index: i, t: c < a ? 0 : t };
    };
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(document.body);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, []);
  return state;
}

function Blocks({ still, mode }: { still: boolean; mode: SceneMode }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const formations = useMemo(() => buildFormations(), []);
  const progress = useSectionProgress();
  const { size, camera, viewport } = useThree();
  const pointer = usePointer();
  const [rubik] = useState(() => new Rubik());
  const fx = useRef({ partyUntil: 0, explodeUntil: 0, lastColor: 0, clicks: [] as number[], fixed: false });

  // Cube commands from the palette, terminal and easter eggs
  useEffect(() => {
    rubik.setOnSolved((n) => {
      if (n > 0) {
        toast(`Solved — ${n} moves, undone in reverse.`);
        findSecret('solved');
      } else toast('Already solved. Scramble it first!');
    });
    const now = () => performance.now() / 1000;
    const off = on('dr:cube', (a) => {
      track('cube', { action: a });
      if (a === 'scramble') rubik.scramble(10);
      else if (a === 'solve' && mode === 'broken') {
        // 404 page: pull the scattered pieces back into a cube
        if (!fx.current.fixed) {
          fx.current.fixed = true;
          toast('Fixed the cube. Still no page here, though.');
        } else rubik.solve();
      } else if (a === 'solve') {
        if (!rubik.solve()) {
          // too many moves to replay — blow it apart and put it back together solved
          fx.current.explodeUntil = now() + 1.1;
          setTimeout(() => rubik.reset(), 550);
        }
      }
      else if (a === 'party') {
        fx.current.partyUntil = now() + 6;
        rubik.scramble(16);
        toast('✳ Party mode ✳');
      } else if (a === 'explode') fx.current.explodeUntil = now() + 1.4;
    });
    // Click the cube in the hero: each click scrambles, five quick clicks blows it up
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#hero-stage')) return;
      const t = now();
      const clicks = (fx.current.clicks = [...fx.current.clicks.filter((c) => t - c < 2), t]);
      if (clicks.length >= 5) {
        fx.current.clicks = [];
        fx.current.explodeUntil = t + 1.4;
        findSecret('cube');
      } else rubik.scramble(4);
      track('cube', { action: 'click' });
    };
    document.addEventListener('click', onClick);
    return () => {
      off();
      document.removeEventListener('click', onClick);
      rubik.setOnSolved(null);
    };
  }, [rubik, mode]);
  const scroll = useRef({ y: 0, v: 0, burst: 0 });
  const narrow = size.width < 768;
  const tablet = !narrow && size.width < 1024;
  const stageRef = useRef<HTMLElement | null>(null);
  const started = useRef(false);

  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.09), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.62,
        metalness: 0.05,
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  // current (damped) state per instance
  const cur = useRef(
    formations[0].map((f) => ({
      p: f.p.clone(),
      q: new THREE.Quaternion().setFromEuler(f.r),
      s: new THREE.Vector3(f.s, f.s, f.s),
    })),
  );

  useEffect(() => {
    for (let i = 0; i < N; i++) mesh.current.setColorAt(i, i === ACCENT ? LIME : PAPER);
    mesh.current.instanceColor!.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const { index, t } = mode === 'broken' ? { index: fx.current.fixed ? 0 : 1, t: 0 } : still ? { index: 0, t: 0 } : progress.current;
    const A = formations[index];
    const B = formations[Math.min(index + 1, formations.length - 1)];
    const k = smooth(t);
    // first frame snaps into place (no fly-in from the middle of the screen)
    const damp = still || !started.current ? 1 : 1 - Math.exp(-dt * 5.5);
    started.current = true;
    const time = state.clock.elapsedTime;
    const g = group.current;
    const P = pointer.current;

    // ── scroll velocity → "burst" (0..1), springs back when scrolling stops
    const sc = scroll.current;
    const y = window.scrollY;
    const vel = (y - sc.y) / Math.max(dt, 1e-3);
    sc.y = y;
    sc.v += (vel - sc.v) * (1 - Math.exp(-dt * 10));
    // normal reading-speed scrolling keeps the formations intact; only a hard flick blows them apart
    const tnow = performance.now() / 1000;
    const exploding = tnow < fx.current.explodeUntil;
    const partying = tnow < fx.current.partyUntil;
    const targetBurst = still
      ? 0
      : exploding
        ? 1.6
        : Math.min(0.85, Math.max(0, (Math.abs(sc.v) - 1800) / 4000));
    sc.burst += (targetBurst - sc.burst) * (1 - Math.exp(-dt * (targetBurst > sc.burst ? 12 : 3)));

    // ── Rubik moves run whenever the cube is (partly) on screen; faster while you scroll
    const cubeWeight = index === 0 ? 1 - k : index === SECTIONS.length - 2 ? k : index === SECTIONS.length - 1 ? 1 : 0;
    if (!still && (cubeWeight > 0.01 || rubik.solving || rubik.queue.length))
      rubik.update(dt, rubik.solving ? 1 : 1 + sc.burst * 2.5 + (partying ? 1.5 : 0));

    // party: blocks flash through the palette for a few seconds
    if (partying && tnow - fx.current.lastColor > 0.12) {
      fx.current.lastColor = tnow;
      for (let i = 0; i < N; i++) mesh.current.setColorAt(i, PARTY[Math.floor(Math.random() * PARTY.length)]);
      mesh.current.instanceColor!.needsUpdate = true;
    } else if (!partying && fx.current.lastColor > 0) {
      fx.current.lastColor = 0;
      for (let i = 0; i < N; i++) mesh.current.setColorAt(i, i === ACCENT ? LIME : PAPER);
      mesh.current.instanceColor!.needsUpdate = true;
    }

    const LAST = formations.length - 1;
    const poseOf = (fi: number, i: number, p: THREE.Vector3, q: THREE.Quaternion) => {
      if (fi === 0 || (fi === LAST && i !== ACCENT)) {
        rubik.pose(i, p, q);
        if (fi === LAST) p.multiplyScalar(0.94);
      } else {
        p.copy(formations[fi][i].p);
        q.setFromEuler(formations[fi][i].r);
      }
    };

    // ── pointer in the group's local space (desktop only)
    let hasPointer = false;
    if (!still && !narrow && P.active) {
      tmp.ndc.set(P.x, P.y);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) {
        g.worldToLocal(tmp.hit);
        hasPointer = true;
      }
    }

    for (let i = 0; i < N; i++) {
      const a = A[i] as Pose & { sy?: number };
      const b = B[i] as Pose & { sy?: number };
      // Stagger each block a little so they don't move as one sheet
      const lag = Math.min(1, Math.max(0, k * 1.35 - (i / N) * 0.35));

      // pose A / B — the cube formations (hero + contact) come live from the Rubik engine
      poseOf(index, i, tmp.pa, tmp.qa);
      poseOf(Math.min(index + 1, formations.length - 1), i, tmp.pb, tmp.qb);
      tmp.p.lerpVectors(tmp.pa, tmp.pb, lag);
      tmp.q.slerpQuaternions(tmp.qa, tmp.qb, lag);

      // mid-flight: arc outward and tumble
      const flight = Math.sin(lag * Math.PI);
      if (flight > 0.001) {
        tmp.axis.copy(tmp.p).normalize();
        tmp.p.addScaledVector(tmp.axis, flight * 1.6);
        tmp.rq.setFromAxisAngle(TUMBLE[i], flight * Math.PI * 1.5);
        tmp.q.multiply(tmp.rq);
      }

      // scroll burst: blow outward + spin
      if (sc.burst > 0.001) {
        tmp.axis.copy(tmp.p);
        if (tmp.axis.lengthSq() < 0.01) tmp.axis.copy(TUMBLE[i]);
        tmp.axis.normalize();
        tmp.p.addScaledVector(tmp.axis, sc.burst * (1.8 + (i % 5) * 0.3));
        tmp.rq.setFromAxisAngle(TUMBLE[i], sc.burst * Math.PI * (i % 2 ? 1 : -1));
        tmp.q.multiply(tmp.rq);
      }

      // cursor: blocks near the pointer get pushed away and toward you
      if (hasPointer) {
        const dx = tmp.p.x - tmp.hit.x;
        const dy = tmp.p.y - tmp.hit.y;
        const d = Math.hypot(dx, dy);
        const R = 2.2;
        if (d < R) {
          const f = Math.pow(1 - d / R, 2);
          tmp.p.x += (dx / (d || 1)) * f * 1.3;
          tmp.p.y += (dy / (d || 1)) * f * 1.3;
          tmp.p.z += f * 1.6;
        }
      }

      // gentle idle bob so it never looks frozen
      if (!still) tmp.p.y += Math.sin(time * 0.8 + i * 0.7) * 0.03;

      const sa = a.s, sb = b.s;
      const s = sa + (sb - sa) * lag;
      const sya = a.sy ?? 1, syb = b.sy ?? 1;
      const sy = sya + (syb - sya) * lag;
      tmp.s.set(s, s * sy, s);

      const c = cur.current[i];
      c.p.lerp(tmp.p, damp);
      c.q.slerp(tmp.q, damp);
      c.s.lerp(tmp.s, damp);
      tmp.m.compose(c.p, c.q, c.s);
      mesh.current.setMatrixAt(i, tmp.m);
    }
    mesh.current.instanceMatrix.needsUpdate = true;

    // Whole group: position per section + sway + pointer tilt
    const j = Math.min(index + 1, SECTIONS.length - 1);
    const mix = (arr: number[]) => arr[index] + (arr[j] - arr[index]) * k;
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const pxToWorld = viewport.height / size.height;
    // hero/contact get ~40% of the screen, the middle sections get the 22vw gutter
    const room = (n: number) => (n === 0 || n === SECTIONS.length - 1 ? 0.4 : 0.2) * viewport.width;
    const fit = (n: number) => Math.min(GROUP_S[n], room(n) / FORM_W[n]);
    const place = (n: number) => {
      if (mode === 'broken') return { x: 0, y: narrow ? 2 : 1.9, s: narrow ? 0.45 : 0.62 };
      if (n === 0) {
        // Hero: sit inside the #hero-stage box (it scrolls with the page, so the cube does too)
        if (!stageRef.current) stageRef.current = document.getElementById('hero-stage');
        const r = stageRef.current?.getBoundingClientRect();
        if (r && r.height > 0) {
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          return {
            x: (cx / size.width) * 2 * halfW - halfW,
            y: halfH - (cy / size.height) * 2 * halfH,
            // ~3.9 world units ≈ the cube's on-screen size once tilted — it fills the gap and pokes out a little
            s: Math.min(1.1, (Math.min(r.width, r.height) * pxToWorld) / 3.9),
          };
        }
      }
      if (narrow) return { x: 0.3, y: -0.4, s: 0.62 };
      return { x: GROUP_X[n] * halfW, y: 0, s: fit(n) };
    };
    const pa = place(index);
    const pb = place(j);
    const gx = pa.x + (pb.x - pa.x) * k;
    const gy = pa.y + (pb.y - pa.y) * k;
    const gs = pa.s + (pb.s - pa.s) * k;
    g.position.x += (gx - g.position.x) * damp;
    g.position.y += (gy - g.position.y) * damp;
    const nextScale = g.scale.x + (gs - g.scale.x) * damp;
    g.scale.setScalar(nextScale);
    // gentle sway rather than a full spin, so flat formations never turn edge-on
    const sway = still ? 0 : Math.sin(time * 0.18) * 0.3;
    const px = P.active ? P.x : 0;
    const py = P.active ? P.y : 0;
    const targetY = mix(GROUP_ROT_Y) + (partying ? tnow * 2.5 : 0) + (mode === 'broken' ? tnow * 0.15 : 0) + sway + (still ? 0 : px * 0.3) + sc.burst * Math.sign(sc.v) * 0.6;
    const targetX = 0.35 + (still ? 0 : -py * 0.18);
    g.rotation.y += (targetY - g.rotation.y) * damp;
    g.rotation.x += (targetX - g.rotation.x) * damp;
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    const op = mode === 'broken' ? 1 : narrow ? mix(MOBILE_OPACITY) : tablet ? mix(TABLET_OPACITY) : 1;
    mat.opacity += (op - mat.opacity) * damp;
    mat.depthWrite = mat.opacity > 0.95;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geometry, material, N]} />
    </group>
  );
}

export default function Scene3D({ mode = 'home' }: { mode?: SceneMode }) {
  const still =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // With reduced motion the scene is drawn once and doesn't follow the scroll,
  // so the cube would float over every section. Show it only on the hero (and the 404).
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    if (!still || mode !== 'home') return;
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [still, mode]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 motion-safe:animate-fade ${pastHero ? 'invisible' : ''}`}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={still ? 'demand' : 'always'}
      >
        <hemisphereLight args={['#f4f2ea', '#1a1a17', 0.9]} />
        <directionalLight position={[6, 8, 6]} intensity={2.4} />
        <directionalLight position={[-6, -3, 4]} intensity={0.35} color="#b9c2d0" />
        <Blocks still={still} mode={mode} />
      </Canvas>
    </div>
  );
}
