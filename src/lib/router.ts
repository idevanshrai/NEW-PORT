import { useSyncExternalStore } from 'react';
import { getLenis } from './lenis';

/**
 * A ~40-line client-side router — enough for a portfolio (home, case studies,
 * writing, 404) without pulling in a routing library.
 */
const NAV = 'dr:navigate';

const subscribe = (cb: () => void) => {
  window.addEventListener('popstate', cb);
  window.addEventListener(NAV, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener(NAV, cb);
  };
};

export const usePath = () => useSyncExternalStore(subscribe, () => window.location.pathname);

export function navigate(to: string) {
  const url = new URL(to, window.location.origin);
  if (url.pathname + url.search === window.location.pathname + window.location.search) {
    if (url.hash) scrollToHash(url.hash);
    return;
  }
  window.history.pushState(null, '', url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(NAV));
  // wait for the new page to render, then scroll
  requestAnimationFrame(() =>
    requestAnimationFrame(() => (url.hash ? scrollToHash(url.hash) : jumpTop())),
  );
}

function jumpTop() {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -8, force: true });
  else el.scrollIntoView({ behavior: 'smooth' });
}

/** Intercept clicks on internal <a href="/..."> links anywhere on the page. */
export function installLinkInterceptor() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a');
    if (!a || a.target || a.hasAttribute('download') || a.origin !== window.location.origin) return;
    if (/\.[a-z0-9]+$/i.test(a.pathname)) return; // real files like /resume.pdf
    if (a.pathname === window.location.pathname) return; // same page: SmoothScroll handles #hash
    e.preventDefault();
    navigate(a.pathname + a.search + a.hash);
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
