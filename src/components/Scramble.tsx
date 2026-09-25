import { useEffect, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

/** Cycles through phrases, decoding each one from random glyphs like a terminal. */
export const Scramble = ({ phrases, hold = 2600 }: { phrases: string[]; hold?: number }) => {
  const [text, setText] = useState(phrases[0]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0;
    let frame = 0;
    let raf = 0;
    let timer = 0;
    let current = phrases[0];

    const decode = (to: string) => {
      const from = current;
      current = to;
      const len = Math.max(from.length, to.length);
      // each character settles at a random frame
      const q = Array.from({ length: len }, (_, k) => {
        const startAt = Math.floor(Math.random() * 12);
        return { from: from[k] ?? '', to: to[k] ?? '', start: startAt, end: startAt + 8 + Math.floor(Math.random() * 14) };
      });
      frame = 0;
      const step = () => {
        let out = '';
        let done = 0;
        for (const c of q) {
          if (frame >= c.end) {
            done++;
            out += c.to;
          } else if (frame >= c.start) {
            out += c.to === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else {
            out += c.from;
          }
        }
        setText(out);
        frame++;
        if (done < q.length) raf = requestAnimationFrame(step);
        else timer = window.setTimeout(next, hold);
      };
      raf = requestAnimationFrame(step);
    };

    const next = () => {
      i = (i + 1) % phrases.length;
      decode(phrases[i]);
    };
    timer = window.setTimeout(next, hold);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [phrases, hold]);

  return <span aria-live="off">{text}</span>;
};
