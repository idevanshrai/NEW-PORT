import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useState } from 'react';
import { WORK } from '../data';
import { track } from '../lib/bus';
import { Reveal, SectionLabel } from './Reveal';

export const Work = () => {
  // Floating screenshot that follows the cursor over a project row (desktop only)
  const [hover, setHover] = useState<string | null>(null);
  const mx = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const my = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const preview = WORK.find((w) => w.name === hover)?.preview;

  return (
    <section
      id="work"
      className="relative px-5 py-28 md:px-10 md:py-40"
      onPointerMove={(e) => {
        mx.set(e.clientX);
        my.set(e.clientY);
      }}
    >
      <div className="mx-auto max-w-page md:pr-[22vw]">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <SectionLabel n="03">Selected work</SectionLabel>
          </div>
          <div className="md:col-span-9">
            <h2 className="display text-6xl text-paper md:text-[8vw]">
              Selected
              <span className="font-serif font-normal italic tracking-normal"> work</span>
            </h2>
            <p className="mt-6 max-w-lg text-mute">Three things I’d happily walk you through line by line — each has a full write-up.</p>
          </div>
        </div>

        <ul className="mt-16 border-b border-line md:mt-24">
          {WORK.map((p, i) => (
            <Reveal key={p.name} delay={0.05 * i}>
              <li
                className="group relative grid gap-5 border-t border-line py-10 md:grid-cols-12 md:gap-10 md:py-14"
                onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(p.name)}
                onPointerLeave={() => setHover(null)}
              >
                <span className="font-mono text-xs text-mute md:col-span-1">0{i + 1}</span>
                <div className="md:col-span-6">
                  <h3 className="display text-6xl text-paper transition-colors duration-300 group-hover:text-lime md:text-6xl xl:text-8xl">
                    {/* the whole row is clickable through this link's ::after */}
                    <a
                      href={p.slug ? `/work/${p.slug}` : p.repo}
                      onClick={() => track('project_open', { name: p.name, to: 'case-study' })}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {p.name}
                    </a>
                  </h3>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                    {p.kind} — {p.year}
                  </p>
                </div>
                <div className="flex flex-col justify-between gap-6 md:col-span-5">
                  <p className="max-w-md leading-relaxed text-paper/85">{p.blurb}</p>
                  <div className="flex items-end justify-between gap-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">{p.stack.join(' · ')}</p>
                    <span className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.12em]">
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noopener"
                        onClick={() => track('project_open', { name: p.name, to: 'repo' })}
                        className="relative z-10 text-mute link-underline hover:text-paper"
                      >
                        Code ↗
                      </a>
                      <span className="text-paper transition-transform duration-300 group-hover:translate-x-1 group-hover:text-lime">
                        Case study →
                      </span>
                    </span>
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.img
            key={preview}
            src={preview}
            alt=""
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[340px] -translate-x-1/2 -translate-y-1/2 border border-line shadow-2xl md:block"
            style={{ x: mx, y: my }}
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
