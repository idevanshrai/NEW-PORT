import * as THREE from 'three';

/**
 * Shared, mutable state for the walkable world. It changes every frame, so it
 * lives outside React: the HUD writes input here, the 3D scene reads it and
 * writes the player back. React only hears about rare changes (which island
 * you're on, whether a landmark is in reach) through callbacks.
 */

/** Keyboard + joystick input. Joystick values are -1..1 (y = forward). */
export const input = { up: false, down: false, left: false, right: false, jump: false, sprint: false, mine: false, joyX: 0, joyY: 0 };

/**
 * The camera the visitor steers (mouse on desktop, a finger on phones).
 * yaw: radians around Y, 0 = looking along -z (towards the next island is +x).
 * pitch: radians, negative = looking down. dist: third-person distance; fpp: first person.
 */
export const cam = { yaw: 0, pitch: -0.42, dist: 9, fpp: false };

const PITCH = { tpp: [-1.25, 0.15], fpp: [-1.5, 1.5] } as const;
export function look(dx: number, dy: number) {
  cam.yaw -= dx;
  const [lo, hi] = cam.fpp ? PITCH.fpp : PITCH.tpp;
  cam.pitch = Math.min(hi, Math.max(lo, cam.pitch - dy));
}
export function setFpp(on: boolean) {
  cam.fpp = on;
  const [lo, hi] = on ? PITCH.fpp : PITCH.tpp;
  cam.pitch = Math.min(hi, Math.max(lo, on ? 0 : cam.pitch));
}
/** Scroll: zoom the third-person camera; all the way in switches to first person. */
export function zoom(delta: number) {
  if (cam.fpp) {
    if (delta > 0) {
      setFpp(false);
      cam.dist = 3.5;
    }
    return;
  }
  cam.dist = Math.min(16, cam.dist + delta);
  if (cam.dist < 3) setFpp(true);
}

export const player = {
  pos: new THREE.Vector3(),
  vy: 0,
  /** facing, radians around Y (0 = towards the camera) */
  yaw: 0.6,
  /** 0..1, how fast you're moving — drives the walk cycle */
  speed: 0,
  sprinting: false,
  grounded: true,
  /** clock time of the last arrival (start / fast travel) — the avatar waves */
  arrivedAt: 0,
  /** clock time of the last arm swing (hitting / mining) */
  swingAt: -10,
  /** auto-walk target (tap / click a landmark) */
  target: null as null | { island: number; pos: THREE.Vector3 },
};

/** Requests from the HUD to the scene, consumed on the next frame. */
export const requests = { travel: -1, use: false };

/** HUD element the scene rotates every frame to point at the next landmark. */
export const hud = { compass: null as HTMLElement | null, compassTarget: -1, panelOpen: false, near: null as number | null };

/** Quality, lowered once if the device can't keep up. */
export const quality = { shadows: true };

export const hasManualInput = () =>
  input.up || input.down || input.left || input.right || Math.abs(input.joyX) > 0.15 || Math.abs(input.joyY) > 0.15;

const KEYS: Record<string, keyof typeof input> = {
  w: 'up', arrowup: 'up',
  s: 'down', arrowdown: 'down',
  a: 'left', arrowleft: 'left',
  d: 'right', arrowright: 'right',
  ' ': 'jump',
  shift: 'sprint',
};

/** Returns true if the key is a movement key (so the caller can preventDefault). */
export function setKey(key: string, down: boolean) {
  const k = KEYS[key.toLowerCase()];
  if (!k) return false;
  (input[k] as boolean) = down;
  if (down && k !== 'jump' && k !== 'sprint') player.target = null; // manual control cancels auto-walk
  return true;
}

export function releaseAll() {
  input.up = input.down = input.left = input.right = input.jump = input.sprint = input.mine = false;
  input.joyX = input.joyY = 0;
}

export const isMoveKey = (key: string) => key.toLowerCase() in KEYS;

/**
 * Fresh start for a new visit to /play. This state is module-level, so it outlives
 * the page: without this, leaving and coming back would keep first person on, the
 * old camera angle, and clock times from the previous scene (each new canvas
 * restarts its clock at 0, so stale times make the arm swing for minutes).
 */
export function resetPlay() {
  releaseAll();
  Object.assign(cam, { yaw: 0, pitch: -0.42, dist: 9, fpp: false });
  Object.assign(player, { vy: 0, yaw: 0.6, speed: 0, sprinting: false, grounded: true, arrivedAt: 0, swingAt: -10, target: null });
  Object.assign(requests, { travel: -1, use: false });
  Object.assign(hud, { compass: null, compassTarget: -1, panelOpen: false, near: null });
  quality.shadows = true;
}
