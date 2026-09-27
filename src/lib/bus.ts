import { track as vercelTrack } from '@vercel/analytics';

/** Tiny app-wide event bus (window CustomEvents) so far-apart components can talk. */
export type CubeAction = 'scramble' | 'solve' | 'party' | 'explode';

type Events = {
  'dr:cube': CubeAction;
  'dr:toast': string;
  'dr:palette': 'open' | 'close' | 'toggle';
  'dr:terminal': 'open' | 'close' | 'toggle';
  'dr:open-doc': { url: string; title: string; filename: string };
  'dr:theme': 'light' | 'dark';
};

export function emit<K extends keyof Events>(name: K, detail: Events[K]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<K extends keyof Events>(name: K, cb: (detail: Events[K]) => void) {
  const h = (e: Event) => cb((e as CustomEvent<Events[K]>).detail);
  window.addEventListener(name, h);
  return () => window.removeEventListener(name, h);
}

export const toast = (msg: string) => emit('dr:toast', msg);

/**
 * Custom analytics events. Note: Vercel only records custom events on paid plans;
 * on the free plan these calls are harmless no-ops.
 */
export function track(name: string, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(name, props);
  } catch {
    /* analytics must never break the site */
  }
}

/* ── Secrets (easter eggs) ─────────────────────────────────────────────── */

export const SECRETS = {
  terminal: 'Opened the hidden terminal',
  konami: 'Entered the Konami code',
  cube: 'Clicked the cube five times',
  solved: 'Watched the cube solve itself',
  sudo: 'Tried to sudo-hire me',
  light: 'Switched to light mode',
  console: 'Said hi in the dev console',
  lost: 'Found the 404 page',
  played: 'Loaded into play mode',
  explorer: 'Visited every island in play mode',
} as const;
export type SecretId = keyof typeof SECRETS;

const KEY = 'dr:secrets';

export function foundSecrets(): SecretId[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function findSecret(id: SecretId) {
  const have = foundSecrets();
  if (have.includes(id)) return;
  const next = [...have, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  const total = Object.keys(SECRETS).length;
  toast(`✳ Secret ${next.length}/${total}: ${SECRETS[id]}`);
  track('secret_found', { id, count: next.length });
}
