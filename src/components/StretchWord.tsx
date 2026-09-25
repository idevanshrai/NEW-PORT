import { useEffect, useRef } from 'react';

const BASE = 72; // resting font-stretch (%) — Archivo's width axis goes 62–125
const WIDE = 125; // where letters start on load
const PEAK = 108; // how wide a letter gets right under the cursor
const RADIUS = 220; // px — how far the cursor's influence reaches

/**
 * A word whose letters are individually stretchable. On load every letter
 * starts extra-wide and snaps to condensed, one after another. On desktop the
 * letters nearest the cursor widen, like the type is breathing around it.
 */
export const StretchWord = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>('[data-l]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      letters.forEach((l) => (l.style.fontStretch = `${BASE}%`));
      return;
    }
    const fine = window.matchMedia('(pointer: fine)').matches;
    const cur = letters.map(() => WIDE);
    const start = performance.now() + delay * 1000;
    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });

    let id = 0;
    const tick = (now: number) => {
      letters.forEach((l, i) => {
        // intro: each letter is released a little after the previous one
        const released = now > start + i * 55;
        let target = released ? BASE : WIDE;
        if (released && fine) {
          const r = l.getBoundingClientRect();
          const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
          if (d < RADIUS) target += (PEAK - BASE) * Math.pow(1 - d / RADIUS, 2);
        }
        cur[i] += (target - cur[i]) * 0.14;
        l.style.fontStretch = `${cur[i].toFixed(1)}%`;
      });
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('pointermove', onMove);
    };
  }, [delay]);

  return (
    <span ref={root} className={className} aria-hidden>
      {[...text].map((ch, i) => (
        <span key={i} data-l className="inline-block" style={{ fontStretch: `${WIDE}%` }}>
          {ch}
        </span>
      ))}
    </span>
  );
};
