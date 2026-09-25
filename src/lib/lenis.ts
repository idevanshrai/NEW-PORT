import type Lenis from 'lenis';

let instance: Lenis | null = null;
/** The live Lenis smooth-scroll instance (null when reduced motion is on). */
export const getLenis = () => instance;
export const setLenis = (l: Lenis | null) => {
  instance = l;
};

/** Pause/resume page scrolling (used by modals, the menu, the terminal). */
export function lockScroll(lock: boolean) {
  const html = document.documentElement;
  html.style.overflow = lock ? 'hidden' : '';
  if (lock) instance?.stop();
  else instance?.start();
}
