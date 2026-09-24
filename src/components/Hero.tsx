import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PROFILE } from '../data';
import { ResumeLink } from './ResumeViewer';

function useIndiaTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const ease = [0.2, 0.8, 0.2, 1] as const;

const rise: Variants = {
  hidden: { y: '110%' },
  show: (i: number) => ({ y: '0%', transition: { duration: 1.1, delay: 0.2 + i * 0.07, ease } }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.55 + i * 0.1, ease } }),
};

export const Hero = () => {
  const time = useIndiaTime();
  const reduce = useReducedMotion();
  const init = reduce ? false : 'hidden';

  return (
    <section id="top" className="relative px-5 md:px-10">
      <div className="mx-auto flex min-h-[100svh] max-w-page flex-col pb-6 pt-20 md:pb-8">
        {/* The 3D cube is placed into this box (Scene3D reads its position) */}
        <div id="hero-stage" aria-hidden className="min-h-[30svh] flex-1" />

        <div className="text-center">
          <motion.p
            variants={fade}
            initial={init}
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-mute"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-lime" />
            </span>
            <span className="sm:hidden">Now at IBM India Software Labs</span>
            <span className="hidden sm:inline">Now — Agentic AI @ IBM India Software Labs</span>
          </motion.p>

          <h1
            className="display mt-5 select-none text-[15.5vw] text-paper md:text-[9vw] xl:text-[8.5rem]"
            aria-label={PROFILE.name}
          >
            {['Devansh', 'Rai'].map((w, i) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                <motion.span className="inline-block" variants={rise} initial={init} animate="show" custom={i}>
                  {w}
                  {i === 0 ? ' ' : <span className="font-serif font-normal italic tracking-normal text-lime">.</span>}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            variants={fade}
            initial={init}
            animate="show"
            custom={1}
            className="mx-auto mt-6 max-w-xl text-balance text-lg leading-snug text-paper/80 md:text-xl"
          >
            {PROFILE.intro}
          </motion.p>

          <motion.div
            variants={fade}
            initial={init}
            animate="show"
            custom={2}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em]"
          >
            <ResumeLink className="bg-lime px-5 py-3 text-ink transition-transform duration-300 hover:-translate-y-0.5">
              View résumé
            </ResumeLink>
            <a
              href="#work"
              className="border border-line px-5 py-3 text-paper transition-colors duration-300 hover:border-paper"
            >
              See my work ↓
            </a>
          </motion.div>
        </div>

        {/* Bottom meta row */}
        <motion.div
          variants={fade}
          initial={init}
          animate="show"
          custom={3}
          className="mt-12 flex items-center justify-between border-t border-line pt-4 label md:mt-16"
        >
          <span>India — {time} IST</span>
          <span className="hidden justify-center gap-5 text-paper md:flex">
            <a className="link-underline" href={PROFILE.github} target="_blank" rel="noopener">
              GitHub
            </a>
            <a className="link-underline" href={PROFILE.linkedin} target="_blank" rel="noopener">
              LinkedIn
            </a>
            <a className="link-underline" href={`mailto:${PROFILE.email}`}>
              Email
            </a>
          </span>
          <span>Graduating 2027</span>
        </motion.div>
      </div>
    </section>
  );
};
