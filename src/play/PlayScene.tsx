import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOCKS, textures, type BlockType } from './textures';
import { buildWorld, type Island } from './world';
import { avatarMaterials } from './avatar';

/* ─────────────────────────────────────────────────────────────────────────
 * The play-mode 3D world. Everything is drawn from primitives and textures
 * generated in textures.ts: blocks, the avatar, the drone, particles.
 * ───────────────────────────────────────────────────────────────────────── */

const pointer = { x: 0, y: 0 };

/** seeded random so particles/stars are laid out the same every time */
function seeded(seed: number) {
  let v = seed;
  return () => {
    v = (v * 16807) % 2147483647;
    return (v - 1) / 2147483646;
  };
}

/** All blocks of one type → one InstancedMesh (fast even with ~15k blocks). */
function BlockLayer({ type, blocks }: { type: BlockType; blocks: Island['blocks'] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
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

const WALK = 1.35; // seconds of walking in when you arrive on an island

function Avatar({ island }: { island: Island }) {
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
  const arriveAt = useRef<number | null>(null);

  useEffect(() => {
    arriveAt.current = null; // set on the next frame from the clock
  }, [island]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (arriveAt.current === null) arriveAt.current = t + 0.35;
    const since = t - arriveAt.current;
    const walking = since < WALK;
    const k = Math.min(1, Math.max(0, since / WALK));
    const eased = 1 - Math.pow(1 - k, 2);
    const [x, y, z] = island.avatarPos;

    // walk in from the left, then settle
    root.current.position.set(x - (1 - eased) * 3, y, z + (1 - eased) * 0.6);
    const faceWalk = Math.PI / 2 - 0.2;
    const faceCam = pointer.x * 0.3 - 0.35;
    const wantRot = walking ? faceWalk : faceCam;
    root.current.rotation.y += (wantRot - root.current.rotation.y) * (walking ? 0.25 : 0.08);

    // legs + arms: walk cycle, or idle
    const stride = walking ? Math.sin(t * 11) * 0.7 * (1 - k * 0.6) : 0;
    legL.current.rotation.x = stride;
    legR.current.rotation.x = -stride;
    const waveT = since - WALK - 0.2;
    const waving = waveT > 0 && waveT < 1.7;
    armL.current.rotation.x = walking ? -stride * 0.8 : Math.sin(t * 1.6) * 0.06;
    armL.current.rotation.z = walking ? 0 : 0.05;
    armR.current.rotation.x = waving ? -2.7 + Math.sin(t * 13) * 0.08 : walking ? stride * 0.8 : -Math.sin(t * 1.6) * 0.06;
    armR.current.rotation.z = waving ? -0.25 + Math.sin(t * 11) * 0.3 : -0.05;

    // breathing + a little bounce while walking
    body.current.position.y = walking ? Math.abs(Math.sin(t * 11)) * 0.05 : Math.sin(t * 2) * 0.012;

    // head follows the cursor once standing
    const hy = walking ? 0 : pointer.x * 0.6;
    const hx = walking ? 0 : -pointer.y * 0.3;
    head.current.rotation.y += (hy - head.current.rotation.y) * 0.1;
    head.current.rotation.x += (hx - head.current.rotation.x) * 0.1;

    // blink every few seconds
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

/* ── the companion: a little robot drone (a nod to the robotics days) ───── */
function Drone({ island }: { island: Island }) {
  const g = useRef<THREE.Group>(null!);
  const rotors = useRef<THREE.Group>(null!);
  const pos = useRef(new THREE.Vector3(...island.avatarPos));

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const [x, y, z] = island.avatarPos;
    const target = new THREE.Vector3(x + 1.1 + pointer.x * 0.9, y + 2.3 + Math.sin(t * 2.2) * 0.12 + pointer.y * 0.4, z + 0.6);
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

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const m = new THREE.Matrix4();
    const [cx, cy, cz] = island.avatarPos;
    data.forEach((d, i) => {
      d.y += d.v * dt * style.dir * 0.6;
      if (d.y > 10) d.y = 0;
      if (d.y < 0) d.y = 10;
      const x = cx - 3 + d.x + Math.sin(t * 0.8 + d.p) * 0.4;
      const z = cz + d.z;
      m.makeRotationY(t + d.p);
      m.setPosition(x, cy - 2 + d.y, z);
      m.scale(new THREE.Vector3(style.size, style.size, style.size));
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
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = new THREE.Matrix4();
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

/* ── camera + sky: fly between islands ─────────────────────────────────── */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Rig({ island, night, narrow }: { island: Island; night: boolean; narrow: boolean }) {
  const from = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
  const cur = useRef({ pos: new THREE.Vector3(-20, 30, 40), look: new THREE.Vector3(0, 0, 0) });
  const t = useRef(1);
  const sky = useRef(new THREE.Color(island.biome.sky));
  const sun = useRef<THREE.DirectionalLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const pts = useRef<THREE.PointLight[]>([]);

  const target = useMemo(() => {
    const [x, y, z] = island.avatarPos;
    // phones: character in the upper middle, panel sits below; desktop: character right, panel left
    // closer framing so the character reads clearly (like a third-person game camera)
    const pos = narrow ? new THREE.Vector3(x - 0.4, y + 2.4, z + 8) : new THREE.Vector3(x - 3.9, y + 2.3, z + 7.6);
    const look = narrow ? new THREE.Vector3(x - 0.2, y + 0.4, z) : new THREE.Vector3(x - 2.5, y + 1.25, z);
    return { pos, look };
  }, [island, narrow]);

  useEffect(() => {
    from.current.pos.copy(cur.current.pos);
    from.current.look.copy(cur.current.look);
    t.current = 0;
  }, [target]);

  useFrame((state, dt) => {
    const { camera, scene } = state;
    t.current = Math.min(1, t.current + dt / 1.6);
    const k = ease(t.current);
    cur.current.pos.lerpVectors(from.current.pos, target.pos, k);
    cur.current.pos.y += Math.sin(k * Math.PI) * Math.min(12, from.current.pos.distanceTo(target.pos) * 0.12);
    cur.current.look.lerpVectors(from.current.look, target.look, k);
    // gentle parallax with the cursor once arrived
    camera.position.set(cur.current.pos.x + pointer.x * 0.5 * k, cur.current.pos.y + pointer.y * 0.3 * k, cur.current.pos.z);
    camera.lookAt(cur.current.look);

    const want = new THREE.Color(island.biome.sky);
    if (night) want.lerp(new THREE.Color('#05070f'), 0.78);
    sky.current.lerp(want, 1 - Math.exp(-dt * 2.5));
    scene.background = sky.current;
    // gradient: deeper colour overhead, the biome colour near the horizon
    skyUniforms.top.value.copy(sky.current).multiplyScalar(0.72);
    skyUniforms.bottom.value.copy(sky.current).lerp(new THREE.Color(night ? '#1a2238' : '#ffffff'), 0.25);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(skyUniforms.bottom.value);

    const light = island.biome.ambient * (night ? 0.45 : 1);
    hemi.current.intensity += (light * 1.1 - hemi.current.intensity) * 0.05;
    sun.current.intensity += (light * 1.6 - sun.current.intensity) * 0.05;
    sun.current.position.set(island.avatarPos[0] + 12, island.avatarPos[1] + 20, island.avatarPos[2] + 10);
    sun.current.target.position.set(...island.avatarPos);
    sun.current.target.updateMatrixWorld();

    // move the three point lights to this island's lamps
    pts.current.forEach((p, i) => {
      const l = island.lights[i];
      if (!l) return void (p.intensity = 0);
      p.position.set(...l.pos);
      p.color.set(l.color);
      p.intensity += ((night ? 14 : 8) - p.intensity) * 0.05;
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
  if (island.biome.id !== 'contact') return null;
  const [x, y, z] = island.biome.center;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, y - 0.55, z + 8]} receiveShadow>
      <planeGeometry args={[60, 30]} />
      <meshLambertMaterial ref={matRef} map={tex} transparent opacity={0.85} />
    </mesh>
  );
}

export default function PlayScene({ slot, night, onReady }: { slot: number; night: boolean; onReady?: () => void }) {
  const world = useMemo(() => buildWorld(), []);
  const layers = useMemo(() => {
    const by = new Map<BlockType, Island['blocks']>();
    world.forEach((isl) => isl.blocks.forEach((b) => by.set(b.t, [...(by.get(b.t) ?? []), b])));
    return [...by.entries()];
  }, [world]);
  const island = world[Math.min(slot, world.length - 1)];
  const narrow = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 50, near: 0.1, far: 400, position: [-20, 30, 40] }}
      gl={{ antialias: false }}
      shadows
      onCreated={() => onReady?.()}
    >
      <SkyDome night={night} />
      <Rig island={island} night={night} narrow={narrow} />
      {layers.map(([t, blocks]) => (
        <BlockLayer key={t} type={t} blocks={blocks} />
      ))}
      <Avatar island={island} />
      <Drone island={island} />
      <Particles island={island} />
      {world.map((w) => w.fire && <Campfire key={w.biome.id} at={w.fire} />)}
      <Water island={island} />
      <Clouds />
      <Stars visible={night || ['achievements', 'skills', 'projects'].includes(island.biome.id)} />
    </Canvas>
  );
}
