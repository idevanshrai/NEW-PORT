import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { on } from '../lib/bus';

type T = { id: number; msg: string };
let seq = 0;

/** Little messages in the bottom-left corner (copied email, secrets found…). */
export const Toasts = () => {
  const [items, setItems] = useState<T[]>([]);

  useEffect(
    () =>
      on('dr:toast', (msg) => {
        const id = ++seq;
        setItems((xs) => [...xs.slice(-2), { id, msg }]);
        setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200);
      }),
    [],
  );

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-5 z-[120] flex flex-col gap-2 md:bottom-8 md:left-10">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="border border-line bg-char px-4 py-3 font-mono text-[12px] tracking-[0.04em] text-paper shadow-2xl"
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
