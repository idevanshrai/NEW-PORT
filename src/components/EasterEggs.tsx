import { useEffect } from 'react';
import { emit, findSecret, toast } from '../lib/bus';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/** Invisible listeners for the small surprises around the site. */
export const EasterEggs = () => {
  useEffect(() => {
    // 1. Konami code → party cube
    let k = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0;
      if (k === KONAMI.length) {
        k = 0;
        emit('dr:cube', 'party');
        findSecret('konami');
      }
      // "?" → a nudge towards the fun stuff
      if (e.key === '?') toast('Try ⌘K for the command menu, or ` for the terminal.');
    };
    window.addEventListener('keydown', onKey);

    // 2. A note for anyone who opens dev tools
    console.log(
      '%c DR. %c Hi, fellow developer 👋  Type %cdevansh()%c here, or press ` on the page.',
      'background:#c8ff2e;color:#0d0d0b;font-weight:800;padding:2px 6px',
      'color:inherit',
      'color:#c8ff2e;font-weight:700',
      'color:inherit',
    );
    (window as unknown as { devansh: () => string }).devansh = () => {
      findSecret('console');
      emit('dr:cube', 'scramble');
      return 'Found you. The code for this site is at github.com/idevanshrai — say hi: idevanshrai@gmail.com';
    };

    // 3. Tab title when you look away
    let saved = document.title;
    const AWAY = '◻ come back, the cube misses you';
    const onVis = () => {
      if (document.hidden) {
        saved = document.title;
        document.title = AWAY;
      } else if (document.title === AWAY) document.title = saved;
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return null;
};
