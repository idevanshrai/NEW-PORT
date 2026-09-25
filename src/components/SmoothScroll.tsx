import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from '../lib/lenis';

export const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(lenis);

    let id = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    // In-page anchor links (#work, #contact…) scroll smoothly too
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.origin !== location.origin || !a.hash || a.pathname !== location.pathname) return;
      const el = document.querySelector(a.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -8, force: true });
      history.replaceState(null, '', a.hash);
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      setLenis(null);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
};
