import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};

/** "01 — About" style section header */
export const SectionLabel = ({ n, children }: { n: string; children: ReactNode }) => (
  <div className="flex items-center gap-3 label">
    <span className="text-lime">{n}</span>
    <span className="h-px w-8 bg-line" />
    <span>{children}</span>
  </div>
);
