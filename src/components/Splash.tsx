import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const KEY = 'dr:seen-intro';

function shouldShow() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return !localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

/** ~1s intro, first visit only. Any key, click or scroll skips it. */
export const Splash = () => {
  const [show, setShow] = useState(shouldShow);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!show) return;
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* private mode — fine */
    }
    const start = performance.now();
    let id = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 850);
      setN(Math.round(p * 100));
      if (p < 1) id = requestAnimationFrame(tick);
      else setTimeout(() => setShow(false), 150);
    };
    id = requestAnimationFrame(tick);
    const skip = () => setShow(false);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('wheel', skip);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-between bg-ink px-5 pb-6 md:px-10 md:pb-10"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
        >
          <span className="label">Devansh Rai — Portfolio ’26</span>
          <span className="display text-[22vw] leading-none text-paper md:text-[12vw] tabular-nums">
            {String(n).padStart(3, '0')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
